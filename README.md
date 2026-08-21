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

## Docker (production روی سرور)

```bash
HELALI_SSH_PASSWORD=... npm run deploy:infra
HELALI_SSH_PASSWORD=... npm run deploy:backend
```

### پورت‌های production روی سرور (5.159.49.36)

| سرویس | پورت | توضیح |
|--------|------|-------|
| Frontend | **3010** | سایت عمومی |
| Backend API | **4000** | `/api/v1` |
| PostgreSQL | **5433** | جدا از postgres موجود روی 5432 |
| Redis | **6380** | |
| MinIO API | **9010** | user: minio99 / pass: minio123 |
| MinIO Console | **9011** | |

برای اتصال از لوکال: `cp .env.server.example .env` سپس `npm run db:migrate:dev && npm run db:seed`

## CI/CD (GitHub Actions)

دو workflow در `.github/workflows/`:

| Workflow | چه زمانی | کار |
|----------|----------|-----|
| **CI** | هر PR و push به `main` | lint → test (با Postgres/Redis) → build |
| **Deploy** | push به `main` (backend/shared) یا اجرای دستی | دیپلوی با `deploy:infra` / `deploy:backend` |

### Secrets لازم (یک‌بار در GitHub)

Repo → **Settings → Secrets and variables → Actions → New repository secret**:

| Name | لازم؟ | توضیح |
|------|-------|--------|
| `HELALI_SSH_PASSWORD` | بله | پسورد SSH سرور |
| `HELALI_SERVER` | خیر | پیش‌فرض `5.159.49.36` |
| `HELALI_SSH_USER` | خیر | پیش‌فرض `root` |
| `JWT_SECRET` | توصیه‌شده | برای دیپلوی backend در CI |
| `JWT_REFRESH_SECRET` | توصیه‌شده | برای دیپلوی backend در CI |

### دیپلوی دستی از GitHub

Actions → **Deploy** → **Run workflow** → انتخاب هدف: `backend` / `infra` / `all`

### فلو روزمره

```text
branch → PR → CI سبز → merge به main → Deploy خودکار backend
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
