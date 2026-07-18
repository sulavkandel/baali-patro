import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import {
  getCalendar,
  getCrops,
  getAdvisory,
  ln,
  type CalendarResponse,
} from '@/lib/api';
import WeekRibbon from '@/components/WeekRibbon';
import StageLegend from '@/components/StageLegend';
import AdvisoryCard from '@/components/AdvisoryCard';
import ForecastChart from '@/components/ForecastChart';

interface Params {
  locale: string;
  district: string;
  crop: string;
}

// Render at request time: data comes from the Django API, which is not
// available (and must not be required) during `next build` in Docker/CI.
export const dynamic = 'force-dynamic';

export default async function CalendarPage({
  params: { locale, district, crop },
}: {
  params: Params;
}) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'calendar' });

  let cal: CalendarResponse;
  try {
    cal = await getCalendar(district, crop);
  } catch {
    notFound();
  }

  const [crops, advisory] = await Promise.all([
    getCrops(),
    getAdvisory(district),
  ]);

  const otherCrops = crops.filter((c) => c.code !== crop);
  const compareTarget = crop === 'paddy' ? 'maize' : 'paddy';
  const compareCrop = crops.find((c) => c.code === compareTarget);

  return (
    <div className="space-y-8 pb-16">
      <header>
        <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl">
          <span aria-hidden="true">{cal.crop.icon} </span>
          {t('title', {
            crop: ln(cal.crop, locale),
            district: ln(cal.district, locale),
          })}
        </h1>
      </header>

      {/* Week ribbon — the core screen */}
      <section
        id="week-ribbon"
        aria-label={t('title', {
          crop: ln(cal.crop, locale),
          district: ln(cal.district, locale),
        })}
      >
        <WeekRibbon weeks={cal.weeks} locale={locale} />
      </section>

      <StageLegend locale={locale} />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Forecast chart */}
        <section
          id="forecast-section"
          className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm lg:col-span-2"
        >
          <h2 className="mb-3 text-lg font-semibold">{t('forecastTitle')}</h2>
          {advisory?.daily?.length ? (
            <ForecastChart daily={advisory.daily} locale={locale} />
          ) : (
            <AdvisoryCard
              advisory={null}
              districtName={ln(cal.district, locale)}
              locale={locale}
            />
          )}
        </section>

        {/* Sidebar: advisory + other crops */}
        <aside className="space-y-4">
          <AdvisoryCard
            advisory={advisory}
            districtName={ln(cal.district, locale)}
            locale={locale}
          />
          <section id="other-crops">
            <h2 className="mb-2 text-sm font-semibold text-stone-700">
              {t('otherCrops', { district: ln(cal.district, locale) })}
            </h2>
            <ul className="flex flex-wrap gap-2">
              {otherCrops.map((c) => (
                <li key={c.code}>
                  <Link
                    href={`/${locale}/calendar/${district}/${c.code}`}
                    className="inline-flex items-center gap-1 rounded-full border border-stone-300 bg-white px-3 py-1 text-sm hover:border-emerald-600 hover:text-emerald-700"
                  >
                    <span aria-hidden="true">{c.icon}</span>
                    {ln(c, locale)}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>

      {/* Sticky compare CTA */}
      {compareCrop && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-white/95 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-6xl justify-center px-4">
            <Link
              href={`/${locale}/compare/${district}?crops=${crop},${compareTarget}`}
              className="rounded-full bg-amber-400 px-6 py-2 text-sm font-semibold text-stone-900 shadow transition-colors hover:bg-amber-300"
            >
              {t('compareCta', { crop: ln(compareCrop, locale) })} ⇄
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
