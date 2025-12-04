  import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/notes/:path*",
        destination: "http://localhost:3000/api/v1/notes/:path*",
      },
    ];
  },
};

export default nextConfig;
