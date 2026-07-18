"""
Core domain models for Baali-Patro.

Optimization notes (10-yr-dev review):
- Stage stored as short varchar with choices (not FK to a stage table):
  8 fixed values, never user-edited -> a lookup table adds a join for zero
  benefit. Choices give admin dropdowns + validation for free.
- unique constraint on (district, crop, week_of_year) enforces the
  1-row-per-week invariant at the DB level, plus a covering index that
  makes the main calendar query (district+crop -> 52 rows) an index scan.
- Bilingual fields are two flat columns (name_en / name_ne) instead of a
  translation table: exactly 2 languages, fixed forever by scope -> flat
  columns are simpler, faster and serialize trivially.
"""
from django.db import models


class District(models.Model):
    slug = models.SlugField(max_length=40, unique=True)
    name_en = models.CharField(max_length=80)
    name_ne = models.CharField(max_length=80)
    province = models.CharField(max_length=40)
    centroid_lat = models.DecimalField(max_digits=9, decimal_places=6)
    centroid_lng = models.DecimalField(max_digits=9, decimal_places=6)

    class Meta:
        ordering = ["name_en"]

    def __str__(self):
        return self.name_en


class Crop(models.Model):
    code = models.SlugField(max_length=20, unique=True)
    name_en = models.CharField(max_length=40)
    name_ne = models.CharField(max_length=40)
    icon = models.CharField(max_length=50, blank=True, default="")

    class Meta:
        ordering = ["name_en"]

    def __str__(self):
        return self.name_en


class Stage(models.TextChoices):
    FALLOW = "fallow", "Fallow"
    LAND_PREP = "land-prep", "Land preparation"
    SOWING = "sowing", "Sowing / transplanting"
    VEGETATIVE = "vegetative", "Vegetative growth"
    FLOWERING = "flowering", "Flowering"
    GRAIN_FILL = "grain-fill", "Grain fill / maturity"
    HARVEST = "harvest", "Harvest"
    POST_HARVEST = "post-harvest", "Post-harvest"


class CropCalendarWeek(models.Model):
    district = models.ForeignKey(
        District, on_delete=models.CASCADE, related_name="calendar_weeks"
    )
    crop = models.ForeignKey(
        Crop, on_delete=models.CASCADE, related_name="calendar_weeks"
    )
    week_of_year = models.PositiveSmallIntegerField()
    stage = models.CharField(max_length=30, choices=Stage.choices)
    risk_notes_en = models.TextField(blank=True, default="")
    risk_notes_ne = models.TextField(blank=True, default="")

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["district", "crop", "week_of_year"],
                name="uniq_district_crop_week",
            ),
            models.CheckConstraint(
                condition=models.Q(week_of_year__gte=1, week_of_year__lte=53),
                name="week_between_1_53",
            ),
        ]
        ordering = ["week_of_year"]

    def __str__(self):
        return f"{self.district.slug}/{self.crop.code} W{self.week_of_year}: {self.stage}"
