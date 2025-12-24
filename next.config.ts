/**
 * @author Shiva Nagendra Babu Kore
 */

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Vercel optimized configuration */

  // Enable experimental features for better performance
  experimental: {
    // Enable server actions
    serverActions: {
      allowedOrigins: ["localhost:3000", "*.vercel.app"],
    },
  },

  // Image optimization
  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      // Add your Supabase project domain here
      // {
      //   protocol: 'https',
      //   hostname: 'your-project.supabase.co',
      //   port: '',
      //   pathname: '/**',
      // },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media.licdn.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // Security and SEO headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "X-Robots-Tag",
            value: "index, follow",
          },
        ],
      },
      // Specific headers for static assets
      {
        source: "/(.*)\\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // Environment variables validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Output file tracing for optimal bundle size
  outputFileTracingRoot: __dirname,

  // Standalone output for better performance on Vercel
  output: "standalone",

  // Compress responses
  compress: true,

  // Enable React strict mode
  reactStrictMode: true,

  // Disable ESLint during builds (use CI for linting)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Optimize webpack bundle
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize for production
    if (!dev && !isServer) {
      config.optimization.splitChunks.chunks = "all";
    }

    return config;
  },

  // Performance optimizations (swcMinify is now default in Next.js 15)

  // PWA and static optimization
  trailingSlash: false,
  poweredByHeader: false,
};

export default nextConfig;
