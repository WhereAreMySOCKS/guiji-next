import type { NextConfig } from "next";

const apiProxyTarget =
  process.env.API_PROXY_TARGET ||
  (process.env.NODE_ENV === "development" ? "http://127.0.0.1:8000" : "https://api.guiji.online");

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiProxyTarget.replace(/\/+$/, "")}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
