# Deploy — helali

SafShekan-style stack: nginx gateway + backend + frontend + postgres + redis + minio.

| Service | Host | Container |
|---------|------|-----------|
| nginx | `3032` | `helali-nginx` |
| backend | `3030` → `3000` | `helali-backend` |
| frontend | `3031` → `3000` | `helali-frontend` |
| minio | `9010` / `9011` | `helali-minio` |
| postgres / redis | internal | `helali-postgres` / `helali-redis` |

Remote: `/opt/helali`

## Secrets (GitHub Actions)

| Secret | Required |
|--------|----------|
| `SSH_PRIVATE_KEY` | yes (deploy skipped with warning if missing) |
| `SSH_HOST` | yes (default `5.159.49.36`) |
| `SSH_USER` | yes (default `root`) |
| `GHCR_PULL_TOKEN` | recommended for private GHCR pull on VPS |

## First boot

```bash
mkdir -p /opt/helali/docker /opt/helali/data
cd /opt/helali
# after first Actions sync of compose + nginx.conf:
cp .env.example .env   # set passwords / ports
docker compose pull
docker compose up -d postgres redis --wait
docker compose up -d minio
docker compose run --rm --no-deps backend npx prisma migrate deploy --schema=apps/backend/prisma/schema.prisma
docker compose up -d --force-recreate --wait backend
docker compose up -d --force-recreate --wait frontend
docker compose up -d --force-recreate --wait nginx
docker ps --filter name=helali
curl -kfsS https://127.0.0.1:3032/api/v1/health
```

## Rollback

Pin previous `BACKEND_IMAGE` / `FRONTEND_IMAGE` in `.env`, then:

```bash
docker compose pull backend frontend
docker compose up -d --force-recreate --wait backend
docker compose up -d --force-recreate --wait frontend
docker compose up -d --force-recreate --wait nginx
```
