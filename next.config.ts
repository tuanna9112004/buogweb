import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cấu hình Next.js 16.3: Tăng giới hạn upload qua proxy (trước đây là middleware)
  experimental: {
    proxyClientMaxBodySize: '50mb',
  },
};

export default nextConfig;
