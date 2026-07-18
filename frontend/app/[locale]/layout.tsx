import type { Metadata } from 'next';
import { Inter, Noto_Sans_Devanagari } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import {
  getMessages,
  getTranslations,
  unstable_setRequestLocale,
} from 'next-intl/server';
import { locales } from '@/i18n';
import Nav from '@/components/Nav';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const devanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-devanagari',
  display: 'swap',
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'app' });
  return {
    title: { default: t('title'), template: `%s · ${t('title')}` },
    description: t('tagline'),
  };
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);
  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: 'app' });
  const tf = await getTranslations({ locale, namespace: 'footer' });

  return (
    <html lang={locale} className={`${inter.variable} ${devanagari.variable}`}>
      <body className="min-h-screen bg-stone-50 font-sans text-stone-900 antialiased">
        <NextIntlClientProvider messages={messages}>
          <Nav locale={locale} />
          <main id="main-content" className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6">
            {children}
          </main>
          <footer className="border-t border-stone-200 bg-white">
            <div className="mx-auto max-w-6xl space-y-2 px-4 py-6 text-sm text-stone-600 sm:px-6">
              <p className="font-medium">{tf('builtFor')}</p>
              <p>{t('disclaimer')}</p>
              <p>
                {tf('dataBy')} ·{' '}
                <a
                  href="https://open-meteo.com/"
                  className="underline hover:text-emerald-700"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  open-meteo.com
                </a>
              </p>
            </div>
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
