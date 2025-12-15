import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Ignore ESLint errors during production builds
  },
  typescript: {
    ignoreBuildErrors: false, // Keep TypeScript errors as they are important
  },
};

export default nextConfig;
