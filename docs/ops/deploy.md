# Deploy runbook — helali

## Topology

| Service | Host port | Container |
|---------|-----------|-----------|
| Backend API | `3030` → `4000` | `helali-backend` |
| Frontend UI | `3031` → `3000` | `helali-frontend` |
| Postgres | `5433` → `5432` | `helali-postgres` |
| Redis | `6380` → `6379` | `helali-redis` |
| MinIO API | `9010` → `9000` | `helali-minio` |
| MinIO console | `9011` → `9001` | `helali-minio` |

Remote dirs:

| Tier | Path |
|------|------|
| Infra | `/opt/helali-infra` |
| Backend | `/opt/helali-app` |
| Frontend | `/opt/helali-frontend` |

Network: external `helali-network` (created by infra compose).

> **Port note:** Host `3030` may already be used by another app on a shared VPS (e.g. pooya-exam). Confirm with `ss -tlnp | grep 3030` before first boot.

## GitHub secrets

| Secret | Required | Purpose |
|--------|----------|---------|
| `SSH_PRIVATE_KEY` | yes | Deploy key |
| `SSH_HOST` | yes | VPS host/IP |
| `SSH_USER` | yes | SSH user (usually `root`) |
| `GHCR_PULL_TOKEN` | yes | PAT with `read:packages` for VPS pull |
| `PUBLIC_SITE_URL` | optional | Defaults to `https://helali.rmhosseini.ir` |

## CI/CD

- `ci.yml` — lint / test / build (Postgres + Redis services)
- `infra.yml` — path-filtered infra compose sync
- `backend.yml` — path-filtered build → Trivy → GHCR → SSH rollout
- `frontend.yml` — same for frontend

Deploy jobs use `cancel-in-progress: false`. Migrations run inside the backend image `CMD` (`prisma migrate deploy`).

## First boot

```bash
# 1) Infra
mkdir -p /opt/helali-infra
# scp docker-compose.infra.yml → /opt/helali-infra/
cd /opt/helali-infra
docker compose -f docker-compose.infra.yml up -d
docker network ls | grep helali-network

# 2) Backend
mkdir -p /opt/helali-app
cp deploy/backend.env.example /opt/helali-app/.env   # edit secrets
# set BACKEND_HOST_PORT=3030 and BACKEND_IMAGE after first Actions push
cd /opt/helali-app
docker compose -f docker-compose.backend.yml pull
docker compose -f docker-compose.backend.yml up -d --force-recreate --wait

# 3) Frontend
mkdir -p /opt/helali-frontend
cp deploy/frontend.env.example /opt/helali-frontend/.env
# set FRONTEND_HOST_PORT=3031 and FRONTEND_IMAGE after first Actions push
cd /opt/helali-frontend
docker compose -f docker-compose.frontend.yml pull
docker compose -f docker-compose.frontend.yml up -d --force-recreate --wait

docker ps --filter name=helali
curl -fsS http://127.0.0.1:3030/api/v1/health
curl -fsS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3031
```

Or let GitHub Actions deploy after secrets + seed `.env` files exist.

## Rollback

`.env` keeps previous pins as `BACKEND_IMAGE_PREV` / `FRONTEND_IMAGE_PREV`.

```bash
cd /opt/helali-app
PREV=$(grep '^BACKEND_IMAGE_PREV=' .env | cut -d= -f2-)
sed -i "s|^BACKEND_IMAGE=.*|BACKEND_IMAGE=${PREV}|" .env
docker compose -f docker-compose.backend.yml pull
docker compose -f docker-compose.backend.yml up -d --force-recreate --wait

cd /opt/helali-frontend
PREV=$(grep '^FRONTEND_IMAGE_PREV=' .env | cut -d= -f2-)
sed -i "s|^FRONTEND_IMAGE=.*|FRONTEND_IMAGE=${PREV}|" .env
docker compose -f docker-compose.frontend.yml pull
docker compose -f docker-compose.frontend.yml up -d --force-recreate --wait
```

## Troubleshooting

| Symptom | Check |
|---------|--------|
| Port unreachable | `docker ps`, `docker port helali-backend`, firewall / nginx |
| Wrong host port | `.env` `BACKEND_HOST_PORT` / `FRONTEND_HOST_PORT` (not app `BACKEND_PORT=4000`) |
| 429 pulling node base | Dockerfiles use `node:22-alpine` + Buildx `mirror.gcr.io` |
| Stack empty after deploy | Never `docker rm` before recreate succeeds |
| Image mismatch | Compare `.env` `*_IMAGE` with `docker inspect helali-backend` |
| Infra ports busy | Infra refuses non-helali owners of 5433/6380/9010/9011 |

## Local Makefile

```bash
make infra
make backend
make frontend
make ps
make logs
```
