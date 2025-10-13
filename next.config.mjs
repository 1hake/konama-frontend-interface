import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Only use static export for production builds
    ...(process.env.NODE_ENV === 'production' && { output: 'export' }),
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
