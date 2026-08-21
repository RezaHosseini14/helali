# Helali

پایگاه حفظ و نشر آثار عبدالرضا هلالی — monorepo (public site + admin).

**Stack:** Next.js 16.3, NestJS, Prisma, PostgreSQL, Redis, TanStack Query, Redux, shadcn/ui, MinIO.

**Brand:** Primary `#0f6e61` · Structure `#164842` (landing hero) · Accent `#178a7a` · Paper `#f7faf9`. No pink/brown. Never Jaryan `#006b3f`.

**Rules:** `.cursor/rules/core.mdc` (always). Other rules in `.cursor/rules/` on demand (`frontend`, `data-table`, `nextjs`, `media`, `nestjs`, `prisma`, `security`, `api-performance`, …).

**Cursor skills:** `.cursor/skills/` — `create-feature`, `create-query`, `create-service`, `create-module`, `refactor-feature`, `review-code`, `nestjs-expert`.

**Agent skills:** `.agents/skills/` — start frontend with `helali-frontend`; also `tanstack-query`, Vercel React skills, `frontend-design`, `security-*`, `testing-expert`, caveman utilities. SEO: global `next-seo` (hybrid Next Metadata + `optimise-seo`).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

**Note:** UI kit is **shadcn/ui** (Base UI + Tailwind). Cache Components / Partial Prefetching skills apply on this Next 16.3+ stack when explicitly enabling those features.

**Behavior:** Minimal tokens. Targeted file reads. Smallest diff. Reuse existing patterns. No unrelated refactors.
