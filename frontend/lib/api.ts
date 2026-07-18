/**
 * Server-side API client for the Django backend.
 *
 * Decision: instead of client-side axios calls (as the original spec suggested),
 * all data is fetched in React Server Components with Next's fetch cache
 * (revalidate). This ships less JS, avoids CORS complexity in production and
 * gives us ISR-style freshness for free.
 */

const API_BASE =
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:8000';

export interface District {
  slug: string;
  name_en: string;
  name_ne: string;
  province: string;
  centroid_lat: number;
  centroid_lon: number;
}

export interface Crop {
  code: string;
  name_en: string;
  name_ne: string;
  icon: string;
}

export interface CalendarWeek {
  week: number;
  stage: string;
  risk_note_en: string;
  risk_note_ne: string;
}

export interface CalendarResponse {
  district: District;
  crop: Crop;
  weeks: CalendarWeek[];
}

export interface CompareResponse {
  district: District;
  /** Crop metadata keyed by crop code. */
  crops: Record<string, Crop>;
  /** 52 calendar weeks keyed by crop code. */
  calendars: Record<string, CalendarWeek[]>;
}

export interface DailyForecast {
  date: string;
  tmax: number;
  tmin: number;
  precip: number;
}

export interface Advisory {
  district: string;
  for_week: number;
  week_start: string;
  tmax_avg_c: number;
  tmin_avg_c: number;
  precip_total_mm: number;
  summary_en: string;
  summary_ne: string;
  daily: DailyForecast[];
  generated_at: string;
}

async function get<T>(path: string, revalidate = 3600): Promise<T> {
  const res = await fetch(`${API_BASE}/api/v1${path}`, {
    next: { revalidate },
  });
  if (!res.ok) {
    throw new Error(`API ${path} failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function getDistricts(): Promise<District[]> {
  return get<District[]>('/districts/', 86400);
}

export function getCrops(): Promise<Crop[]> {
  return get<Crop[]>('/crops/', 86400);
}

export function getCalendar(
  district: string,
  crop: string,
): Promise<CalendarResponse> {
  return get<CalendarResponse>(
    `/calendar/?district=${encodeURIComponent(district)}&crop=${encodeURIComponent(crop)}`,
    86400,
  );
}

export function getCompare(
  district: string,
  crops: string[],
): Promise<CompareResponse> {
  return get<CompareResponse>(
    `/calendar/compare/?district=${encodeURIComponent(district)}&crops=${crops
      .map(encodeURIComponent)
      .join(',')}`,
    86400,
  );
}

/** Advisory may legitimately be unavailable (cold cache + network failure). */
export async function getAdvisory(district: string): Promise<Advisory | null> {
  try {
    return await get<Advisory>(
      `/advisory/current/?district=${encodeURIComponent(district)}`,
      900,
    );
  } catch {
    return null;
  }
}

export async function getAllAdvisories(
  districts: District[],
): Promise<(Advisory | null)[]> {
  return Promise.all(districts.map((d) => getAdvisory(d.slug)));
}

/** Pick the localized name off a bilingual object. */
export function ln(
  obj: { name_en: string; name_ne: string },
  locale: string,
): string {
  return locale === 'ne' ? obj.name_ne : obj.name_en;
}

/** Pick the localized risk note off a calendar week. */
export function riskNote(w: CalendarWeek, locale: string): string {
  return locale === 'ne' ? w.risk_note_ne : w.risk_note_en;
}
