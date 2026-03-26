import type { NextConfig } from "next";
import withPWA from '@ducanh2912/next-pwa';

const isElectronBuild = process.env.ELECTRON_BUILD === 'true';

const baseConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['antd', '@ant-design/icons'],
  output: isElectronBuild ? 'export' : 'standalone',
  images: {
    unoptimized: isElectronBuild,
  },
};

// Для Electron build - без PWA
if (isElectronBuild) {
  module.exports = baseConfig;
} else {
  // Для PWA - с webpack конфигом
  const pwaConfig = withPWA({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
    register: true,
    sw: 'sw.js',
    fallbacks: {
      document: '/offline',
    },
  });
  
  module.exports = pwaConfig(baseConfig);
}

export {};
