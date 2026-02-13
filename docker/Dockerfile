# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:20-bookworm-slim AS deps
RUN corepack enable pnpm

WORKDIR /app

# Copy workspace config & root package
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY tsconfig.base.json ./

# Copy each package manifest (for better layer cache)
COPY apps/client/package.json ./apps/client/
COPY apps/builder/package.json ./apps/builder/
COPY apps/scraper/package.json ./apps/scraper/
COPY packages/database/package.json ./packages/database/
COPY packages/types/package.json ./packages/types/

# Install dependencies (no build yet)
RUN pnpm install --frozen-lockfile

# ============================================
# Stage 2: Build
# ============================================
FROM deps AS builder
WORKDIR /app

# Copy full source (prisma schema, migrations, apps, packages)
COPY apps ./apps
COPY packages ./packages

# Generate Prisma client & build all apps with Turbo
RUN pnpm db:gen && pnpm build

# ============================================
# Stage 3: Runner (production image)
# ============================================
FROM node:20-bookworm-slim AS runner

# Install Chromium & deps for Puppeteer (scraper)
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

RUN corepack enable pnpm

WORKDIR /app

# Copy built output & node_modules from builder
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml /app/turbo.json ./
COPY --from=builder /app/tsconfig.base.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps ./apps
COPY --from=builder /app/packages ./packages

# Default: run client (override in docker-compose per service)
EXPOSE 3000
CMD ["pnpm", "--filter", "client", "start"]
