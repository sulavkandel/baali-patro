'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function Nav({ locale }: { locale: string }) {
  const t = useTranslations('nav');
  const ta = useTranslations('app');
  const pathname = usePathname();

  const otherLocale = locale === 'ne' ? 'en' : 'ne';
  const switchedPath = pathname.replace(/^\/(en|ne)/, `/${otherLocale}`);

  const links = [
    { href: `/${locale}`, label: t('home') },
    { href: `/${locale}/advisory`, label: t('advisory') },
    { href: `/${locale}/about`, label: t('about') },
  ];

  return (
    <header className="sticky top-0 z-40 bg-emerald-800 text-white shadow">
      <nav
        className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6"
        aria-label="Main"
      >
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2 text-lg font-bold tracking-tight"
        >
          <span aria-hidden="true">🌾</span>
          {ta('title')}
        </Link>

        <div className="ml-auto flex items-center gap-1 sm:gap-3">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded px-2 py-1 text-sm hover:bg-emerald-700 sm:px-3 ${
                pathname === l.href ? 'bg-emerald-900 font-semibold' : ''
              }`}
            >
              {l.label}
            </Link>
          ))}

          <Link
            id="lang-toggle"
            href={switchedPath}
            aria-label={t('langToggleAria')}
            className="ml-1 rounded-full bg-amber-400 px-3 py-1 text-sm font-semibold text-stone-900 transition-colors hover:bg-amber-300"
          >
            {t('langToggle')}
          </Link>
        </div>
      </nav>
    </header>
  );
}
