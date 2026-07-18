# Architecture Decision Record — Baali-Patro

Where implementation deviates from the original specification, the reasoning
is recorded here. Guiding principle: *at every step, question whether the
spec's approach is optimal; if a better way exists, use it.*

---

## ADR-1: Server-rendered SVG chart instead of Chart.js

**Spec suggested**: Chart.js on the client for the 7-day forecast chart.

**Decision**: A hand-rolled 560×180 SVG rendered in a React Server Component
(`components/ForecastChart.tsx`).

**Why**:
- Chart.js adds ~70 kB gz of client JS for a single, static, 7-point chart.
- An RSC SVG ships **zero** client JavaScript, renders instantly, prints
  correctly, and is fully styleable with Tailwind tokens.
- Accessibility: real `<title>`/`aria-label` on SVG elements beats a canvas.

**Trade-off**: no hover tooltips/animation — acceptable: values are also
labelled inline and repeated in the advisory card.

## ADR-2: RSC `fetch` with `next: { revalidate }` instead of client axios

**Spec suggested**: axios in client components fetching the Django API.

**Decision**: All data fetching happens server-side in RSCs via the typed
helper in `lib/api.ts`.

**Why**:
- No API URL/CORS exposure to the browser; the browser never talks to Django.
- Built-in caching (`revalidate`) replaces hand-rolled state management.
- Smaller bundles, no loading spinners for primary content, better SEO for
  the bilingual pages.

## ADR-3: `force-dynamic` on data pages

**Problem**: `next build` tried to prerender pages that fetch the Django API,
failing in Docker/CI where no API is running.

**Decision**: `export const dynamic = 'force-dynamic'` on the four
data-fetching pages (home, calendar, compare, advisory).

**Why**: builds must be hermetic — requiring a live database/API at *build*
time couples deploys in the wrong direction. Pages render at request time and
Next.js still caches upstream fetches per `revalidate`.

## ADR-4: Compact seed templates + district offsets instead of 1,560 hand rows

**Spec implied**: a hand-maintained 1,560-row dataset.

**Decision**: `seed_data.py` defines per-crop *stage-span templates* plus a
per-district monsoon-gradient offset (Kailali +2, Bardiya/Banke +1, rest 0),
and expands them into 1,560 rows + a reviewable CSV export.

**Why**: 6 templates + 5 offsets ≈ 40 lines of reviewable data vs 1,560
opaque rows. Domain experts correct a template once; regeneration is free.
The CSV remains the interchange format for official data (see DATA_SOURCES).

## ADR-5: WeekRibbon as an accessible listbox, not hover tooltips

**Spec suggested**: hover tooltips on week cells.

**Decision**: The 52-week ribbon is a keyboard-navigable `role="listbox"`
(Arrow/Home/End), with a persistent `aria-live` detail panel below.

**Why**: hover is unusable on touch devices — the primary audience (farmers,
extension workers) is mobile-first. A selected-cell + detail-panel pattern
works for touch, keyboard, and screen readers alike.

## ADR-6: next-intl with locale-prefixed routing (`/en`, `/ne`)

**Decision**: `next-intl` middleware with `[locale]` segment, messages in
`messages/{en,ne}.json`, Devanagari via `next/font` (`Noto_Sans_Devanagari`).

**Why**: URL-visible locale is shareable/bookmarkable and SEO-correct
(`hreflang`-ready). Hand-authored Nepali strings, not machine translation.

## ADR-7: SQLite dev fallback via `dj-database-url`

**Decision**: `DATABASE_URL` env selects PostgreSQL; absent, Django falls
back to SQLite.

**Why**: contributors run tests with zero setup; docker-compose and
production use PostgreSQL 15. Same code path, one env var.

## ADR-8: Rule-based advisory, not ML

**Decision**: transparent threshold rules (rain ≥ 60/20 mm, heat ≥ 36 °C,
cold ≤ 8 °C) mapped to bilingual advice strings.

**Why**: explainable, auditable by agronomists, works offline from a 7-day
forecast, and avoids over-promising accuracy in a farmer-facing safety
context. Thresholds are constants — trivially tunable.
