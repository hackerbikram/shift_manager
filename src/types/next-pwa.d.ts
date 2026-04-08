declare module "next-pwa" {
  import type { NextConfig } from "next";
  const nextPWA: (config: NextConfig & { pwa?: any }) => NextConfig;
  export default nextPWA;
}