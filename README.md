# Helali Monorepo

پایگاه حفظ و نشر آثار عبدالرضا هلالی — معماری monorepo مشابه jaryan.

## ساختار

```
helali/
├── apps/
│   ├── backend/     # NestJS + Prisma + PostgreSQL
│   └── frontend/    # Next.js 15 App Router
├── packages/
│   └── shared/      # Types, constants, CASL abilities
├── docker-compose.yml
└── package.json
```

## پیش‌نیاز

- Node.js 20+
- PostgreSQL
- Redis (اختیاری — rate limit و cache)
- MinIO

## راه‌اندازی

```bash
cp .env.example .env
npm install --legacy-peer-deps
npm run env:sync
npm run db:migrate:dev
npm run db:seed
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api/v1
- Health: http://localhost:4000/api/v1/health

## کاربر پیش‌فرض seed

- **username:** `admin`
- **password:** `admin123`

## اسکریپت‌ها

| دستور | توضیح |
|-------|-------|
| `npm run dev` | اجرای همزمان backend و frontend |
| `npm run dev:backend` | فقط backend |
| `npm run dev:frontend` | فقط frontend |
| `npm run db:migrate` | اجرای migration در production |
| `npm run db:migrate:dev` | ایجاد/اجرای migration در dev |
| `npm run db:seed` | seed دیتابیس |

## Docker / production

```text
git push → GitHub Actions → Docker build → GHCR → SSH → docker compose pull/up → health check
```

سرور سورس را بیلد نمی‌کند؛ فقط ایمیج آماده را از GHCR می‌کشد.

### پورت‌های production (مثال: 5.159.49.36)

| سرویس | پورت | توضیح |
|--------|------|-------|
| Frontend | **3010** | سایت عمومی |
| Backend API | **4000** | `/api/v1` |
| PostgreSQL | **5433** | جدا از postgres موجود روی 5432 |
| Redis | **6380** | |
| MinIO API | **9010** | |
| MinIO Console | **9011** | |

### راه‌اندازی یک‌بار روی سرور

1. Infra: بعد از اولین اجرای workflow **Infra**، یا دستی:
   ```bash
   mkdir -p /opt/helali-infra /opt/helali-app /opt/helali-frontend
   # copy docker-compose.infra.yml then:
   cd /opt/helali-infra && docker compose -f docker-compose.infra.yml up -d
   ```
2. فایل env بک‌اند/فرانت (یک‌بار):
   ```bash
   # از ریپو: deploy/backend.env.example و deploy/frontend.env.example
   cp backend.env.example /opt/helali-app/.env
   cp frontend.env.example /opt/helali-frontend/.env
   # JWT و بقیه را ویرایش کن؛ BACKEND_IMAGE / FRONTEND_IMAGE را Actions پر می‌کند
   ```
3. کلید SSH عمومی دیپلوی را در `~/.ssh/authorized_keys` کاربر دیپلوی بگذار.

برای اتصال لوکال به دیتابیس سرور: `cp .env.server.example .env` سپس migrate/seed.

## CI/CD (GitHub Actions)

| Workflow | فایل | کار |
|----------|------|-----|
| **CI** | `ci.yml` | lint / test / build روی PR و `main` |
| **Backend** | `backend.yml` | بیلد ایمیج → push به GHCR → SSH → `compose pull/up` → health |
| **Frontend** | `frontend.yml` | همان برای فرانت (:3010) |
| **Infra** | `infra.yml` | آپلود `docker-compose.infra.yml` → `up -d` |

ایمیج‌ها:

```text
ghcr.io/<owner>/helali-backend:<git-sha>
ghcr.io/<owner>/helali-frontend:<git-sha>
```

### Secrets (Settings → Secrets and variables → Actions)

| Name | لازم؟ | توضیح |
|------|-------|--------|
| `SSH_HOST` | بله | مثلاً `5.159.49.36` |
| `SSH_USER` | بله | کاربر SSH دیپلوی |
| `SSH_PRIVATE_KEY` | بله | کلید خصوصی (ترجیحاً ed25519) |
| `GHCR_PULL_TOKEN` | بله | GitHub PAT با `read:packages` برای `docker pull` روی سرور |

Packages را در GitHub برای ریپو بساز/اجازه بده (Actions با `packages: write` پوش می‌کند).

### Rollback

```bash
# روی سرور — تگ SHA قبلی را بگذار و دوباره up کن
cd /opt/helali-app
# BACKEND_IMAGE=ghcr.io/<owner>/helali-backend:<previous-sha>
docker compose -f docker-compose.backend.yml pull
docker compose -f docker-compose.backend.yml up -d
```

همین الگو برای `/opt/helali-frontend` و `FRONTEND_IMAGE`.

### فلو روزمره

```text
PR → CI سبز → merge به main → Backend/Frontend workflow (بر اساس path) → GHCR → سرور
```

## معماری

### Backend
- `features/` — ماژول‌های دامنه (auth, audio, video, gallery, ...)
- `shared/` — guards, interceptors, prisma, redis, storage
- Controller → Service → Repository → Prisma
- JWT access token + httpOnly refresh cookie
- CASL authorization

### Frontend
- `features/` — services + hooks per domain
- `services/api-client.ts` — axios با refresh خودکار
- Redux فقط برای UI state (player, theme)
- TanStack Query برای server state
