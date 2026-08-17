import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tăng giới hạn dung lượng body để cho phép upload file audio lên đến 50MB qua Proxy
  middlewareClientMaxBodySize: '50mb',
};

export default nextConfig;
