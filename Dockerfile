# Multi-stage build for production optimization
FROM node:21-alpine AS base
WORKDIR /app

# Install system dependencies for native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc6-compat \
    curl

# Configure npm for better network handling
RUN npm config set fetch-timeout 300000 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retries 5

# Copy package files first for better caching
COPY package*.json ./
COPY next.config.mjs ./
COPY tailwind.config.ts ./
COPY tsconfig.json ./
COPY postcss.config.mjs ./

# Development stage
FROM base AS development
RUN npm ci --prefer-offline --no-audit --no-fund
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Builder stage
FROM base AS builder

# Build arguments with default values
ARG BUILDTIME="$(date -u +'%Y-%m-%dT%H:%M:%SZ')"
ARG VERSION="latest"
ARG REVISION="unknown"

# Install all dependencies (including dev dependencies)
RUN npm ci --prefer-offline --no-audit --no-fund

# Copy source code
COPY . .

# Set build environment for optimized production build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV BUILDTIME=$BUILDTIME
ENV VERSION=$VERSION
ENV REVISION=$REVISION

# Build with timeout and safer script to prevent hanging
RUN timeout 600 npm run build:safe || (echo "Build timed out after 10 minutes" && exit 1)

# Production stage with Node.js
FROM node:21-alpine AS production

WORKDIR /app

# Install system dependencies for health checks
RUN apk add --no-cache curl

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production --prefer-offline --no-audit --no-fund && npm cache clean --force

# Copy built application from builder
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy startup script
COPY start.sh ./
RUN chmod +x start.sh

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Set proper permissions
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port 3000
EXPOSE 3000

# Health check for container orchestration
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Add build information as labels  
LABEL org.opencontainers.image.title="Image Generation Admin"
LABEL org.opencontainers.image.description="AI-powered image generation administration interface"
LABEL org.opencontainers.image.version="latest"
LABEL org.opencontainers.image.created="$(date -u +'%Y-%m-%dT%H:%M:%SZ')"
LABEL org.opencontainers.image.revision="unknown"

# Start the Next.js application with startup script
CMD ["./start.sh"]


