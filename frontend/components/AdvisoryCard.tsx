import { getTranslations } from 'next-intl/server';
import type { Advisory } from '@/lib/api';
import ForecastChart from './ForecastChart';

interface Props {
  advisory: Advisory | null;
  districtName: string;
  locale: string;
  /** Show the 7-day chart inside the card (advisory index page). */
  withChart?: boolean;
}

export default async function AdvisoryCard({
  advisory,
  districtName,
  locale,
  withChart,
}: Props) {
  const t = await getTranslations({ locale, namespace: 'advisory' });

  if (!advisory) {
    return (
      <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
        <h3 className="font-semibold text-stone-800">{districtName}</h3>
        <p className="mt-1 text-sm text-amber-800">{t('unavailable')}</p>
      </div>
    );
  }

  const nf = new Intl.NumberFormat(locale === 'ne' ? 'ne-NP' : 'en-GB', {
    maximumFractionDigits: 1,
  });
  const df = new Intl.DateTimeFormat(locale === 'ne' ? 'ne-NP' : 'en-GB', {
    day: 'numeric',
    month: 'short',
  });

  const summary = locale === 'ne' ? advisory.summary_ne : advisory.summary_en;

  return (
    <article className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-semibold text-stone-800">{districtName}</h3>
        <p className="text-xs text-stone-500">
          {t('forWeek', { week: advisory.for_week })} ·{' '}
          {t('generated', {
            date: df.format(new Date(advisory.generated_at)),
          })}
        </p>
      </header>

      <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded bg-orange-50 p-2">
          <dt className="text-[11px] text-stone-600">{t('tmax')}</dt>
          <dd className="text-lg font-bold text-orange-700">
            {nf.format(advisory.tmax_avg_c)}°C
          </dd>
        </div>
        <div className="rounded bg-sky-50 p-2">
          <dt className="text-[11px] text-stone-600">{t('tmin')}</dt>
          <dd className="text-lg font-bold text-sky-700">
            {nf.format(advisory.tmin_avg_c)}°C
          </dd>
        </div>
        <div className="rounded bg-blue-50 p-2">
          <dt className="text-[11px] text-stone-600">{t('precip')}</dt>
          <dd className="text-lg font-bold text-blue-700">
            {nf.format(advisory.precip_total_mm)} mm
          </dd>
        </div>
      </dl>

      <p className="mt-3 text-sm leading-relaxed text-stone-700">{summary}</p>

      {withChart && advisory.daily?.length > 0 && (
        <div className="mt-3">
          <ForecastChart daily={advisory.daily} locale={locale} />
        </div>
      )}
    </article>
  );
}
