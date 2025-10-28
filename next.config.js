/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  distDir: '.next',
  // Netlify specific settings
  target: 'serverless',
  // Ensure we can find the Next.js installation
  webpack: (config) => {
    return config;
  },
}

module.exports = nextConfig
