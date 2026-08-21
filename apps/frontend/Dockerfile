ARG NODE_IMAGE=node:20-alpine
FROM ${NODE_IMAGE} AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json* .npmrc* ./
COPY apps/frontend/package.json ./apps/frontend/
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json ./packages/shared/
# Root postinstall builds shared + prisma generate (needs backend). Skip scripts in deps stage.
RUN npm ci --ignore-scripts --legacy-peer-deps \
  --workspace=@helali/frontend \
  --workspace=@helali/shared \
  --include-workspace-root

FROM base AS builder
ARG NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
ARG MINIO_ENDPOINT=localhost
ARG MINIO_PORT=9000
ARG MINIO_USE_SSL=false
ARG BACKEND_INTERNAL_ORIGIN=http://localhost:4000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV MINIO_ENDPOINT=$MINIO_ENDPOINT
ENV MINIO_PORT=$MINIO_PORT
ENV MINIO_USE_SSL=$MINIO_USE_SSL
ENV BACKEND_INTERNAL_ORIGIN=$BACKEND_INTERNAL_ORIGIN
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build -w @helali/shared
RUN npm run build -w @helali/frontend
FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app

RUN apk add --no-cache wget \
  && addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/frontend/public ./apps/frontend/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/static ./apps/frontend/.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "apps/frontend/server.js"]
