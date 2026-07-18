"""
`python manage.py seed_calendar`

Idempotent seeding: update_or_create for districts/crops, bulk delete +
bulk_create for the 1,560 calendar rows (single transaction — far faster
than 1,560 individual upserts and always consistent). Also exports
data/calendar_master.csv as the auditable seed artefact.
"""
import csv
from pathlib import Path

from django.core.management.base import BaseCommand
from django.db import transaction

from calendar_app.models import Crop, CropCalendarWeek, District
from calendar_app.seed_data import CROPS, DISTRICTS, expand_calendar


class Command(BaseCommand):
    help = "Seed districts, crops and the 52-week crop calendar (idempotent)."

    @transaction.atomic
    def handle(self, *args, **options):
        district_map = {}
        for slug, name_en, name_ne, province, lat, lng, _offset in DISTRICTS:
            d, _ = District.objects.update_or_create(
                slug=slug,
                defaults={
                    "name_en": name_en,
                    "name_ne": name_ne,
                    "province": province,
                    "centroid_lat": lat,
                    "centroid_lng": lng,
                },
            )
            district_map[slug] = d

        crop_map = {}
        for code, name_en, name_ne, icon in CROPS:
            c, _ = Crop.objects.update_or_create(
                code=code,
                defaults={"name_en": name_en, "name_ne": name_ne, "icon": icon},
            )
            crop_map[code] = c

        rows = list(expand_calendar())

        CropCalendarWeek.objects.all().delete()
        CropCalendarWeek.objects.bulk_create(
            [
                CropCalendarWeek(
                    district=district_map[r["district_slug"]],
                    crop=crop_map[r["crop_code"]],
                    week_of_year=r["week_of_year"],
                    stage=r["stage"],
                    risk_notes_en=r["risk_notes_en"],
                    risk_notes_ne=r["risk_notes_ne"],
                )
                for r in rows
            ],
            batch_size=500,
        )

        # Export the auditable CSV artefact
        data_dir = Path(__file__).resolve().parents[3] / "data"
        data_dir.mkdir(exist_ok=True)
        csv_path = data_dir / "calendar_master.csv"
        with open(csv_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
            writer.writeheader()
            writer.writerows(rows)

        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded {len(district_map)} districts, {len(crop_map)} crops, "
                f"{len(rows)} calendar rows. CSV exported to {csv_path}."
            )
        )
