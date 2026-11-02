import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  experimental: {
    // Increase Server Actions body size limit for photo uploads
    // Default is 1MB, we need at least 16MB (3 photos x 5MB + metadata)
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
};

export default nextConfig;
