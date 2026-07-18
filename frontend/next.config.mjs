import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // standalone output keeps the Docker image small (only traced files are copied)
  output: 'standalone',
  reactStrictMode: true,
};

export default withNextIntl(nextConfig);
