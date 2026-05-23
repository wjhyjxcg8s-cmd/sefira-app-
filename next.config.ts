import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 images: {
    domains: ["images.unsplash.com", "images.pexels.com", "randomuser.me"],
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
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
    ],
  },
};

export default nextConfig;
