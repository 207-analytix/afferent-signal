/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  // Set basePath to your GitHub repo name when deploying to GitHub Pages
  // e.g. basePath: '/afferent-signal'
  // Leave empty if deploying to a custom domain or root org page
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? '',
};

module.exports = nextConfig;
