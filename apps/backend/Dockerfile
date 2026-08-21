ARG NODE_IMAGE=node:20-alpine
FROM ${NODE_IMAGE} AS base
WORKDIR /app

FROM base AS builder
ENV PUPPETEER_SKIP_DOWNLOAD=true

COPY package.json package-lock.json .npmrc* ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/shared/package.json ./packages/shared/
RUN npm ci --ignore-scripts --legacy-peer-deps

COPY . .
RUN npm run build -w @helali/shared
RUN npx prisma generate --schema=apps/backend/prisma/schema.prisma
RUN npm run build -w @helali/backend

FROM base AS runner
ENV NODE_ENV=production
ENV PUPPETEER_SKIP_DOWNLOAD=true
WORKDIR /app

RUN apk add --no-cache ffmpeg wget

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/package.json ./apps/backend/
COPY --from=builder /app/apps/backend/prisma ./apps/backend/prisma
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/

EXPOSE 4000
CMD ["sh", "-c", "npx prisma migrate deploy --schema=apps/backend/prisma/schema.prisma && node apps/backend/dist/main.js"]
