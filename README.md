# Baali-Patro (बाली-पात्रो) 🌾

**A bilingual (English / नेपाली) crop–weather calendar for the western Nepal
Terai** — 5 districts × 6 crops × 52 ISO weeks, with a live 7-day weather
forecast and rule-based farming advisories.

> नेपालीमा पढ्नुहोस्: [README.ne.md](README.ne.md)

| | |
|---|---|
| **Districts** | Kailali, Bardiya, Banke, Kapilvastu, Rupandehi |
| **Crops** | Paddy (धान), Wheat (गहुँ), Maize (मकै), Mustard (तोरी), Sugarcane (उखु), Potato (आलु) |
| **Backend** | Django 5 + Django REST Framework, PostgreSQL (SQLite dev fallback) |
| **Frontend** | Next.js 14 (App Router, RSC), next-intl, Tailwind CSS |
| **Weather** | [Open-Meteo](https://open-meteo.com/) (free, no API key) |

---

## ✨ Features

- **52-week crop calendar** per district × crop — an accessible, keyboard-navigable
  week ribbon coloured by growth stage (land prep → nursery → sowing →
  vegetative → flowering → grain fill → harvest → post-harvest).
- **Compare view** — two crops side-by-side for the same district.
- **Live advisories** — 7-day Open-Meteo forecast aggregated to the ISO week,
  run through transparent thresholds (rain ≥ 60/20 mm, heat ≥ 36 °C,
  cold ≤ 8 °C) producing bilingual advice.
- **Fully bilingual** — `/en` and `/ne` routes, hand-authored Nepali,
  Noto Sans Devanagari via `next/font`.
- **Zero client-side data fetching** — React Server Components; the browser
  never talks to Django directly.

## 🚀 How to run on your device

### Option A — Docker (easiest, recommended)

Prerequisite: [Docker Desktop](https://www.docker.com/products/docker-desktop/)
(Windows/macOS) or Docker Engine + Compose (Linux).

```bash
git clone <your-repo-url>
cd baali-patro
docker compose up --build
```

First build takes a few minutes. Then open:

- **App**: http://localhost:3000 → redirects to `/en` (switch to नेपाली in the nav)
- **API**: http://localhost:8000/api/v1/districts/

The backend container automatically runs migrations, seeds the 1,560 calendar
rows, and fetches live advisories (needs internet). Stop with `Ctrl+C`;
`docker compose down -v` also wipes the database volume.

### Option B — run backend and frontend manually (for development)

Prerequisites: **Python 3.11+** and **Node.js 18+** (20 recommended).

**Terminal 1 — Django API** (uses SQLite automatically, no DB setup needed):

```bash
cd baali-patro/backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_calendar          # loads 1,560 calendar rows
python manage.py generate_advisories   # optional: live weather (needs internet)
python manage.py runserver 0.0.0.0:8000
```

**Terminal 2 — Next.js frontend**:

```bash
cd baali-patro/frontend
npm install
npm run dev
```

Open **http://localhost:3000**. The frontend finds the API at
`http://localhost:8000` by default (override with `API_BASE_URL`).

**Run the backend tests** (16 tests):

```bash
cd baali-patro/backend
pip install pytest pytest-django
python -m pytest -q
```

### Option C — production-style local run

```bash
cd baali-patro/frontend && npm run build && npm start   # port 3000
# and in another terminal:
cd baali-patro/backend && gunicorn config.wsgi:application --bind 0.0.0.0:8000
```

## 🔌 API reference

Base: `http://localhost:8000/api/v1`

| Endpoint | Description |
|---|---|
| `GET /districts/` | 5 districts with bilingual names + coordinates |
| `GET /crops/` | 6 crops with bilingual names |
| `GET /calendar/?district=kailali&crop=paddy` | 52 weeks for one district × crop |
| `GET /calendar/compare/?district=banke&crops=paddy,wheat` | Two crops side by side |
| `GET /advisory/current/?district=bardiya` | Latest weekly advisory + 7-day forecast |
| `POST /advisory/regenerate/` | Refresh advisories (header `X-Regen-Token`) |

## 📁 Project structure

```
baali-patro/
├── backend/               # Django 5 + DRF
│   ├── config/            # settings (env-driven), urls, wsgi
│   ├── calendar_app/      # District/Crop/CalendarWeek models + seed command
│   ├── advisory/          # Open-Meteo client + advisory rules + command
│   ├── api/               # serializers, views, urls (v1)
│   ├── tests/             # 16 pytest tests
│   ├── data/calendar_master.csv   # reviewable 1,560-row export
│   └── Dockerfile
├── frontend/              # Next.js 14 App Router
│   ├── app/[locale]/      # en/ne pages: home, calendar, compare, advisory, about
│   ├── components/        # Nav, WeekRibbon, StageLegend, ForecastChart, …
│   ├── lib/               # typed API client, stage colours, ISO-week utils
│   ├── messages/          # en.json / ne.json translations
│   └── Dockerfile         # multi-stage, standalone output
├── docker-compose.yml     # postgres + backend + frontend
└── docs/                  # DATA_SOURCES, DECISIONS (ADRs), ACCESSIBILITY
```

## ⚙️ Environment variables

| Variable | Where | Default | Purpose |
|---|---|---|---|
| `DATABASE_URL` | backend | *(unset → SQLite)* | e.g. `postgres://user:pass@host:5432/db` |
| `DJANGO_SECRET_KEY` | backend | dev key | set in production |
| `DJANGO_DEBUG` | backend | `1` | set `0` in production |
| `DJANGO_ALLOWED_HOSTS` | backend | `*` | comma-separated |
| `CORS_ALLOWED_ORIGINS` | backend | *(empty)* | comma-separated origins |
| `ADVISORY_REGEN_TOKEN` | backend | dev token | protects the regenerate endpoint |
| `API_BASE_URL` | frontend | `http://localhost:8000` | server-side API base |
| `NEXT_PUBLIC_API_BASE_URL` | frontend | — | browser-visible base (links only) |

## ☁️ Deploying

- **Frontend → Vercel**: import the `frontend/` directory as the project root;
  set `API_BASE_URL` to your hosted Django URL. Data pages are
  `force-dynamic`, so the build never needs a live API.
- **Backend**: any container host (Railway, Fly.io, Render, a VPS) using
  `backend/Dockerfile` + managed PostgreSQL; set the env vars above and
  schedule `python manage.py generate_advisories` daily (e.g. 06:00 NPT).

## 📚 Documentation

- [docs/DATA_SOURCES.md](docs/DATA_SOURCES.md) — where the calendar/weather data comes from, and how to replace estimates with official MoALD/NARC data
- [docs/DECISIONS.md](docs/DECISIONS.md) — 8 architecture decision records
- [docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md) — WCAG notes, contrast table, Devanagari handling

## ⚠️ Disclaimer

The bundled crop calendar is an **educational approximation** synthesised
from public cropping-pattern documentation. Always cross-check with your
local Agriculture Knowledge Centre before making field decisions. Weather
data © [Open-Meteo](https://open-meteo.com/) (CC-BY-4.0).
