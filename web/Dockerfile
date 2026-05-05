# ---- Stage 1: Install dependencies ----
FROM node:20-alpine AS deps
WORKDIR /app

# Install libc6-compat for some native node modules on alpine
RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && \
    npm ci --ignore-scripts

# ---- Stage 2: Build ----
# MONGODB_URI and other server-side vars are runtime-only in Next.js.
# They must NOT be baked into the image — injected via docker-compose env_file at runtime.
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time public vars (only NEXT_PUBLIC_ prefix are embedded at build time)
# Provide dummy vars to satisfy build-time static optimization checks
RUN MONGODB_URI=mongodb://localhost:27017/dummy \
    JWT_SECRET=dummy_secret_for_build \
    NEXT_PUBLIC_APP_URL=http://localhost:3000 \
    npm run build

# ---- Stage 3: Production runner ----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy only the necessary build artifacts
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/postcss.config.mjs ./postcss.config.mjs

USER nextjs

EXPOSE 3000

CMD ["npm", "start"]
