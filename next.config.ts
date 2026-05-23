import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 images: {
    domains: ["images.unsplash.com", "images.pexels.com"],
    qualities: [75, 85],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
    ],
  },
};

export default nextConfig;
