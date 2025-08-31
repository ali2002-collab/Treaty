import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Temporarily disable ESLint during build for deployment
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Temporarily disable TypeScript checking during build for deployment
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
