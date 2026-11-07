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

## Secrets

| Name | Required | Notes |
|------|----------|--------|
| `SSH_PRIVATE_KEY` | SSH deploy only | Same key as zarva (`id_ed25519_zarva_ci`) if you use GitHub-hosted + SSH |
| `SSH_HOST` | SSH deploy | Default `109.70.78.80` in workflow |
| `SSH_USER` | SSH deploy | e.g. `root` |
| `GHCR_PULL_TOKEN` | optional | PAT `read:packages`; CI falls back to `GITHUB_TOKEN` on the self-hosted runner |
| `SSH_PORT` | no | Default **22** |
| `TLS_HOST` | no | `helali.rmhosseini.ir` |

### Repo variable (self-hosted — same as zarva)

| Name | Value |
|------|--------|
| `DEPLOY_RUNS_ON` | `["self-hosted","helali"]` |

When set, **Deploy** runs on the VPS runner (SSH steps skipped). Builds still use `ubuntu-latest`.

## Self-hosted runner (mirrors zarva `zarva-vps`)

1. Repo variable: `DEPLOY_RUNS_ON` = `["self-hosted","helali"]` (zarva uses `["self-hosted","zarva"]`).  
2. Actions → **(setup) Emit helali runner registration token** → copy token from job summary.  
3. On VPS (second install dir; zarva uses `/opt/actions-runner`, helali uses `/opt/actions-runner-helali`):

```bash
REGISTRATION_TOKEN='<token>' bash /opt/helali/scripts/register-self-hosted-runner-helali.sh
```

4. Confirm: Settings → Actions → Runners shows **helali-vps** (labels `self-hosted`, `helali`).  
5. Re-run **helali CI/CD Pipeline** on `main` — deploy log should show **LOCAL** and skip SSH (like zarva).

Until the runner is online, deploy stays **Waiting for a runner**. There is no automatic SSH fallback when `DEPLOY_RUNS_ON` is set.

Local helper: `powershell -File scripts/print-vps-bootstrap.ps1`

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
