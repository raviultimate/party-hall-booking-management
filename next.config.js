/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  distDir: '.next',
  experimental: {
    // Required for Vercel
    appDir: true,
  },
  // Ensure we can find the Next.js installation
  webpack: (config) => {
    return config;
  },
}

module.exports = nextConfig
