import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
  transpilePackages: ['gsap'],
};

export default nextConfig;
