"""
Backend integration tests: seeding invariants, bilingual toggle,
calendar + compare endpoints, ISO-week edge cases, advisory summaries.
No network calls — Open-Meteo is exercised via its pure functions.
"""
import datetime as dt

import pytest
from django.core.management import call_command
from rest_framework.test import APIClient

from advisory.open_meteo import (
    WeekAggregate,
    aggregate_week,
    build_summaries,
    iso_week_thursday,
)
from calendar_app.models import Crop, CropCalendarWeek, District


@pytest.fixture(scope="module")
def seeded_db(django_db_setup, django_db_blocker):
    with django_db_blocker.unblock():
        call_command("seed_calendar")
    yield


@pytest.fixture
def client():
    return APIClient()


@pytest.mark.django_db
class TestSeeding:
    def test_counts(self, seeded_db):
        assert District.objects.count() == 5
        assert Crop.objects.count() == 6
        assert CropCalendarWeek.objects.count() == 5 * 6 * 52  # 1560

    def test_bilingual_names_present(self, seeded_db):
        for d in District.objects.all():
            assert d.name_ne, f"{d.slug} missing Nepali name"
        for c in Crop.objects.all():
            assert c.name_ne, f"{c.code} missing Nepali name"

    def test_idempotent(self, seeded_db):
        call_command("seed_calendar")
        assert CropCalendarWeek.objects.count() == 1560


@pytest.mark.django_db
class TestCalendarAPI:
    def test_calendar_returns_52_weeks(self, seeded_db, client):
        r = client.get("/api/v1/calendar/", {"district": "kailali", "crop": "paddy"})
        assert r.status_code == 200
        assert len(r.data["weeks"]) == 52
        assert r.data["crop"]["name_ne"] == "धान"

    def test_lang_ne_strips_english(self, seeded_db, client):
        r = client.get(
            "/api/v1/calendar/",
            {"district": "kailali", "crop": "paddy", "lang": "ne"},
        )
        assert r.status_code == 200
        assert "name_en" not in r.data["crop"]
        assert "risk_notes_en" not in r.data["weeks"][0]
        assert "risk_notes_ne" in r.data["weeks"][0]

    def test_unknown_district_404(self, seeded_db, client):
        r = client.get("/api/v1/calendar/", {"district": "mustang", "crop": "paddy"})
        assert r.status_code == 404

    def test_missing_params_400(self, seeded_db, client):
        assert client.get("/api/v1/calendar/").status_code == 400

    def test_compare_two_crops(self, seeded_db, client):
        r = client.get(
            "/api/v1/calendar/compare/",
            {"district": "kailali", "crops": "paddy,maize"},
        )
        assert r.status_code == 200
        assert set(r.data["calendars"].keys()) == {"paddy", "maize"}
        assert len(r.data["calendars"]["paddy"]) == 52

    def test_compare_requires_two(self, seeded_db, client):
        r = client.get(
            "/api/v1/calendar/compare/", {"district": "kailali", "crops": "paddy"}
        )
        assert r.status_code == 400


@pytest.mark.django_db
class TestAdvisoryAuth:
    def test_regenerate_requires_token(self, client):
        assert client.post("/api/v1/advisory/regenerate/").status_code == 401


class TestIsoWeek:
    def test_thursday_anchor(self):
        # 2026-01-05 is a Monday → Thursday of that ISO week is 2026-01-08
        assert iso_week_thursday(dt.date(2026, 1, 5)) == dt.date(2026, 1, 8)
        # A Thursday maps to itself
        assert iso_week_thursday(dt.date(2026, 1, 8)) == dt.date(2026, 1, 8)
        # Sunday belongs to the same ISO week as the preceding Thursday
        assert iso_week_thursday(dt.date(2026, 1, 11)) == dt.date(2026, 1, 8)

    def test_week53_year(self):
        # 2026-12-31 falls in ISO week 53 of 2026
        assert dt.date(2026, 12, 31).isocalendar().week == 53


class TestOpenMeteoPure:
    PAYLOAD = {
        "daily": {
            "time": ["2026-07-13", "2026-07-14"],
            "temperature_2m_max": [34.0, 36.0],
            "temperature_2m_min": [25.0, 26.0],
            "precipitation_sum": [40.0, 30.0],
        }
    }

    def test_aggregate(self):
        agg = aggregate_week(self.PAYLOAD)
        assert agg.tmax_avg == 35.0
        assert agg.precip_total == 70.0
        assert len(agg.daily) == 2

    def test_heavy_rain_bilingual_summary(self):
        agg = WeekAggregate(tmax_avg=32.0, tmin_avg=25.0, precip_total=80.0, daily=[])
        en, ne = build_summaries(agg)
        assert "Heavy rainfall" in en
        assert "भारी वर्षा" in ne

    def test_cold_stress_summary(self):
        agg = WeekAggregate(tmax_avg=18.0, tmin_avg=5.0, precip_total=0.0, daily=[])
        en, ne = build_summaries(agg)
        assert "frost" in en
        assert "तुषारो" in ne

    def test_empty_payload_safe(self):
        agg = aggregate_week({})
        assert agg.tmax_avg is None
        assert agg.precip_total is None
