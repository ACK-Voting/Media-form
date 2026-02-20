/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure images are optimized for Netlify
  images: {
    unoptimized: false,
  },
  // Enable standalone output for better Netlify performance
  output: 'standalone',
  // Skip type checking and linting during build
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
