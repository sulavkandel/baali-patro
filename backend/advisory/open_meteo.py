"""
Open-Meteo adapter + weekly advisory generator.

Optimization / robustness decisions:
- Pure-function core (`aggregate_week`, `build_summaries`) separated from
  I/O (`fetch_forecast`) → unit-testable without network.
- Graceful degradation: if Open-Meteo is unreachable the generator keeps
  any previously stored advisory instead of erasing it (upsert-only).
- Summaries are rule-based (thresholds from NARC agromet bulletin
  conventions), generated in BOTH languages from the same numeric facts —
  no machine translation at request time.
"""
from __future__ import annotations

import datetime as dt
import logging
from dataclasses import dataclass

import requests
from django.conf import settings

log = logging.getLogger(__name__)

# NARC-inspired advisory thresholds (mm / °C)
HEAVY_RAIN_MM = 60.0
MODERATE_RAIN_MM = 20.0
HEAT_STRESS_C = 36.0
COLD_STRESS_C = 8.0


@dataclass
class WeekAggregate:
    tmax_avg: float | None
    tmin_avg: float | None
    precip_total: float | None
    daily: list[dict]


def iso_week_thursday(date: dt.date) -> dt.date:
    """Return the Thursday of `date`'s ISO week (DHM Thursday-cycle anchor)."""
    return date + dt.timedelta(days=3 - date.weekday())


def fetch_forecast(lat: float, lng: float, timeout: int = 15) -> dict:
    """Fetch 7-day daily forecast from Open-Meteo. Raises on HTTP error."""
    resp = requests.get(
        settings.OPEN_METEO_BASE,
        params={
            "latitude": lat,
            "longitude": lng,
            "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum",
            "timezone": "Asia/Kathmandu",
            "forecast_days": 7,
        },
        timeout=timeout,
    )
    resp.raise_for_status()
    return resp.json()


def aggregate_week(payload: dict) -> WeekAggregate:
    daily = payload.get("daily", {})
    dates = daily.get("time", []) or []
    tmax = daily.get("temperature_2m_max", []) or []
    tmin = daily.get("temperature_2m_min", []) or []
    prec = daily.get("precipitation_sum", []) or []

    rows = []
    for i, d in enumerate(dates):
        rows.append(
            {
                "date": d,
                "tmax": tmax[i] if i < len(tmax) else None,
                "tmin": tmin[i] if i < len(tmin) else None,
                "precip": prec[i] if i < len(prec) else None,
            }
        )

    def avg(vals):
        vals = [v for v in vals if v is not None]
        return round(sum(vals) / len(vals), 2) if vals else None

    precip_vals = [r["precip"] for r in rows if r["precip"] is not None]
    return WeekAggregate(
        tmax_avg=avg([r["tmax"] for r in rows]),
        tmin_avg=avg([r["tmin"] for r in rows]),
        precip_total=round(sum(precip_vals), 2) if precip_vals else None,
        daily=rows,
    )


def build_summaries(agg: WeekAggregate) -> tuple[str, str]:
    """Rule-based bilingual advisory text from numeric aggregates."""
    parts_en: list[str] = []
    parts_ne: list[str] = []

    p = agg.precip_total or 0.0
    if p >= HEAVY_RAIN_MM:
        parts_en.append(
            f"Heavy rainfall expected (~{p:.0f} mm this week). Ensure field drainage; "
            "postpone fertilizer top-dressing and harvesting of mature crops."
        )
        parts_ne.append(
            f"यस हप्ता भारी वर्षा (~{p:.0f} मि.मि.) हुने सम्भावना छ। खेतको निकास मिलाउनुहोस्; "
            "मलखाद हाल्ने र पाकेको बाली भित्र्याउने काम स्थगित गर्नुहोस्।"
        )
    elif p >= MODERATE_RAIN_MM:
        parts_en.append(
            f"Moderate rainfall (~{p:.0f} mm) forecast — good for transplanting and "
            "vegetative crops; monitor for fungal disease after wet spells."
        )
        parts_ne.append(
            f"मध्यम वर्षा (~{p:.0f} मि.मि.) को पूर्वानुमान छ — रोपाइँ र वृद्धि चरणका बालीका लागि राम्रो; "
            "ओसिलो मौसमपछि ढुसीजन्य रोगको निगरानी गर्नुहोस्।"
        )
    else:
        parts_en.append(
            f"Mostly dry week (~{p:.0f} mm). Plan irrigation for standing crops; "
            "favourable window for harvesting and drying."
        )
        parts_ne.append(
            f"प्रायः सुख्खा हप्ता (~{p:.0f} मि.मि.)। खडा बालीका लागि सिँचाइको योजना बनाउनुहोस्; "
            "बाली भित्र्याउन र सुकाउन उपयुक्त समय।"
        )

    if agg.tmax_avg is not None and agg.tmax_avg >= HEAT_STRESS_C:
        parts_en.append(
            f"Average maximum around {agg.tmax_avg:.0f}°C — heat stress risk during "
            "flowering; irrigate in the evening."
        )
        parts_ne.append(
            f"औसत अधिकतम तापक्रम {agg.tmax_avg:.0f}°C — फूल फुल्ने चरणमा तापको जोखिम; "
            "साँझपख सिँचाइ गर्नुहोस्।"
        )
    if agg.tmin_avg is not None and agg.tmin_avg <= COLD_STRESS_C:
        parts_en.append(
            f"Average minimum near {agg.tmin_avg:.0f}°C — cold/frost risk for seedlings; "
            "use light irrigation or mulching at night."
        )
        parts_ne.append(
            f"औसत न्यूनतम तापक्रम {agg.tmin_avg:.0f}°C — बेर्ना/बिरुवामा शीत/तुषारोको जोखिम; "
            "राति हल्का सिँचाइ वा छापो प्रयोग गर्नुहोस्।"
        )

    return " ".join(parts_en), " ".join(parts_ne)


def generate_for_district(district):
    """Fetch + aggregate + upsert one district's current-week advisory."""
    from .models import WeeklyAdvisory

    try:
        payload = fetch_forecast(float(district.centroid_lat), float(district.centroid_lng))
    except requests.RequestException as exc:  # network failure → keep old advisory
        log.warning("Open-Meteo fetch failed for %s: %s", district.slug, exc)
        return None

    agg = aggregate_week(payload)
    summary_en, summary_ne = build_summaries(agg)
    for_week = iso_week_thursday(dt.date.today())

    obj, _ = WeeklyAdvisory.objects.update_or_create(
        district=district,
        for_week=for_week,
        defaults={
            "tmax_avg_c": agg.tmax_avg,
            "tmin_avg_c": agg.tmin_avg,
            "precip_total_mm": agg.precip_total,
            "summary_en": summary_en,
            "summary_ne": summary_ne,
            "daily": agg.daily,
        },
    )
    return obj


def generate_all() -> int:
    from calendar_app.models import District

    count = 0
    for d in District.objects.all():
        if generate_for_district(d):
            count += 1
    return count
