import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Use standalone output for production deployment with Node.js
    output: 'standalone',
    trailingSlash: true,
    // Optimize build performance
    experimental: {
        // Disable unnecessary optimizations during build
        optimizePackageImports: ['react-icons', '@fortawesome/react-fontawesome'],
    },
    // Optimize compilation
    compiler: {
        // Remove console logs in production
        removeConsole: process.env.NODE_ENV === 'production',
    },
    images: {
        unoptimized: true,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*',
            },
            {
                protocol: 'http',
                hostname: '*',
            },
        ],
    },
    devIndicators: {
        autoPrerender: false,
    },
    // Optimize bundle analysis
    webpack: (config, { isServer }) => {
        // Optimize for faster builds
        config.optimization.minimize = process.env.NODE_ENV === 'production';

        // Reduce bundle size in production
        if (!isServer && process.env.NODE_ENV === 'production') {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                path: false,
                os: false,
            };
        }

        return config;
    },
    outputFileTracingRoot: __dirname,
};

export default nextConfig;
