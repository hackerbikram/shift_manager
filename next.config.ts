import nextPWA from "next-pwa";
import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// ✅ Proper PWA wrapper
const withPWA = nextPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: isDev, // 🔥 disable in dev (IMPORTANT)
});

// ✅ Your actual Next config
const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config) => config,
  turbopack: {},
};

// ✅ Correct export
export default withPWA(nextConfig);