import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n';

export default createMiddleware({
  locales,
  defaultLocale: 'en',
  localePrefix: 'always',
});

export const config = {
  // Skip api routes, Next internals and files with an extension
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
