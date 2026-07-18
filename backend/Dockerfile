# ── Baali-Patro backend (Django 5 + DRF + gunicorn) ─────────────────────────
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# System deps: libpq for PostgreSQL, curl for the healthcheck
RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq-dev gcc curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

# Non-root user
RUN useradd -m appuser && chown -R appuser /app
USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD curl -fsS http://localhost:8000/api/v1/districts/ || exit 1

# Entrypoint: migrate → seed calendar (idempotent) → generate advisories
# (best-effort: advisory generation needs outbound internet) → gunicorn.
ENTRYPOINT ["/bin/sh", "-c", "\
    python manage.py migrate --noinput && \
    python manage.py seed_calendar && \
    (python manage.py generate_advisories || echo 'advisory generation skipped (no network?)') && \
    gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 3 --timeout 60"]
