import type { NextConfig } from "next";
import withPWA from '@ducanh2912/next-pwa';

const isElectronBuild = process.env.ELECTRON_BUILD === 'true';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['antd', '@ant-design/icons'],
  output: isElectronBuild ? 'export' : undefined,
  images: {
    unoptimized: isElectronBuild,
  },
};

const pwaConfig = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  sw: 'sw.js',
  fallbacks: {
    document: '/offline',
  },
});

export default pwaConfig(nextConfig);
