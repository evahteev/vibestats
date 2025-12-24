# syntax=docker/dockerfile:1.4
# Multi-stage Dockerfile for Vibe Coders Leaderboard
# Optimized for production deployment

# ==============================================================================
# Base stage
# ==============================================================================
FROM node:20-alpine AS base

LABEL org.opencontainers.image.title="Vibe Coders Leaderboard"
LABEL org.opencontainers.image.description="AI coding stats leaderboard"
LABEL org.opencontainers.image.version="1.0.0"

RUN apk add --no-cache libc6-compat
WORKDIR /app

# ==============================================================================
# Stage 1: Install dependencies
# ==============================================================================
FROM base AS deps

# Required for building better-sqlite3 native bindings
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./

RUN npm ci

# ==============================================================================
# Stage 2: Build the application
# ==============================================================================
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Verify standalone build was created
RUN ls -la .next/ && ls -la .next/standalone/

# ==============================================================================
# Stage 3: Runtime image
# ==============================================================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone build output from Next.js
COPY --from=builder --chown=1001:1001 /app/.next/standalone ./
COPY --from=builder --chown=1001:1001 /app/.next/static ./.next/static
COPY --from=builder --chown=1001:1001 /app/public ./public

# Copy scripts for seeding mock data
COPY --from=builder --chown=1001:1001 /app/scripts ./scripts

# Create data directory for SQLite database
RUN mkdir -p /app/data && chown 1001:1001 /app/data

# Switch to non-root user
USER 1001

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode && r.statusCode < 500 ? 0 : 1)}).on('error', () => process.exit(1))"

CMD ["node", "server.js"]
