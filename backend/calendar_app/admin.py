from django.contrib import admin

from .models import Crop, CropCalendarWeek, District


@admin.register(District)
class DistrictAdmin(admin.ModelAdmin):
    list_display = ("slug", "name_en", "name_ne", "province")
    search_fields = ("slug", "name_en", "name_ne")


@admin.register(Crop)
class CropAdmin(admin.ModelAdmin):
    list_display = ("code", "name_en", "name_ne", "icon")
    search_fields = ("code", "name_en", "name_ne")


@admin.register(CropCalendarWeek)
class CropCalendarWeekAdmin(admin.ModelAdmin):
    list_display = ("district", "crop", "week_of_year", "stage")
    list_filter = ("district", "crop", "stage")
    ordering = ("district", "crop", "week_of_year")
