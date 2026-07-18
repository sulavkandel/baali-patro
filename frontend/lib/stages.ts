/**
 * Growth-stage presentation constants shared by WeekRibbon, StageLegend
 * and the compare view. Colors chosen for WCAG AA contrast against white
 * text (except grain-fill which uses dark text on amber).
 */

export const STAGE_ORDER = [
  'fallow',
  'land-prep',
  'sowing',
  'vegetative',
  'flowering',
  'grain-fill',
  'harvest',
  'post-harvest',
] as const;

export type Stage = (typeof STAGE_ORDER)[number];

export const STAGE_COLORS: Record<string, { bg: string; text: string }> = {
  fallow: { bg: '#9ca3af', text: '#ffffff' }, // gray-400
  'land-prep': { bg: '#92400e', text: '#ffffff' }, // amber-800 (soil)
  sowing: { bg: '#0369a1', text: '#ffffff' }, // sky-700 (water/seed)
  vegetative: { bg: '#15803d', text: '#ffffff' }, // green-700
  flowering: { bg: '#a21caf', text: '#ffffff' }, // fuchsia-700
  'grain-fill': { bg: '#ca8a04', text: '#1f2937' }, // yellow-600 + dark text
  harvest: { bg: '#c2410c', text: '#ffffff' }, // orange-700
  'post-harvest': { bg: '#475569', text: '#ffffff' }, // slate-600
};

/** Current ISO-8601 week number, computed in UTC (Thursday-anchored). */
export function currentIsoWeek(date = new Date()): number {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  // Shift to the Thursday of this week (ISO weeks belong to the year of their Thursday)
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/** Approximate month tick positions on a 52-week axis (week of month start). */
export const MONTH_TICKS: { week: number; en: string; ne: string }[] = [
  { week: 1, en: 'Jan', ne: 'जन' },
  { week: 5, en: 'Feb', ne: 'फेब' },
  { week: 9, en: 'Mar', ne: 'मार्च' },
  { week: 14, en: 'Apr', ne: 'अप्र' },
  { week: 18, en: 'May', ne: 'मे' },
  { week: 22, en: 'Jun', ne: 'जुन' },
  { week: 27, en: 'Jul', ne: 'जुल' },
  { week: 31, en: 'Aug', ne: 'अग' },
  { week: 36, en: 'Sep', ne: 'सेप' },
  { week: 40, en: 'Oct', ne: 'अक्टो' },
  { week: 44, en: 'Nov', ne: 'नोभ' },
  { week: 48, en: 'Dec', ne: 'डिसे' },
];
