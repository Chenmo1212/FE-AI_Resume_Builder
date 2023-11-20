/** @type {import('next').NextConfig} */
module.exports = {
  assetPrefix: '/.next',
  reactStrictMode: false,
  images: {
    domains: ['img.icons8.com'],
  },
  eslint: {
    dirs: ['src/pages', 'src/core', 'src/stores', 'src/templates', 'src/home'],
  },
};
