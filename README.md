# Baali-Patro (बाली-पात्रो) 🌾

**Empowering farmers in Nepal's Terai with localized, bilingual, data-driven agricultural intelligence.**

Baali-Patro is an interactive, bilingual (English / नेपाली) crop and weather advisory platform designed specifically for 5 key districts in the western Nepal Terai. By merging established agricultural timelines with hyper-local, real-time meteorological data, Baali-Patro helps farmers and extension workers make informed, climate-resilient decisions week by week.

> 🇳🇵 नेपालीमा पढ्नुहोस्: [README.ne.md](README.ne.md)

| | |
|---|---|
| **Districts Covered** | Kailali, Bardiya, Banke, Kapilvastu, Rupandehi |
| **Supported Crops** | Paddy (धान), Wheat (गहुँ), Maize (मकै), Mustard (तोरी), Sugarcane (उखु), Potato (आलु) |
| **Live Web App** | [**https://frontend-jade-tau-zq7c5shuaq.vercel.app**](https://frontend-jade-tau-zq7c5shuaq.vercel.app) |
| **Live API** | [**https://baali-patro-api-xlim.onrender.com**](https://baali-patro-api-xlim.onrender.com) |

---

## 🌍 Social Impact & Features

- **Localized Crop Calendars (52-Week)**: Provides farmers with district-specific timelines across 6 major crops, detailing essential growth stages from land preparation to post-harvest management.
- **Data-Driven Weather Advisories**: Integrates seamlessly with live weather forecasts to automatically generate critical weekly advice (e.g., delaying fertilizer application during expected heavy rainfall).
- **Accessible & Inclusive Design**: Fully bilingual interface supporting English and Nepali, complete with visually distinct indicators to support varying literacy levels.
- **Compare Cultivations**: An intuitive side-by-side comparison tool allowing agricultural workers to analyze overlapping crop cycles and optimize land utilization.

## 📊 Data Sources & References

Baali-Patro is built on top of transparent, open, and scientifically backed data sources to ensure high reliability for farming communities.

- **Meteorological Data:** Weather forecasts and historical climate data are fetched in real-time from the **[Open-Meteo API](https://open-meteo.com/)**. This open-source provider delivers high-resolution, daily meteorological variables (temperature extremes and precipitation sum) without requiring commercial licenses.
- **Agricultural Thresholds:** Weather warnings and agricultural advisories are modeled around established thresholds commonly utilized by the **Nepal Agricultural Research Council (NARC)** and the **Ministry of Agriculture and Livestock Development (MoALD)**. Examples include heat stress warnings above 36°C, cold stress warnings below 8°C, and heavy rainfall flood alerts (≥60mm/week).
- **Calendar Baselines:** The baseline crop calendar data (sowing and harvesting weeks) is synthesized from public cropping-pattern documentation and regional agricultural extension manuals.

*Note: The bundled crop calendar is an educational baseline. We strongly encourage all users to cross-check information with their local Agriculture Knowledge Centre (Krishi Gyan Kendra) before executing critical field operations.*

## 🛠 Technology Stack

Engineered for scale, speed, and minimal maintenance costs (utilizing automated cron jobs to sustain free-tier viability).

- **Frontend**: Built with [Next.js 14](https://nextjs.org/) (App Router, Server Components) and [Tailwind CSS](https://tailwindcss.com/) for a highly performant, SEO-friendly, zero-client-fetch architecture.
- **Backend API**: Powered by [Django 5](https://www.djangoproject.com/) and [Django REST Framework](https://www.django-rest-framework.org/), offering robust data modeling and secure API endpoints.
- **Infrastructure**: Fully Dockerized for seamless deployment. The frontend is hosted on [Vercel](https://vercel.com) globally, while the backend API runs on [Render](https://render.com), automated by daily [GitHub Actions](https://github.com/features/actions) to keep the weather advisories fresh every single morning.

## 🚀 Getting Started Locally

### Using Docker (Recommended)

Ensure you have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed.

```bash
git clone https://github.com/sulavkandel/baali-patro.git
cd baali-patro
docker compose up --build
```
- **Web App**: [http://localhost:3000](http://localhost:3000) 
- **Backend API**: [http://localhost:8000/api/v1/districts/](http://localhost:8000/api/v1/districts/)

*The backend container will automatically run migrations, seed all 1,560 historical crop rows, and fetch the latest live weather advisories from Open-Meteo upon booting.*

## 📚 Further Documentation

For deep dives into our technical decisions, data sourcing methodology, and accessibility compliance, please review the following documents:

- [**Data Sources Methodology**](docs/DATA_SOURCES.md) — Detailed explanation of our weather aggregation rules and crop pattern sourcing.
- [**Architecture Decisions**](docs/DECISIONS.md) — 8 Architecture Decision Records (ADRs) explaining our tech choices.
- [**Accessibility Compliance**](docs/ACCESSIBILITY.md) — WCAG standards, contrast matrices, and Devanagari font optimizations.

---
*Built for the resilient farming communities of Nepal's Terai.* 🇳🇵
