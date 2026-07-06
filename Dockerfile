FROM node:20-alpine AS base

# ────────────────────────────────────────────────────────────────────────────
# Stage 1 – install all dependencies (including native modules like bcrypt)
# ────────────────────────────────────────────────────────────────────────────
FROM base AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# ────────────────────────────────────────────────────────────────────────────
# Stage 2 – build the Next.js application
# ────────────────────────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time env vars (non-secret public vars can be set here if needed)
# ENV NEXT_PUBLIC_EXAMPLE=value

RUN npm run build

# ────────────────────────────────────────────────────────────────────────────
# Stage 3 – minimal production image
# ────────────────────────────────────────────────────────────────────────────
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/.next/standalone ./
# Copy static assets
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Copy public folder
COPY --from=builder /app/public ./public

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
