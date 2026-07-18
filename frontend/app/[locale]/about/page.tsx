import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

export default async function AboutPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'about' });

  const sections = [
    { id: 'what-is-it', title: t('whatTitle'), body: t('whatBody') },
    { id: 'data-sources', title: t('sourcesTitle'), body: t('sourcesBody') },
    { id: 'limitations', title: t('limitsTitle'), body: t('limitsBody') },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl">
        {t('title')}
      </h1>

      {sections.map((s) => (
        <section
          key={s.id}
          id={s.id}
          className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm"
        >
          <h2 className="mb-2 text-lg font-semibold text-emerald-800">
            {s.title}
          </h2>
          <p className="leading-relaxed text-stone-700">{s.body}</p>
        </section>
      ))}
    </div>
  );
}
