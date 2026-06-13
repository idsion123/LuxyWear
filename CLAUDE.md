# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md
Refer to PRD.md for the full product requirements, database schema, and implementation plan.

## Dev Environment

**Prerequisites**: Node.js v24+, PostgreSQL 15+, pnpm 10.x

**Environment variables** (create `.env` from template):

| Variable | Description |
|---|---|
| `DATABASE_URL` | Supabase: `postgresql://user:pass@db.ref.supabase.co:6543/postgres?pgbouncer=true` |
| `JWT_SECRET` | 32+ chars for customer JWT |
| `ADMIN_JWT_SECRET` | 32+ chars for admin JWT |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token (file uploads) |
| `OPENAI_API_KEY` | AI chat feature (optional) |

## Deployment

**Platform**: Vercel (app) + Supabase (database)

1. Create Supabase project, run migrations (`pnpm db:migrate`)
2. Push to GitHub, import in Vercel
3. Set environment variables in Vercel dashboard
4. Deploy (build command: `pnpm build`)

> **Note**: File uploads use Vercel Blob — set `BLOB_READ_WRITE_TOKEN` in Vercel env. `sharp` is required for image optimization (already installed).

## Commands

```bash
# Dev server
pnpm dev

# Build & Start
pnpm build
pnpm start

# Database
pnpm db:generate   # Generate Drizzle migrations
pnpm db:migrate    # Run migrations
pnpm db:seed       # Seed: node --env-file .env node_modules/tsx/dist/cli.mjs db/seed.ts

# Other
pnpm lint
```

## Code Standards

- **TypeScript**: Strict mode enabled. No `any` unless absolutely necessary. Prefer `interface` over `type` for object shapes.
- **Async**: All DB queries, cookie/header access, `params`/`searchParams` must be `await`-ed (Next.js 16 rule).
- **Server Components**: Default to server components. Only add `"use client"` when using hooks, browser APIs, or event handlers.
- **State**: React Context for global state (auth, cart). Server components fetch data directly via Drizzle.
- **DB access**: Always import `db` from `@/lib/db`. Use parameterized queries via Drizzle (no raw SQL injection risk).
- **API routes**: Standard Next.js route handlers (`app/api/*/route.ts`). Validate input with zod where applicable.
- **Imports**: Use `@/` path alias (maps to project root).
- **CSS**: Tailwind CSS v4 with design tokens from the color system below. No CSS modules or styled-components.
- **Image upload**: Always pass `dir` param matching the category slug (e.g., `dresses`, `tops`) to organize files.
- **Component naming**: PascalCase for components, camelCase for utilities/hooks. Pages follow Next.js App Router conventions.

## Architecture

### Project Structure

```
my-app/
├── app/
│   ├── (shop)/         # Consumer frontend (layout, pages, products, cart, checkout, orders)
│   ├── admin/          # Admin backend (dashboard, products, categories, orders, users)
│   ├── auth/           # Login/register pages
│   └── api/            # REST API routes (products, categories, cart, orders, auth, upload, chat, addresses)
├── components/         # Shared React components (Header, Footer, ChatBot, ProductGrid, providers)
├── db/
│   ├── schema.ts       # Drizzle ORM schema (8 tables: users, addresses, categories, products, productCategories, cartItems, orders, orderItems, favorites)
│   ├── seed.ts         # Seed data: 6 categories + 175 products + users
│   └── migrations/     # Drizzle-generated SQL migrations
├── lib/
│   ├── db.ts           # Drizzle MySQL2 connection pool
│   ├── auth.ts         # JWT sign/verify (jose), bcrypt hash/compare
│   └── auth-config.ts  # Cookie names, secrets, expiry per auth type
├── store/
│   ├── auth-context.tsx # AuthProvider + useAuth hook
│   └── cart-context.tsx # CartProvider + useCart hook
├── proxy.ts            # Next.js 16 proxy (replaces middleware.ts) — route-level auth guard
└── public/images/      # Static images (banner, category images, product uploads)
```

### Key Patterns

- **Auth**: Dual-domain JWT in HTTP-only cookies. `session` (7d) for customers, `admin_session` (2h) for admins. Guarded in `proxy.ts` via route matcher.
- **API routes**: Standard Next.js App Router route handlers. All DB access via Drizzle ORM with MySQL2 pool.
- **Pagination/Filtering**: `GET /api/products` supports `page`, `limit`, `search`, `category`, `sort`, `admin=true` (to see unpublished).
- **Image upload**: `POST /api/upload` accepts multipart `file` + optional `dir` (category slug). Saves to `public/images/products/{dir}/`.
- **State**: React Context for auth + cart. Server components for product/category data fetching.

### Color System (Tailwind)

```
#c9a96e (香槟金)  — primary, buttons, links, price
#faf8f5 (暖白)     — page background
#f5f0eb (奶油)     — card/section background
#2d2a24 (暖黑)     — body text
#7a746e (暖灰)     — secondary text
#e8e3de            — borders
```

### Database Categories (seed)

- **女装** (womenswear) — root, slug: `womenswear`
  - 连衣裙 (dresses), 上衣 (tops), 外套 (outerwear), 下装 (bottoms)
- **配饰** (accessories) — root

### Gotchas

- **pnpm 10.x on Windows**: `pnpm dev` fails with `EFTYPE`. Use `node node_modules/next/dist/bin/next dev` instead.
- **Next.js 16**: `params`/`searchParams` must be awaited. `proxy.ts` replaces `middleware.ts`. Turbopack is the default bundler.
- **tsx top-level await**: tsx with esbuild CJS doesn't support top-level await. Wrap in `async function main()`.

### Useful Accounts (seed)
- Admin: admin@fashion.com / admin123456
- Customer: customer@test.com / customer123
