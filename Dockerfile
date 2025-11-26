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

# Copy package files first for better caching
COPY package*.json ./
COPY next.config.mjs ./
COPY tailwind.config.ts ./
COPY tsconfig.json ./
COPY postcss.config.mjs ./

# Development stage
FROM base AS development
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Builder stage
FROM base AS builder

# Install all dependencies (including dev dependencies)
RUN npm ci

# Copy source code
COPY . .

# Set build environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build arguments for build-time information
ARG BUILDTIME
ARG VERSION  
ARG REVISION

# Set build-time environment variables
ENV BUILDTIME=$BUILDTIME
ENV VERSION=$VERSION
ENV REVISION=$REVISION

# Build the application (static export)
RUN npm run build

# Production stage with Node.js
FROM node:21-alpine AS production

WORKDIR /app

# Install system dependencies for health checks
RUN apk add --no-cache curl

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Set proper permissions
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port 3000
EXPOSE 3000

# Health check for container orchestration
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Add build information as labels
LABEL org.opencontainers.image.title="Image Generation Admin"
LABEL org.opencontainers.image.description="AI-powered image generation administration interface"
LABEL org.opencontainers.image.version="$VERSION"
LABEL org.opencontainers.image.created="$BUILDTIME"
LABEL org.opencontainers.image.revision="$REVISION"

# Start the Next.js application
CMD ["node", "server.js"]

# Alternative Node.js production stage (uncomment if you need server-side rendering)
# FROM node:21-alpine AS node-production
# 
# WORKDIR /app
# 
# # Install production dependencies only
# COPY package*.json ./
# RUN npm ci --only=production && npm cache clean --force
# 
# # Copy built application from builder
# COPY --from=builder /app/.next/standalone ./
# COPY --from=builder /app/.next/static ./.next/static
# COPY --from=builder /app/public ./public
# 
# # Create non-root user for security
# RUN addgroup --system --gid 1001 nodejs && \
#     adduser --system --uid 1001 nextjs
# 
# # Set proper permissions
# RUN chown -R nextjs:nodejs /app
# USER nextjs
# 
# # Expose port
# EXPOSE 3000
# 
# # Health check
# HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
#     CMD curl -f http://localhost:3000/api/health || exit 1
# 
# # Start the application
# CMD ["node", "server.js"]
