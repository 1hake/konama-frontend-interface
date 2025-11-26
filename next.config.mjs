import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Use standalone output for production deployment with Node.js
    output: 'standalone',
    trailingSlash: true,

    // Keep experimental features minimal to avoid build issues
    experimental: {},

    // Basic image configuration
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

    // Disable dev indicators that might cause issues
    devIndicators: {
        autoPrerender: false,
    },

    // Output tracing
    outputFileTracingRoot: __dirname,
};

export default nextConfig;
