/** @type {import('next').NextConfig} */
module.exports = {
  distDir: '_next',

  reactStrictMode: false,
  images: {
    domains: ['img.icons8.com'],
  },
  eslint: {
    dirs: ['src/pages', 'src/core', 'src/stores', 'src/templates', 'src/home'],
  },
};
