import Link from 'next/link';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { getDistricts, getCrops, ln } from '@/lib/api';
import { currentIsoWeek } from '@/lib/stages';
import DistrictCropPicker from '@/components/DistrictCropPicker';

/** Simple seasonal heuristic for the "in season" card. */
function featuredCropCode(week: number): string {
  if (week >= 22 && week <= 43) return 'paddy'; // monsoon
  if (week >= 44 || week <= 4) return 'wheat'; // winter sowing/growth
  if (week >= 5 && week <= 13) return 'maize'; // spring
  return 'potato';
}

// Render at request time: data comes from the Django API, which is not
// available (and must not be required) during `next build` in Docker/CI.
export const dynamic = 'force-dynamic';

export default async function HomePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'home' });

  const [districts, crops] = await Promise.all([getDistricts(), getCrops()]);
  const week = currentIsoWeek();
  const featured =
    crops.find((c) => c.code === featuredCropCode(week)) ?? crops[0];
  const nf = new Intl.NumberFormat(locale === 'ne' ? 'ne-NP' : 'en-GB');

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section
        id="hero-section"
        className="rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-900 px-6 py-10 text-white sm:px-10"
      >
        <h1 className="max-w-2xl text-3xl font-bold leading-tight sm:text-4xl">
          {t('heroTitle')}
        </h1>
        <p className="mt-3 max-w-2xl text-emerald-100">{t('heroSubtitle')}</p>
      </section>

      {/* Picker */}
      <section
        id="calendar-picker"
        className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm"
      >
        <h2 className="mb-4 text-lg font-semibold">{t('pickerTitle')}</h2>
        <DistrictCropPicker districts={districts} crops={crops} locale={locale} />
      </section>

      {/* Featured crop */}
      {featured && (
        <section
          id="featured-crop"
          className="rounded-xl border border-amber-200 bg-amber-50 p-6"
        >
          <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-800">
            {t('featuredTitle')} · {t('week')} {nf.format(week)}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            <span className="text-4xl" aria-hidden="true">
              {featured.icon}
            </span>
            <div>
              <p className="text-xl font-bold text-stone-900">
                {ln(featured, locale)}
              </p>
              <Link
                href={`/${locale}/calendar/${districts[0]?.slug ?? 'kailali'}/${featured.code}`}
                className="text-sm font-semibold text-emerald-700 underline hover:text-emerald-900"
              >
                {t('featuredCta')} →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* District grid */}
      <section id="district-grid">
        <h2 className="mb-4 text-lg font-semibold">{t('districtsTitle')}</h2>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {districts.map((d) => (
            <li key={d.slug}>
              <Link
                href={`/${locale}/calendar/${d.slug}/paddy`}
                className="block rounded-xl border border-stone-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <p className="font-semibold text-stone-900">{ln(d, locale)}</p>
                <p className="mt-1 text-xs text-stone-500">{d.province}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
