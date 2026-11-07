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
| Repo variable `DEPLOY_RUNS_ON` | `["self-hosted","helali"]` |
| Secret `TLS_HOST` (optional) | `helali.rmhosseini.ir` |
| Secret `GHCR_PULL_TOKEN` | recommended for private GHCR pull |
| Secret `SSH_PRIVATE_KEY` | optional fallback for SSH deploy from GitHub-hosted |

Self-hosted runner label: `helali` (alongside `zarva` / `safshekan` on the same VPS).

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

## Verify

```bash
curl -fsS https://helali.rmhosseini.ir/api/v1/health
curl -kfsS https://127.0.0.1:3032/api/v1/health
```

## Rollback

Pin previous `BACKEND_IMAGE` / `FRONTEND_IMAGE` in `.env`, then re-run `ci-deploy-on-host.sh` or push to `main`.
