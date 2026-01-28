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
  transpilePackages: ["@vollio/shared"],
  // Enable Turbopack - the pdfjs-dist CSS is patched via postinstall script
  turbopack: {},
};

export default nextConfig;
