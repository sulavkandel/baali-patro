import { getTranslations } from 'next-intl/server';
import { STAGE_ORDER, STAGE_COLORS } from '@/lib/stages';

export default async function StageLegend({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'calendar' });
  const ts = await getTranslations({ locale, namespace: 'stages' });

  return (
    <section aria-label={t('legendTitle')}>
      <h2 className="mb-2 text-sm font-semibold text-stone-700">
        {t('legendTitle')}
      </h2>
      <ul className="flex flex-wrap gap-2">
        {STAGE_ORDER.map((stage) => {
          const c = STAGE_COLORS[stage];
          return (
            <li
              key={stage}
              className="rounded-full px-3 py-1 text-xs font-semibold"
              style={{ backgroundColor: c.bg, color: c.text }}
            >
              {ts(stage as never)}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
