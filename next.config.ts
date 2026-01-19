import type { NextConfig } from "next";

// Trigger restart
const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
