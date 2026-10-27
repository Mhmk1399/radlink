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

# NEXT_PUBLIC_* values are embedded into browser bundles by `next build`.
# These values are public URLs/names only; never pass access keys as build args.
ARG NEXT_PUBLIC_LIARA_BUCKET_NAME
ARG NEXT_PUBLIC_LIARA_PUBLIC_URL
ARG NEXT_PUBLIC_STORAGE_URL
ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_LIARA_BUCKET_NAME=${NEXT_PUBLIC_LIARA_BUCKET_NAME}
ENV NEXT_PUBLIC_LIARA_PUBLIC_URL=${NEXT_PUBLIC_LIARA_PUBLIC_URL}
ENV NEXT_PUBLIC_STORAGE_URL=${NEXT_PUBLIC_STORAGE_URL}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}

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
 && adduser --system --uid 1001 --ingroup nodejs nextjs

# Copy standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# Copy static assets
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Copy public folder
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

RUN mkdir -p /app/.next/cache \
    && chown -R nextjs:nodejs /app/.next /app/public

    
USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
