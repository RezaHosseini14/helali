# Deploy — helali

SafShekan/ZARVA-style stack on **109.70.78.80**: host nginx + Let's Encrypt for `helali.rmhosseini.ir`, docker gateway on **3032**, app ports **3030/3031**.

| Service | Host | Container |
|---------|------|-----------|
| host nginx | `443` → `helali.rmhosseini.ir` | (system) |
| docker nginx | `3032` (TLS gateway) | `helali-nginx` |
| backend | `3030` → `3000` | `helali-backend` |
| frontend | `3031` → `3000` | `helali-frontend` |
| minio | `9010` / `9011` | `helali-minio` |
| postgres / redis | internal | `helali-postgres` / `helali-redis` |

Remote dir: `/opt/helali`

## Cloudflare

- DNS: `A` `helali` → `109.70.78.80` (proxied)
- SSL mode: **Full (strict)** after certbot on the VPS

## GitHub Actions

| Setting | Value |
|---------|--------|
| Repo variable `DEPLOY_RUNS_ON` | Optional `["self-hosted","helali"]` when a helali runner is online; if unset, deploy uses **`ubuntu-latest` + SSH** (same as a typical green zarva run). If set but no runner is online, CI **falls back** to SSH instead of waiting forever. |
| Secret `SSH_PRIVATE_KEY` | Same VPS key as zarva — required for SSH deploy |
| Secret `TLS_HOST` (optional) | `helali.rmhosseini.ir` |
| Secret `GHCR_PULL_TOKEN` | recommended for private GHCR pull |
| Secret `SSH_PRIVATE_KEY` | optional fallback for SSH deploy from GitHub-hosted |

## Self-hosted runner (same as zarva — required when `DEPLOY_RUNS_ON` is set)

1. GitHub **RezaHosseini14/helali** → **Settings → Actions → Runners → New self-hosted runner** (Linux x64).  
2. On VPS `109.70.78.80`: use a **second** install dir (zarva already uses `/opt/actions-runner`): e.g. `/opt/actions-runner-helali`, run the printed `./config.sh --url https://github.com/RezaHosseini14/helali --token …` with labels **`self-hosted`**, **`helali`**.  
3. `./svc.sh install` + `./svc.sh start` (user `github-runner` or same as zarva).  
4. Repo **Settings → Variables → Actions**: `DEPLOY_RUNS_ON` = `["self-hosted","helali"]` (mirror zarva’s `["self-hosted","zarva"]`).  
5. Ensure `/opt/helali` exists and the runner user can run Docker; re-run CI.

Until step 2–3 are done, deploy jobs show **Waiting for a runner** — zarva does not, because `zarva-vps` is already online.

## First-time host nginx + cert

```bash
# on VPS (root or setup-domain workflow)
cd /opt/helali   # after CI syncs repo scripts
git clone … or copy scripts/setup-host-domain-helali.sh + scripts/host-nginx/
DOMAIN=helali.rmhosseini.ir bash scripts/setup-host-domain-helali.sh
```

Or: Actions → **Setup helali.rmhosseini.ir (host nginx + certbot)** → Run workflow.

## Manual deploy (on VPS)

```bash
cd /opt/helali
export BACKEND_IMAGE=ghcr.io/rezahosseini14/helali-backend:TAG
export FRONTEND_IMAGE=ghcr.io/rezahosseini14/helali-frontend:TAG
export TLS_HOST=helali.rmhosseini.ir
bash ci-deploy-on-host.sh
```

## Default admin (after seed)

Deploy runs `apps/backend/prisma/seed-prod.cjs` after migrations. First boot creates:

- **username:** `admin`
- **password:** `admin123`

Change the password after first login. Re-deploy does **not** reset an existing admin password.

## Verify

```bash
curl -fsS https://helali.rmhosseini.ir/api/v1/health
curl -kfsS https://127.0.0.1:3032/api/v1/health
curl -sk -X POST https://127.0.0.1:3032/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin123"}'
```

## Rollback

Pin previous `BACKEND_IMAGE` / `FRONTEND_IMAGE` in `.env`, then re-run `ci-deploy-on-host.sh` or push to `main`.
