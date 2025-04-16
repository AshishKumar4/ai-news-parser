import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    API_PROVIDER: process.env.API_PROVIDER || 'gemini',
  },
  // Add images configuration with more specific patterns for security
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', 
        // We need to allow various news sites, but consider restricting this in production
      },
    ],
  },
  // Configure async resource fetching
  experimental: {
    serverActions: {
      // Consider limiting allowed origins for production
      allowedOrigins: process.env.NODE_ENV === 'production' 
        ? [process.env.NEXT_PUBLIC_SITE_URL || ''] 
        : ['localhost:3000'],
    },
  },
};

export default nextConfig;
