/** @type {import('next').NextConfig} */
module.exports = {
  distDir: '_next',

  reactStrictMode: false,
  images: {
    domains: ['img.icons8.com'],
    unoptimized: true,
    loader: 'custom',
    loaderFile: './src/utils/image-loader',
  },
  eslint: {
    dirs: ['src/pages', '../core', '../../../stores', 'src/templates', 'src/home'],
  },
  // This ensures that HTML files are generated for each page
  exportPathMap: async function() {
    return {
      '/': { page: '/' },
      '/editor': { page: '/editor' }
    };
  },
  // Fix asset path issues in static export
  assetPrefix: './',
  basePath: '',
};
