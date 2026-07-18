import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

export default function NotFound() {
  const t = useTranslations('notFound');
  const locale = useLocale();

  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <p className="text-6xl" aria-hidden="true">
        🌾
      </p>
      <h1 className="mt-4 text-2xl font-bold text-stone-900">{t('title')}</h1>
      <p className="mt-2 text-stone-600">{t('body')}</p>
      <Link
        href={`/${locale}`}
        className="mt-6 inline-block rounded-md bg-emerald-700 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
      >
        {t('backHome')}
      </Link>
    </div>
  );
}
