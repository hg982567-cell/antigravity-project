/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
      {
        protocol: 'https',
        hostname: 'assets.dropai.io',
      }
    ],
  },
  webpack: (config) => {
    config.cache = false;
    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/billing',
        destination: '/app/billing',
        permanent: true,
      },
      {
        source: '/subscription',
        destination: '/app/billing',
        permanent: true,
      },
      {
        source: '/subscriptions',
        destination: '/app/billing',
        permanent: true,
      },
      {
        source: '/dashboard/billing',
        destination: '/app/billing',
        permanent: true,
      },
      {
        source: '/dashboard/subscription',
        destination: '/app/billing',
        permanent: true,
      },
      {
        source: '/dashboard/subscriptions',
        destination: '/app/billing',
        permanent: true,
      },
      {
        source: '/app/subscription',
        destination: '/app/billing',
        permanent: true,
      },
      {
        source: '/app/subscriptions',
        destination: '/app/billing',
        permanent: true,
      },
      {
        source: '/dashboard',
        destination: '/app/dashboard',
        permanent: true,
      },
      {
        source: '/admin',
        destination: '/owner/login?redirect=/owner/dashboard',
        permanent: false,
      },
      {
        source: '/admin/billing',
        destination: '/owner/login?redirect=/owner/subscriptions',
        permanent: false,
      },
      {
        source: '/admin/subscription',
        destination: '/owner/login?redirect=/owner/subscriptions',
        permanent: false,
      },
      {
        source: '/admin/subscriptions',
        destination: '/owner/login?redirect=/owner/subscriptions',
        permanent: false,
      },
      {
        source: '/owner/billing',
        destination: '/owner/subscriptions',
        permanent: true,
      },
      {
        source: '/owner/subscription',
        destination: '/owner/subscriptions',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
