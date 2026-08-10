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

  // The church site used to live under /mockup. Config redirects run at
  // Netlify's edge and are cacheable, unlike middleware.
  //
  // 307 (permanent: false) on purpose for launch: browsers cache permanent
  // redirects aggressively, and a wrong path baked into someone's browser is
  // not something you can take back. Switch to 308 once the paths have settled.
  async redirects() {
    return [
      { source: '/mockup', destination: '/', permanent: false },
      { source: '/mockup/:path*', destination: '/:path*', permanent: false },
    ];
  },
};

module.exports = nextConfig;
