import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { getCompare, getCrops, ln, type CompareResponse } from '@/lib/api';
import WeekRibbon from '@/components/WeekRibbon';
import StageLegend from '@/components/StageLegend';
import CompareCropSwitcher from '@/components/CompareCropSwitcher';

interface Props {
  params: { locale: string; district: string };
  searchParams: { crops?: string };
}

// Render at request time: data comes from the Django API, which is not
// available (and must not be required) during `next build` in Docker/CI.
export const dynamic = 'force-dynamic';

export default async function ComparePage({
  params: { locale, district },
  searchParams,
}: Props) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'compare' });

  // Parse ?crops= (default paddy,maize; max 2 for the stacked mobile layout)
  const requested = (searchParams.crops ?? 'paddy,maize')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 2);
  if (requested.length < 2) {
    requested.push(requested[0] === 'paddy' ? 'maize' : 'paddy');
  }

  let data: CompareResponse;
  try {
    data = await getCompare(district, requested);
  } catch {
    notFound();
  }

  const crops = await getCrops();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl">
          {t('title', { district: ln(data.district, locale) })}
        </h1>
        <p className="mt-1 text-stone-600">{t('subtitle')}</p>
      </header>

      <section
        id="compare-switcher"
        className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm"
      >
        <CompareCropSwitcher
          crops={crops}
          district={district}
          locale={locale}
          initialA={requested[0]}
          initialB={requested[1]}
        />
      </section>

      {/* Stacked ribbons — vertical stacking avoids horizontal scroll on mobile */}
      <section id="compare-ribbons" className="space-y-6">
        {requested.map((code) => {
          const crop = data.crops[code];
          const weeks = data.calendars[code];
          if (!crop || !weeks) return null;
          return (
            <div
              key={code}
              className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm"
            >
              <WeekRibbon
                weeks={weeks}
                locale={locale}
                heading={`${crop.icon} ${ln(crop, locale)}`}
              />
            </div>
          );
        })}
      </section>

      <StageLegend locale={locale} />

      <p>
        <Link
          href={`/${locale}/calendar/${district}/${requested[0]}`}
          className="text-sm font-semibold text-emerald-700 underline hover:text-emerald-900"
        >
          ← {t('backToCalendar')}
        </Link>
      </p>
    </div>
  );
}
