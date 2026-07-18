"""
DRF serializers with bilingual field selection.

Design decision: instead of duplicating serializers per language, the API
always returns BOTH languages by default (frontend toggles instantly
without a refetch — one request instead of two; the payload cost is tiny
at this scale), and `?lang=ne` trims to Nepali-only for
bandwidth-constrained clients.
"""
from rest_framework import serializers

from advisory.models import WeeklyAdvisory
from calendar_app.models import Crop, CropCalendarWeek, District


class DistrictSerializer(serializers.ModelSerializer):
    class Meta:
        model = District
        fields = ["id", "slug", "name_en", "name_ne", "province", "centroid_lat", "centroid_lng"]


class CropSerializer(serializers.ModelSerializer):
    class Meta:
        model = Crop
        fields = ["id", "code", "name_en", "name_ne", "icon"]


class CalendarWeekSerializer(serializers.ModelSerializer):
    class Meta:
        model = CropCalendarWeek
        fields = ["week_of_year", "stage", "risk_notes_en", "risk_notes_ne"]


class WeeklyAdvisorySerializer(serializers.ModelSerializer):
    district = serializers.SlugRelatedField(slug_field="slug", read_only=True)

    class Meta:
        model = WeeklyAdvisory
        fields = [
            "district",
            "for_week",
            "tmax_avg_c",
            "tmin_avg_c",
            "precip_total_mm",
            "summary_en",
            "summary_ne",
            "daily",
            "generated_at",
        ]


NE_ONLY_STRIP = ("_en",)


def localize(data, lang):
    """If lang=ne, drop *_en fields (recursively) to slim the payload."""
    if lang != "ne":
        return data
    if isinstance(data, list):
        return [localize(d, lang) for d in data]
    if isinstance(data, dict):
        return {
            k: localize(v, lang)
            for k, v in data.items()
            if not k.endswith(NE_ONLY_STRIP)
        }
    return data
