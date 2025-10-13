# Build stage
FROM node:21-alpine AS builder

WORKDIR /app

# Install build dependencies for native modules (sqlite3)
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the static export
RUN npm run build

# Production stage - Use nginx for better performance and Docker Swarm compatibility
FROM nginx:alpine AS production

# Remove default nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files from builder stage (static export goes to 'out' directory)
COPY --from=builder /app/out /usr/share/nginx/html

# Install wget for health checks
RUN apk add --no-cache wget

# Set proper permissions for nginx directories
RUN chmod -R 755 /usr/share/nginx/html && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx

# Expose port 80 (standard for nginx)
EXPOSE 80

# Health check for Docker Swarm
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/health || exit 1

# Start nginx as root (safe in containers)
CMD ["nginx", "-g", "daemon off;"]
