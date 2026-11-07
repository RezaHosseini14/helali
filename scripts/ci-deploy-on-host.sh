#!/usr/bin/env bash
# Runs ON the VPS in $REMOTE_DIR (default /opt/helali).
# Required env: BACKEND_IMAGE, FRONTEND_IMAGE
# Optional: GHCR_USER, GHCR_TOKEN, TLS_HOST, REMOTE_DIR
set -euo pipefail

REMOTE_DIR="${REMOTE_DIR:-/opt/helali}"
TLS_HOST="${TLS_HOST:-helali.rmhosseini.ir}"
cd "$REMOTE_DIR"
unset COMPOSE_FILE COMPOSE_PATH || true
export COMPOSE_PROJECT_NAME=helali

echo "--> Deploy host: $(hostname) pwd=$(pwd)"
echo "--> Compose ports (must include 3030/3031/3032):"
grep -nE 'ports:|3030|3031|3032|BACKEND_PORT|FRONTEND_PORT|NGINX_PORT' docker-compose.yml || true

if [ -z "${GHCR_TOKEN:-}" ]; then
  echo "::error::GHCR_TOKEN is empty — cannot pull private images from ghcr.io."
  echo "::error::Add repo secret GHCR_PULL_TOKEN (classic PAT with read:packages) or ensure the deploy job passes GITHUB_TOKEN."
  exit 1
fi
GHCR_LOGIN_USER="$(echo "${GHCR_USER:-}" | tr '[:upper:]' '[:lower:]')"
if ! echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_LOGIN_USER" --password-stdin; then
  echo "::error::docker login ghcr.io failed (check GHCR_PULL_TOKEN or package access for ${GHCR_LOGIN_USER})."
  exit 1
fi

touch .env
if grep -q '^BACKEND_IMAGE=' .env; then
  sed -i "s|^BACKEND_IMAGE=.*|BACKEND_IMAGE=${BACKEND_IMAGE}|" .env
else
  echo "BACKEND_IMAGE=${BACKEND_IMAGE}" >> .env
fi

if grep -q '^FRONTEND_IMAGE=' .env; then
  sed -i "s|^FRONTEND_IMAGE=.*|FRONTEND_IMAGE=${FRONTEND_IMAGE}|" .env
else
  echo "FRONTEND_IMAGE=${FRONTEND_IMAGE}" >> .env
fi

for kv in BACKEND_PORT=3030 FRONTEND_PORT=3031 NGINX_PORT=3032 MINIO_PUBLIC_PORT=9010; do
  key=${kv%%=*}; val=${kv#*=}
  if grep -q "^${key}=" .env; then
    sed -i "s|^${key}=.*|${key}=${val}|" .env
  else
    echo "${key}=${val}" >> .env
  fi
done

for kv in \
  "BACKEND_PUBLIC_URL=https://${TLS_HOST}" \
  "CORS_ORIGIN=https://${TLS_HOST}" \
  "NEXT_PUBLIC_API_URL=https://${TLS_HOST}/api/v1" \
  "NEXT_PUBLIC_SITE_URL=https://${TLS_HOST}" \
  "MINIO_PUBLIC_ENDPOINT=109.70.78.80"; do
  key=${kv%%=*}; val=${kv#*=}
  if grep -q "^${key}=" .env; then
    sed -i "s|^${key}=.*|${key}=${val}|" .env
  else
    echo "${key}=${val}" >> .env
  fi
done

if [ -z "${BACKEND_IMAGE:-}" ] || [ -z "${FRONTEND_IMAGE:-}" ]; then
  echo "::error::Build jobs did not pass backend/frontend image refs"
  exit 1
fi
echo "--> Target images: backend=${BACKEND_IMAGE} frontend=${FRONTEND_IMAGE}"
grep -E '^(BACKEND_IMAGE|FRONTEND_IMAGE)=' .env

ensure_nonempty_secret() {
  local key="$1"
  if ! grep -qE "^${key}=.+" .env; then
    sed -i "/^${key}=/d" .env || true
    echo "${key}=$(openssl rand -hex 24)" >> .env
    echo "--> Wrote non-empty ${key} to .env"
  fi
}
ensure_nonempty_secret POSTGRES_PASSWORD
ensure_nonempty_secret REDIS_PASSWORD
if ! grep -q '^JWT_SECRET=.\+' .env; then
  sed -i '/^JWT_SECRET=/d' .env || true
  echo "JWT_SECRET=$(openssl rand -base64 48)" >> .env
fi
if ! grep -q '^JWT_REFRESH_SECRET=.\+' .env; then
  sed -i '/^JWT_REFRESH_SECRET=/d' .env || true
  echo "JWT_REFRESH_SECRET=$(openssl rand -base64 48)" >> .env
fi
if ! grep -q '^MINIO_ACCESS_KEY=' .env; then
  echo "MINIO_ACCESS_KEY=minio99" >> .env
fi
if ! grep -q '^MINIO_SECRET_KEY=.\+' .env; then
  sed -i '/^MINIO_SECRET_KEY=/d' .env || true
  echo "MINIO_SECRET_KEY=$(openssl rand -hex 24)" >> .env
fi

sed -i '/^API_IMAGE=/d;/^WEB_IMAGE=/d' .env || true
docker rm -f helali-api helali-web 2>/dev/null || true

remove_foreign() {
  local name="$1"
  if ! docker inspect "$name" >/dev/null 2>&1; then
    return 0
  fi
  local project
  project=$(docker inspect -f '{{index .Config.Labels "com.docker.compose.project"}}' "$name" 2>/dev/null || true)
  if [ "$project" = "helali" ]; then
    return 0
  fi
  echo "--> remove foreign ${name} (project='${project:-none}')"
  docker rm -f "$name" >/dev/null
}
for c in helali-postgres helali-redis helali-minio; do
  remove_foreign "$c"
done

mkdir -p docker/certs
if [ ! -s docker/certs/server.crt ] || [ ! -s docker/certs/server.key ]; then
  echo "--> Creating self-signed TLS certificate for docker nginx gateway..."
  SAN="DNS:${TLS_HOST}"
  case "${TLS_HOST}" in
    *[!0-9.]* ) ;;
    *) SAN="IP:${TLS_HOST}" ;;
  esac
  openssl req -x509 -nodes -days 825 -newkey rsa:2048 \
    -keyout docker/certs/server.key \
    -out docker/certs/server.crt \
    -subj "/CN=${TLS_HOST}" \
    -addext "subjectAltName=${SAN}"
fi

echo "--> Pulling latest container images..."
pulled=0
for attempt in 1 2 3 4 5; do
  if docker compose -f docker-compose.yml pull backend frontend; then
    pulled=1
    break
  fi
  echo "compose pull failed (attempt ${attempt}), retrying..."
  sleep $((attempt * 4))
done
if [ "$pulled" != 1 ]; then
  echo "::error::docker compose pull failed after 5 attempts"
  df -h / || true
  exit 1
fi

echo "--> Starting Postgres and Redis..."
if ! docker compose -f docker-compose.yml up -d postgres redis --wait --wait-timeout 90; then
  echo "::error::Postgres or Redis failed to become healthy"
  docker compose -f docker-compose.yml ps || true
  docker logs helali-postgres --tail 50 || true
  docker logs helali-redis --tail 50 || true
  exit 1
fi

echo "--> Starting MinIO (no --wait; scratch image has no health binary)..."
if ! docker compose -f docker-compose.yml up -d minio; then
  echo "::error::MinIO failed to start"
  docker logs helali-minio --tail 40 || true
  exit 1
fi

echo "--> Executing database migrations..."
if ! docker compose -f docker-compose.yml run --rm --no-deps backend \
  npx prisma migrate deploy --schema=apps/backend/prisma/schema.prisma; then
  echo "::error::Database migrations failed! Halting deployment to protect uptime."
  exit 1
fi

echo "--> Seeding roles/permissions/admin (idempotent)..."
if ! docker compose -f docker-compose.yml run --rm --no-deps backend \
  node apps/backend/prisma/seed-prod.cjs; then
  echo "::error::Database seed failed! Halting deployment."
  exit 1
fi

up_one() {
  local service="$1"
  local timeout="$2"
  echo "--> Starting ${service}..."
  remove_foreign "helali-${service}"
  if docker compose -f docker-compose.yml up -d --force-recreate --wait --wait-timeout "$timeout" "$service"; then
    return 0
  fi
  echo "--> ${service} failed; removing stale container_name and retrying once..."
  docker rm -f "helali-${service}" 2>/dev/null || true
  docker compose -f docker-compose.yml up -d --force-recreate --wait --wait-timeout "$timeout" "$service"
}

echo "--> Recreating app tier one service at a time..."
if ! up_one backend 180; then
  echo "::error::backend failed to become healthy"
  docker logs helali-backend --tail 120 || true
  exit 1
fi
if ! up_one frontend 180; then
  echo "::error::frontend failed to become healthy"
  docker logs helali-frontend --tail 120 || true
  exit 1
fi
if ! up_one nginx 120; then
  echo "::error::nginx failed to become healthy"
  docker logs helali-nginx --tail 120 || true
  exit 1
fi

echo "--> Asserting app containers exist and are running..."
for c in helali-backend helali-frontend helali-nginx; do
  if ! docker ps --format '{{.Names}}' | grep -qx "$c"; then
    echo "::error::Expected running container missing: $c"
    docker ps -a --filter name=helali || true
    exit 1
  fi
done

echo "--> Verifying running containers use the freshly built images..."
EXPECTED_BACKEND_ID=$(docker image inspect --format '{{.Id}}' "$BACKEND_IMAGE" 2>/dev/null || echo '')
EXPECTED_FRONTEND_ID=$(docker image inspect --format '{{.Id}}' "$FRONTEND_IMAGE" 2>/dev/null || echo '')
RUNNING_BACKEND_ID=$(docker inspect --format '{{.Image}}' helali-backend 2>/dev/null || echo '')
RUNNING_FRONTEND_ID=$(docker inspect --format '{{.Image}}' helali-frontend 2>/dev/null || echo '')
if [ -z "$RUNNING_BACKEND_ID" ] || [ "$RUNNING_BACKEND_ID" != "$EXPECTED_BACKEND_ID" ] \
  || [ -z "$RUNNING_FRONTEND_ID" ] || [ "$RUNNING_FRONTEND_ID" != "$EXPECTED_FRONTEND_ID" ]; then
  echo "::error::Running containers are not on the built images"
  docker ps --filter name=helali || true
  exit 1
fi

echo "--> Verifying published host ports (3030/3031/3032)..."
docker ps --filter name=helali --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}'
BACKEND_PORTS=$(docker port helali-backend 3000/tcp 2>/dev/null || true)
FRONTEND_PORTS=$(docker port helali-frontend 3000/tcp 2>/dev/null || true)
NGINX_PORTS=$(docker port helali-nginx 443/tcp 2>/dev/null || true)
echo "$BACKEND_PORTS" | grep -qE '(:|::)3030$' || {
  echo "::error::backend is not published on host port 3030 (got: ${BACKEND_PORTS})"
  exit 1
}
echo "$FRONTEND_PORTS" | grep -qE '(:|::)3031$' || {
  echo "::error::frontend is not published on host port 3031 (got: ${FRONTEND_PORTS})"
  exit 1
}
echo "$NGINX_PORTS" | grep -qE '(:|::)3032$' || {
  echo "::error::nginx is not published on host port 3032 (got: ${NGINX_PORTS})"
  exit 1
}

echo "--> Local health probe via docker nginx..."
if ! docker exec helali-nginx wget -qO- http://127.0.0.1/api/v1/health; then
  echo "::error::nginx local /api/v1/health failed after recreate"
  exit 1
fi
echo ""

reloaded=0
for attempt in $(seq 1 20); do
  if docker exec helali-nginx nginx -s reload; then
    reloaded=1
    break
  fi
  sleep 2
done
if [ "$reloaded" != 1 ]; then
  echo "::error::nginx did not accept reload"
  exit 1
fi

echo "--> Cleaning up unused dangling images..."
docker image prune -f || true
echo "--> Host deploy finished OK"
