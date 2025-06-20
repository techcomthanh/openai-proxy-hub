# Multi-stage build for OpenAI Proxy HUB
FROM node:18-alpine AS base

# Install system dependencies
RUN apk add --no-cache curl

# Build the application
FROM base AS builder
WORKDIR /app

# Copy package files and install all dependencies (including dev)
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 appuser

# Copy package files and install all dependencies (needed for esbuild externals)
COPY package*.json ./
RUN npm ci && npm cache clean --force

# Copy built application
COPY --from=builder /app/dist ./dist

# Copy other necessary files
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/shared ./shared

# Create logs directory
RUN mkdir -p /app/logs

# Set correct permissions
RUN chown -R appuser:nodejs /app
USER appuser

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:5000/api/auth/me || exit 1

# Set environment variables
ENV PORT=5000

# Start the application
CMD ["npm", "start"]