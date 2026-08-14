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

## Docker

```bash
# فقط infra (روی سرور — پورت‌های جدا از سرویس‌های دیگر)
docker compose -f docker-compose.infra.yml up -d

# deploy خودکار روی سرور
HELALI_SSH_PASSWORD=... node scripts/deploy-infra.mjs

# کل stack (backend + frontend داخل docker)
docker compose --profile full up -d
```

### پورت‌های infra روی سرور (5.159.49.36)

| سرویس | پورت | توضیح |
|--------|------|-------|
| PostgreSQL | **5433** | جدا از postgres موجود روی 5432 |
| Redis | **6380** | |
| MinIO API | **9010** | user: minio99 / pass: minio123 |
| MinIO Console | **9011** | |

برای اتصال از لوکال: `cp .env.server.example .env` سپس `npm run db:migrate:dev && npm run db:seed`

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
