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

# Production stage with nginx
FROM nginx:alpine AS production

# Install additional packages for health checks and debugging
RUN apk add --no-cache curl wget

# Remove default nginx configuration
RUN rm -rf /etc/nginx/conf.d/default.conf /var/www/html/*

# Create custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files from builder stage
COPY --from=builder /app/out /usr/share/nginx/html

# Create health check endpoint
RUN mkdir -p /usr/share/nginx/html/health && \
    echo '<!DOCTYPE html><html><head><title>Health Check</title></head><body><h1>OK</h1></body></html>' > /usr/share/nginx/html/health/index.html

# Copy and setup entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Set proper permissions
RUN chmod -R 755 /usr/share/nginx/html && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    mkdir -p /var/cache/nginx/client_temp && \
    chown -R nginx:nginx /var/cache/nginx/client_temp

# Create nginx user directories with proper permissions
RUN mkdir -p /var/run/nginx && \
    chown nginx:nginx /var/run/nginx

# Expose port 80 for nginx
EXPOSE 80

# Health check for container orchestration
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Add build information as labels
LABEL org.opencontainers.image.title="Image Generation Admin"
LABEL org.opencontainers.image.description="AI-powered image generation administration interface"
LABEL org.opencontainers.image.version="$VERSION"
LABEL org.opencontainers.image.created="$BUILDTIME"
LABEL org.opencontainers.image.revision="$REVISION"

# Use custom entrypoint
ENTRYPOINT ["docker-entrypoint.sh"]

# Start nginx (runs as root in container which is acceptable)
CMD ["nginx", "-g", "daemon off;"]

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
