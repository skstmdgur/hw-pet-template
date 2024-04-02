const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH;

/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
  reactStrictMode: false,
  output: BASE_PATH === '/' ? 'standalone' : 'export',
  basePath: BASE_PATH === '/' ? '' : BASE_PATH,
  transpilePackages: ['@repo/ui', '@repo/altinolite-ble'],
};

module.exports = nextConfig;
