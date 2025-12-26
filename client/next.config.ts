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
      {
        source: "/api/v1/integrations/:path*",
        destination: "http://localhost:3000/api/v1/integrations/:path*",
      },
      {
        source: "/api/v1/documents/:path*",
        destination: "http://localhost:3000/api/v1/documents/:path*",
      },
      {
        source: "/api/v1/quizzes/:path*",
        destination: "http://localhost:3000/api/v1/quizzes/:path*",
      },
      {
        source: "/api/v1/flashcards/:path*",
        destination: "http://localhost:3000/api/v1/flashcards/:path*",
      },
      {
        source: "/api/v1/folders/:path*",
        destination: "http://localhost:3000/api/v1/folders/:path*",
      },
      {
        source: "/api/v1/highlights/:path*",
        destination: "http://localhost:3000/api/v1/highlights/:path*",
      },
      {
        source: "/api/v1/test/:path*",
        destination: "http://localhost:3000/api/v1/test/:path*",
      },
    ];
  },
};

export default nextConfig;
