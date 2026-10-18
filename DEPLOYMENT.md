# Deploy — helali (SafShekan-style)

| Service | Host | Container |
|---------|------|-----------|
| nginx | `3032` | `helali-nginx` |
| backend | `3030` → `3000` | `helali-backend` |
| frontend | `3031` → `3000` | `helali-frontend` |
| minio | `9010` / `9011` | `helali-minio` |
| postgres / redis | internal | `helali-postgres` / `helali-redis` |

Remote: `/opt/helali`

## Secrets

`SSH_PRIVATE_KEY`, `SSH_HOST`, `SSH_USER`, `GHCR_PULL_TOKEN`

## First boot

```bash
mkdir -p /opt/helali/docker /opt/helali/data
cd /opt/helali
# sync docker-compose.prod.yml → docker-compose.yml + docker/nginx.conf via Actions
cp .env.example .env   # set passwords + BACKEND_PORT/FRONTEND_PORT/NGINX_PORT
docker compose pull
docker compose up -d postgres redis minio --wait
docker compose run --rm --no-deps backend npx prisma migrate deploy --schema=apps/backend/prisma/schema.prisma
docker compose up -d --force-recreate --wait backend
docker compose up -d --force-recreate --wait frontend
docker compose up -d --force-recreate --wait nginx
docker ps --filter name=helali
curl -kfsS https://127.0.0.1:3032/api/v1/health
```

## Rollback

Restore previous `BACKEND_IMAGE` / `FRONTEND_IMAGE` in `.env`, then recreate backend → frontend → nginx.
