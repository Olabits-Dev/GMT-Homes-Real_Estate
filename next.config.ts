import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  images: {
    minimumCacheTTL: 0,
    unoptimized: isDevelopment,
  },
  outputFileTracingIncludes: {
    "/*": ["./data/**/*.json"],
  },
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
