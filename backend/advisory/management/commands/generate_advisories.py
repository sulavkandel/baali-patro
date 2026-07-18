"""
`python manage.py generate_advisories`

Weekly job (cron / GitHub Action / container entrypoint) that refreshes
the current-week advisory for every district from Open-Meteo.
Idempotent: upserts on (district, for_week).
"""
from django.core.management.base import BaseCommand

from advisory.open_meteo import generate_all


class Command(BaseCommand):
    help = "Generate/refresh this week's Open-Meteo advisory for all districts."

    def handle(self, *args, **options):
        count = generate_all()
        self.stdout.write(self.style.SUCCESS(f"Generated advisories for {count} districts."))
