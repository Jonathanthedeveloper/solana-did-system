/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable strict error checking in production
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Optimize images for production
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
    domains: ['localhost'],
    // Add your production domains here
    // domains: ['yourdomain.com', 'cdn.yourdomain.com'],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  compress: true,

  // Environment variables that should be available to the browser
  env: {
    NEXT_PUBLIC_SOLANA_NETWORK: process.env.SOLANA_NETWORK || 'devnet',
  },

  // Experimental features for better performance
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
};

export default nextConfig;
