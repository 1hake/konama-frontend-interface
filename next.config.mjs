import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Disable static export for now since we have many dynamic API routes
    // If you need static export, consider moving API routes to a separate service
    trailingSlash: true,
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
    distDir: 'out',
    outputFileTracingRoot: __dirname,
};

export default nextConfig;
