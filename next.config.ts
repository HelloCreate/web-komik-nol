import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-4c4801eca57e45a3b078b902bbce79a6.r2.dev',
      },
    ],
  },
};

export default nextConfig;