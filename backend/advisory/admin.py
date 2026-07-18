from django.contrib import admin

from .models import WeeklyAdvisory


@admin.register(WeeklyAdvisory)
class WeeklyAdvisoryAdmin(admin.ModelAdmin):
    list_display = ("district", "for_week", "tmax_avg_c", "tmin_avg_c", "precip_total_mm")
    list_filter = ("district",)
