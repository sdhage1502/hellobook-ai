import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'demo.hellobooks.ai',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
