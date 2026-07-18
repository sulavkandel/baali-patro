"""
Weekly advisory storage.

Design decision: advisory rows are keyed by (district, for_week) with a
unique constraint and upserted by the generator — re-running the weekly
job is idempotent, no duplicate rows, and 'latest advisory' is a simple
ORDER BY for_week DESC LIMIT 1 per district.
"""
from django.db import models

from calendar_app.models import District


class WeeklyAdvisory(models.Model):
    district = models.ForeignKey(
        District, on_delete=models.CASCADE, related_name="advisories"
    )
    for_week = models.DateField(help_text="Thursday of the ISO week")
    tmax_avg_c = models.DecimalField(max_digits=5, decimal_places=2, null=True)
    tmin_avg_c = models.DecimalField(max_digits=5, decimal_places=2, null=True)
    precip_total_mm = models.DecimalField(max_digits=6, decimal_places=2, null=True)
    summary_en = models.TextField(blank=True, default="")
    summary_ne = models.TextField(blank=True, default="")
    daily = models.JSONField(default=list, blank=True, help_text="7-day detail for sparklines")
    generated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["district", "for_week"], name="uniq_district_week_advisory"
            )
        ]
        ordering = ["-for_week"]
        verbose_name_plural = "weekly advisories"

    def __str__(self):
        return f"{self.district.slug} advisory for {self.for_week}"
