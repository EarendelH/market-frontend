import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:5001/:path*",
      },
      {
        source: "/uploads/:path*",
        destination: "http://localhost:5001/uploads/:path*",
      },
    ];
  },
};

export default nextConfig;