# Accessibility Notes — Baali-Patro

Target: **WCAG 2.1 AA**, mobile-first, bilingual (Latin + Devanagari).

## 1. Keyboard & interaction

- **WeekRibbon** (`components/WeekRibbon.tsx`) is a `role="listbox"` of 52
  `role="option"` cells: `←/→` move a week, `Home`/`End` jump to week 1/52,
  selection updates a persistent detail panel marked `aria-live="polite"` —
  no information is locked behind hover.
- All interactive elements have visible `:focus-visible` outlines
  (`app/globals.css`), never `outline: none` without replacement.
- The compare crop switcher and district/crop pickers are native
  `<a>`/`<select>` semantics — no div-buttons.

## 2. Colour & contrast

Stage colours (`lib/stages.ts`) pair a background with an explicit text
colour chosen for ≥ 4.5:1 contrast:

| Stage | Background | Text | Note |
|---|---|---|---|
| land_preparation | amber-200 | amber-950 | dark-on-light |
| nursery | lime-200 | lime-950 | dark-on-light |
| sowing_transplanting | emerald-600 | white | light-on-dark |
| vegetative | green-700 | white | light-on-dark |
| flowering | violet-600 | white | light-on-dark |
| grain_fill | yellow-300 | **yellow-950** | deliberately dark text — yellow bg fails with white |
| harvest | orange-600 | white | light-on-dark |
| post_harvest | stone-400 | stone-950 | dark-on-light |

Stage identity is **never colour-only**: the legend pairs swatch + label, and
the selected-week panel names the stage in text.

## 3. Devanagari / bilingual support

- `Noto_Sans_Devanagari` loaded via `next/font` (self-hosted, no FOUT to a
  fallback font that lacks conjuncts).
- `<html lang>` is set per locale (`en` / `ne`); `:lang(ne)` gets
  line-height and font-feature adjustments in `globals.css` so matras and
  conjunct stacks don't clip.
- All strings, including risk notes and advisories, exist in both languages —
  no English fallback leaking into the Nepali UI.

## 4. Semantics & structure

- Landmarks: `<header>` (nav), `<main>`, `<footer>` with the data
  disclaimer; one `<h1>` per page.
- The forecast chart is an inline SVG with `role="img"` and a bilingual
  `aria-label` summarising the 7-day trend; underlying values are also
  rendered as text in the advisory card, so the chart is decorative-plus.
- Tables of comparison data use real `<table>`/`scope` markup where present.

## 5. Motion & preferences

- `prefers-reduced-motion: reduce` disables transitions (`globals.css`).
- No autoplaying/moving content anywhere.

## 6. Known gaps / future work

- Screen-reader testing has only been done structurally (markup review), not
  with NVDA/VoiceOver end-to-end.
- The week ribbon on very narrow screens (<320 px) requires horizontal
  scroll; an alternative month-grouped list view would help.
- Nepali numerals (०-९) are not used; dates/numbers render in ASCII digits,
  which is common but worth a user study.
