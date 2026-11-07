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
| Repo variable `DEPLOY_RUNS_ON` | `["self-hosted","helali"]` — same idea as `zarva` / `safshekan` |
| Secret `TLS_HOST` (optional) | `helali.rmhosseini.ir` |
| Secret `GHCR_PULL_TOKEN` | recommended for private GHCR pull |
| Secret `SSH_PRIVATE_KEY` | optional fallback for SSH deploy from GitHub-hosted |

Self-hosted runner on the same VPS as zarva/saf-shekan: labels **`self-hosted`**, **`helali`** (each repo has its own runner registration — copy what you did for `zarva-vps`).

اگر GitHub نتواند به VPS SSH بزند: runner روی VPS + `DEPLOY_RUNS_ON=["self-hosted","helali"]` (مثل زروا و صف‌شکن). ثبت runner: همان مراحل **Settings → Runners → New** در ریپو helali و `config.sh` روی VPS در `/opt/actions-runner-helali` (کپی الگوی زروا).

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
