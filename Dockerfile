FROM node:21-alpine AS base
WORKDIR /app
COPY package*.json ./
COPY . .

# Build arguments for environment variables
ARG NODE_ENV=production
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_API_URL

ENV NODE_ENV=${NODE_ENV}
ENV NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN npm install

# Development stage
FROM base AS development
EXPOSE 3001
CMD ["npm", "run", "dev"]

# Production build stage
FROM base AS builder
WORKDIR /app
ENV NODE_ENV=production

RUN npm run build

# Production runtime stage
FROM node:21-alpine AS production
WORKDIR /app

# Install wget for health checks
RUN apk add --no-cache wget

# Copy package files
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application (standalone mode)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership of the app directory to nextjs user
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3001

ENV PORT=3001
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]


