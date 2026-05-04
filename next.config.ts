import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Faster Vercel builds; lint still runs on PRs via .github/workflows/ci.yml
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
