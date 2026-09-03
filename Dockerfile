# SRC https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile

# ============================================
# Stage 1: Dependencies Installation Stage
# ============================================

# IMPORTANT: Node.js Version Maintenance
# This Dockerfile defaults to Node.js 24.14.1-slim to match the repo's Node 24 baseline.
# To ensure security and compatibility, update the NODE_VERSION ARG when the project's Node baseline changes.
ARG NODE_VERSION=24.14.1-slim

FROM node:${NODE_VERSION} AS dependencies

# Set working directory
WORKDIR /app

# Copy package-related files first to leverage Docker's caching mechanism.
#
# ⚠ ESTE ES UN MONOREPO DE WORKSPACES NPM (`apps/*`, `packages/*`), y el
# patrón de una sola línea del ejemplo original (para una app suelta) es
# INSUFICIENTE aquí: `npm ci` en la raíz resuelve las dependencias que
# declara CADA `package.json` de workspace — sin ellos presentes, no sabe que
# `apps/web` depende de `next`, y no lo instala. Medido (144.ª): con sólo el
# `package.json` raíz copiado, `npm ci` sale con éxito y `node_modules/.bin/`
# NO tiene `next` — ni siquiera existe `node_modules/@next`. La build
# siguiente muere con `sh: 1: next: not found`, sin tocar la base de datos.
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./
COPY apps/web/package.json ./apps/web/package.json
COPY apps/cms/package.json ./apps/cms/package.json
COPY packages/cms-config/package.json ./packages/cms-config/package.json

# Install project dependencies with frozen lockfile for reproducible builds
RUN --mount=type=cache,target=/root/.npm \
  --mount=type=cache,target=/usr/local/share/.cache/yarn \
  --mount=type=cache,target=/root/.local/share/pnpm/store \
  if [ -f package-lock.json ]; then \
  npm ci --no-audit --no-fund; \
  elif [ -f yarn.lock ]; then \
  corepack enable yarn && yarn install --frozen-lockfile --production=false; \
  elif [ -f pnpm-lock.yaml ]; then \
  corepack enable pnpm && pnpm install --frozen-lockfile; \
  else \
  echo "No lockfile found." && exit 1; \
  fi

# ============================================
# Stage 2: Build Next.js application in standalone mode
# ============================================

FROM node:${NODE_VERSION} AS builder

# Set working directory
WORKDIR /app

# Copy project dependencies from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy application source code
COPY . .

ENV NODE_ENV=production

# `next build` de este proyecto lee contenido por la Local API de Payload
# (apps/web/next.config.ts) durante el propio build, así que la etapa
# `builder` necesita alcanzar la base de datos y el secreto de Payload — no
# son opcionales: `construyeConfig()` (packages/cms-config) tira si faltan,
# a propósito (sin valor por defecto: apuntaría a una DB que no es la que
# crees). Se pasan como ARG y no se hornean en ENV de la imagen final: sólo
# viven en la etapa `builder`, que no es la que se publica.
ARG DATABASE_URI
ARG PAYLOAD_SECRET
ENV DATABASE_URI=${DATABASE_URI}
ENV PAYLOAD_SECRET=${PAYLOAD_SECRET}

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js application
# If you want to speed up Docker rebuilds, you can cache the build artifacts
# by adding: --mount=type=cache,target=/app/.next/cache
# This caches the .next/cache directory across builds, but it also prevents
# .next/cache/fetch-cache from being included in the final image, meaning
# cached fetch responses from the build won't be available at runtime.
RUN if [ -f package-lock.json ]; then \
  npm run build; \
  elif [ -f yarn.lock ]; then \
  corepack enable yarn && yarn build; \
  elif [ -f pnpm-lock.yaml ]; then \
  corepack enable pnpm && pnpm build; \
  else \
  echo "No lockfile found." && exit 1; \
  fi

# ============================================
# Stage 3: Run Next.js application
# ============================================

FROM node:${NODE_VERSION} AS runner

# Set working directory
WORKDIR /app

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the run time.
# ENV NEXT_TELEMETRY_DISABLED=1

# Copy production assets
COPY --from=builder --chown=node:node /app/apps/web/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown node:node .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=node:node /app/apps/web/.next/standalone ./
COPY --from=builder --chown=node:node /app/apps/web/.next/static ./apps/web/.next/static

# If you want to persist the fetch cache generated during the build so that
# cached responses are available immediately on startup, uncomment this line:
# COPY --from=builder --chown=node:node /app/apps/web/.next/cache ./apps/web/.next/cache

# Switch to non-root user for security best practices
USER node

# Expose port 3000 to allow HTTP traffic
EXPOSE 3000

# Start Next.js standalone server.
#
# ⚠ `server.js` NO vive en la raíz de `.next/standalone` en un monorepo: el
# output de `output: standalone` preserva la ruta del paquete dentro del
# workspace. Comprobado (144.ª, sin Docker): `apps/web/.next/standalone/`
# contiene `apps/` y `node_modules/`, y `server.js` está en
# `apps/web/server.js` — CERO en la raíz. `CMD ["node", "server.js"]` con
# `WORKDIR /app` busca `/app/server.js`, que no existe, y el contenedor
# muere en el primer arranque con `MODULE_NOT_FOUND`.
CMD ["node", "apps/web/server.js"]