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
  // Force webpack mode since our custom loader doesn't work with Turbopack
  turbopack: {},
  webpack: (config) => {
    // Ignore pdfjs-dist CSS url() references to images that don't exist
    config.module.rules.push({
      test: /pdf_viewer\.css$/,
      use: [
        {
          loader: "string-replace-loader",
          options: {
            search: /url\(images\/[^)]+\)/g,
            replace: 'url("")',
          },
        },
      ],
    });
    return config;
  },
};

export default nextConfig;
