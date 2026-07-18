import Link from 'next/link';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { getDistricts, getAllAdvisories, ln } from '@/lib/api';
import AdvisoryCard from '@/components/AdvisoryCard';

// Render at request time: data comes from the Django API, which is not
// available (and must not be required) during `next build` in Docker/CI.
export const dynamic = 'force-dynamic';

export default async function AdvisoryPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'advisory' });

  const districts = await getDistricts();
  const advisories = await getAllAdvisories(districts);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl">
          {t('title')}
        </h1>
        <p className="mt-1 text-stone-600">{t('subtitle')}</p>
      </header>

      <section id="advisory-grid" className="grid gap-5 md:grid-cols-2">
        {districts.map((d, i) => (
          <AdvisoryCard
            key={d.slug}
            advisory={advisories[i]}
            districtName={ln(d, locale)}
            locale={locale}
            withChart
          />
        ))}
      </section>

      <p>
        <Link
          href={`/${locale}`}
          className="text-sm font-semibold text-emerald-700 underline hover:text-emerald-900"
        >
          ← {t('viewCalendar')}
        </Link>
      </p>
    </div>
  );
}
