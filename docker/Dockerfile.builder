# ============================================
# Builder (Node worker) - Dockerfile terpisah
# ============================================
FROM node:20-bookworm-slim AS deps
RUN corepack enable pnpm
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY tsconfig.base.json ./
COPY apps/builder/package.json ./apps/builder/
COPY apps/client/package.json ./apps/client/
COPY apps/scraper/package.json ./apps/scraper/
COPY packages/database/package.json ./packages/database/
COPY packages/database/prisma ./packages/database/prisma
COPY packages/types/package.json ./packages/types/

RUN pnpm install --frozen-lockfile

# ---------- Build ----------
FROM deps AS builder
WORKDIR /app
COPY apps ./apps
COPY packages ./packages

RUN pnpm db:gen && pnpm turbo run build --filter=builder

# ---------- Runner ----------
FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml /app/turbo.json ./
COPY --from=builder /app/tsconfig.base.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps ./apps
COPY --from=builder /app/packages ./packages

WORKDIR /app/apps/builder
CMD ["node", "dist/index.js"]
