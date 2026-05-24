import type {NextConfig} from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
    ],
  },
  // Dynamic output mode: 'export' only for mobile builds
  output: process.env.BUILD_MOBILE === 'true' ? 'export' : undefined,
  transpilePackages: ['motion'],
  webpack: (config, {dev}) => {
    config.resolve.alias['node-domexception'] = path.resolve(__dirname, 'lib/domexception.js');

    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = {
        ignored: /.*/,
      };
    }
    return config;
  },
};

export default nextConfig;
