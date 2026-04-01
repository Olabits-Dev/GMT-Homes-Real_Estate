import path from "node:path";
import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === "development";

if (!isDevelopment && !process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET must be set for production builds.");
}

const nextConfig: NextConfig = {
  images: {
    minimumCacheTTL: 0,
    remotePatterns: [
      {
        hostname: "res.cloudinary.com",
        protocol: "https",
      },
    ],
    unoptimized: isDevelopment,
  },
  outputFileTracingRoot: path.join(import.meta.dirname, ".."),
  async headers() {
    if (!isDevelopment) {
      return [];
    }

    const noStoreHeaders = [
      {
        key: "Pragma",
        value: "no-cache",
      },
      {
        key: "Expires",
        value: "0",
      },
      {
        key: "Surrogate-Control",
        value: "no-store",
      },
    ];

    return [
      {
        source: "/:path*",
        headers: noStoreHeaders,
      },
      {
        source: "/_next/:path*",
        headers: noStoreHeaders,
      },
      {
        source: "/properties/:path*",
        headers: noStoreHeaders,
      },
    ];
  },
};

export default nextConfig;
