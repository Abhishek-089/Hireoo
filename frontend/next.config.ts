import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  // Explicitly configure Turbopack (the default bundler in Next.js 16)
  // to avoid warnings/errors about having a webpack config without a turbopack config.
  // Explicitly configure Turbopack (the default bundler in Next.js 16)
  // to avoid warnings/errors about having a webpack config without a turbopack config.
  turbopack: {
    root: process.cwd(),
  },
  // Logging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
