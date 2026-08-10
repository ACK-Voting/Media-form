/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure images are optimized for Netlify
  images: {
    unoptimized: false,
  },
  // No `output` setting: @netlify/plugin-nextjs produces its own output, and
  // 'standalone' conflicts with it in ways that surface as confusing runtime
  // errors rather than build failures.
  //
  // Skip type checking and linting during build
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
