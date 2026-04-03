# kollabglobal-admin — Design Spec

**Date:** 2026-04-02  
**Status:** Approved  
**Timeline:** 5 Weeks

---

## Overview

A standalone Next.js admin app for managing the KOLLAB Global influencer platform. Admins can manage Campaigns, Creators, Brands, and Packages. Shares the same PostgreSQL database as `kollabglobal` (the brand-facing app). UI is ported from `../mvp-template-admin/kollab-admin.tsx`.

---

## Architecture

### App location
`/Users/lynchz/Desktop/fastship/kollabglobal-admin/`

Standalone Next.js 16 app. Not a monorepo — two independent apps pointing at the same Postgres DB.

### Tech stack (mirrors kollabglobal exactly)
- **Framework:** Next.js 16 (App Router), `src/proxy.ts` middleware
- **Language:** TypeScript 5
- **Database:** PostgreSQL via Prisma 7 + `@prisma/adapter-pg`
- **Styling:** Tailwind CSS v4 + shadcn components
- **Forms:** react-hook-form + zod v4
- **Auth:** Custom session cookie (bcrypt password, `AdminUser` DB table)
- **Tests:** Vitest (unit + integration), same pattern as kollabglobal
- **Package manager:** pnpm only
- **UI reference:** `../mvp-template-admin/kollab-admin.tsx`

### Data fetching pattern (same as kollabglobal)
- **Reads:** Server Components call Prisma directly (no API layer)
- **Mutations:** Client forms POST/PATCH/DELETE to `/api/` routes; routes validate with zod, call Prisma, return JSON

---

## Schema Changes (new migrations on shared DB)

### 1. `AdminUser` model
```prisma
model AdminUser {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String   @map("password_hash")
  role         String   @default("ADMIN") // "ADMIN" | "SUPER_ADMIN"
  isActive     Boolean  @default(true) @map("is_active")
  createdAt    DateTime @default(now()) @map("created_at")

  @@map("admin_users")
}
```
Seeded from `.env` (`ADMIN_EMAIL`, `ADMIN_PASSWORD`) on first `pnpm exec prisma db seed`.

### 2. `Brand` model
```prisma
model Brand {
  id        String     @id @default(cuid())
  name      String
  email     String?
  type      String?    // "Food & Beverage" | "Health & Wellness" | "SME" etc.
  logoUrl   String?    @map("logo_url")
  website   String?
  isActive  Boolean    @default(true) @map("is_active")
  createdAt DateTime   @default(now()) @map("created_at")
  updatedAt DateTime   @updatedAt @map("updated_at")
  campaigns Campaign[]

  @@map("brands")
}
```

### 3. Add `brandId` to `Campaign`
```prisma
model Campaign {
  // ... existing fields ...
  brandId   String?  @map("brand_id")
  brand     Brand?   @relation(fields: [brandId], references: [id])
}
```
Nullable — backwards compatible with existing `kollabglobal` campaigns that use `CampaignProduct.brand_name`.

**Migration order:**
1. `create_admin_users` — standalone, no dependencies
2. `create_brands` — standalone
3. `add_brand_id_to_campaigns` — depends on brands

---

## Auth Flow

- Only one public route: `/login`
- `src/proxy.ts` checks for `admin_session` cookie on all other routes; redirects to `/login` if missing/invalid
- `/api/auth/login` — verifies email + bcrypt password → sets `HttpOnly` signed session cookie (JWT or encrypted payload with `adminUserId`, `role`, `exp`)
- `/api/auth/logout` — clears cookie
- Session duration: 8 hours
- No OAuth, no next-auth — plain cookie auth

---

## Layout

Ported from `mvp-template-admin` sidebar layout:
- Collapsible sidebar (200px expanded / 52px collapsed)
- Nav items: Campaigns, Creators, Brands, Packages
- Footer: role badge + collapse toggle
- Top bar: page title + primary action button ("+ New X")
- Color tokens from `../kollabglobal/src/app/globals.css` — same CSS variables

---

## Feature Specs

### Campaigns

**List page** (`/campaigns`)
- Table columns: Name, Brand, Country, Package, Status (badge), Creators count, Created at
- Filter by status (dropdown)
- Search by name
- Row click → detail page
- "+ New Campaign" button

**Create/Edit form** (`/campaigns/new`, `/campaigns/[id]/edit`)
- Fields: Brand (select from Brand table), Country (select), Package (select), Promotion Type (PRODUCT/SERVICE), Duration (default 30 days)
- Status can be changed on edit (dropdown of `CampaignStatus` enum values)
- On create: also creates a `CampaignProduct` record (brand name, product name, category, description)
- Validation via zod

**Detail page** (`/campaigns/[id]`)
- Campaign metadata (brand, country, package, status, dates)
- Product/service info from `CampaignProduct`
- Brief content if exists (`CampaignBrief`)
- Creators table: name, status (`CreatorStatus`), content status (`ContentStatus`)
- Payment info (method, status, amount) if exists
- Status history (`CampaignStatusLog`)
- Edit button → edit page

---

### Creators

**List page** (`/creators`)
- Table columns: Avatar initial, Name, Niche, Platform, Reach, Engagement, Country flag
- Search by name or niche
- "+ New Creator" button

**Create/Edit form** (`/creators/new`, `/creators/[id]/edit`)
- Fields: name, niche, engagement (string e.g. "9.3%"), reach (string e.g. "340K"), avatar (URL or initial), countryId, platform, socialHandle, portfolioUrl

**Detail page** (`/creators/[id]`)
- Profile card (name, niche, platform, reach, engagement, country)
- Related campaigns panel: list of campaigns this creator is assigned to (via `CampaignCreator`), showing campaign name, status, their own `CreatorStatus` and `ContentStatus`

---

### Brands

**List page** (`/brands`)
- Table columns: Avatar initial, Name, Email, Type, Campaign count, Active status
- Search by name
- "+ New Brand" button

**Create/Edit form** (`/brands/new`, `/brands/[id]/edit`)
- Fields: name, email, type (text or select), logoUrl, website, isActive toggle

**Detail page** (`/brands/[id]`)
- Profile card
- Related campaigns (all `Campaign` records with this `brandId`)

---

### Packages

**List page** (`/packages`)
- Table columns: Name, Tagline, Price (฿), Num Creators, Platforms, Campaign count
- "+ New Package" button

**Create/Edit form** (`/packages/new`, `/packages/[id]/edit`)
- Fields: name, tagline, badge, numCreators, price, platforms (multi-select), deliverables (tag input), cpmLabel, cpmSavings, estReach, estEngagement

**Detail page** (`/packages/[id]`)
- Package card (name, price, platforms, deliverables)
- **Related creators** panel: list of creators in `PackageCreator`, with isBackup flag and sortOrder. Add creator (select from all creators) + remove buttons.
- **Related campaigns** panel: read-only list of campaigns using this package

---

## API Routes

All routes require valid admin session (middleware check). All accept/return `application/json`. Errors return `{ error: string }` with appropriate status code.

| Method | Route | Action |
|--------|-------|--------|
| POST | `/api/auth/login` | Authenticate admin |
| POST | `/api/auth/logout` | Clear session |
| POST | `/api/campaigns` | Create campaign + product |
| PATCH | `/api/campaigns/[id]` | Update campaign fields |
| DELETE | `/api/campaigns/[id]` | Delete campaign |
| POST | `/api/creators` | Create creator |
| PATCH | `/api/creators/[id]` | Update creator |
| DELETE | `/api/creators/[id]` | Delete creator |
| POST | `/api/brands` | Create brand |
| PATCH | `/api/brands/[id]` | Update brand |
| DELETE | `/api/brands/[id]` | Delete brand |
| POST | `/api/packages` | Create package |
| PATCH | `/api/packages/[id]` | Update package |
| DELETE | `/api/packages/[id]` | Delete package |
| POST | `/api/packages/[id]/creators` | Add creator to package |
| DELETE | `/api/packages/[id]/creators/[creatorId]` | Remove creator from package |

---

## Testing Strategy (mirrors kollabglobal)

- **Unit tests:** zod schemas, utility functions
- **Integration tests:** all API routes (vitest, real DB via test Postgres, same pattern as `kollabglobal/src/app/api/__tests__`)
- **E2E:** login flow, create campaign, create package + assign creator
- Run with `pnpm test`

---

## Environment Variables

```env
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...    # for migrations
SESSION_SECRET=...             # for signing session cookie
ADMIN_EMAIL=admin@kollab.co
ADMIN_PASSWORD=...             # plain text in .env, bcrypt-hashed on seed
```

---

## CLAUDE.md

Copy from `../kollabglobal/CLAUDE.md` and update:
- UI reference → `../mvp-template-admin/kollab-admin.tsx`
- Scope → admin CRUD for Campaigns, Creators, Brands, Packages
- Remove Omise/AI/S3 references (not in scope for admin)
- Add note: admin auth uses `AdminUser` table + cookie session (not next-auth)

---

## 5.5-Day Implementation Plan

### Day 0 (half day) — Scaffold + Auth + Schema

**Goal:** Running app with login, sidebar shell, and all DB migrations applied.

Tasks:
1. `pnpm create next-app@latest kollabglobal-admin --typescript --tailwind --app --src-dir --import-alias "@/*"` (Next.js 16)
2. Copy from kollabglobal: `prisma/schema.prisma`, `prisma/migrations/`, `prisma.config.ts`, `.npmrc`, `components.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `postcss.config.mjs`, `vitest.config.ts`, `docker-compose.yml`
3. Copy `CLAUDE.md` from kollabglobal → update for admin scope
4. Install all dependencies (same as kollabglobal minus `omise`, `bullmq`, `ioredis`, `@ai-sdk/*`, `@openrouter/*`, `react-country-flag`; add `bcryptjs` + `@types/bcryptjs`, `jose` for JWT)
5. Add `AdminUser` migration: `pnpm exec prisma migrate dev --name create_admin_users`
6. Add `Brand` migration: `pnpm exec prisma migrate dev --name create_brands`
7. Add `brandId` FK migration: `pnpm exec prisma migrate dev --name add_brand_id_to_campaigns`
8. Update `prisma/seed.ts` — create AdminUser from env vars (bcrypt hash password)
9. Copy `src/app/globals.css` color tokens from kollabglobal
10. Build sidebar layout shell (`src/app/(admin)/layout.tsx`) — port from mvp-template-admin
11. Implement `src/proxy.ts` — check `admin_session` cookie, redirect to `/login`
12. Build `/login` page (email + password form)
13. Build `/api/auth/login` route (bcrypt verify → set session cookie)
14. Build `/api/auth/logout` route
15. Smoke test: login → see sidebar → logout → redirected

---

### Day 1 — Packages + Creators

**Goal:** Full CRUD for both Packages (with creator assignment) and Creators (with campaign history).

#### Packages (morning)
1. Package list page (`/packages`) — RSC, fetch all packages with `_count.campaigns`
2. Package list table component (name, tagline, price, numCreators, platforms, campaign count)
3. Package create form page (`/packages/new`) — react-hook-form + zod schema
4. Package edit form page (`/packages/[id]/edit`) — prefilled with existing data
5. Package detail page (`/packages/[id]`) — package card + related creators + related campaigns panels
6. PackageCreator panel — list assigned creators (with isBackup, sortOrder), add creator modal (select from all creators), remove button
7. `/api/packages` POST — create package (zod validation)
8. `/api/packages/[id]` PATCH — update package
9. `/api/packages/[id]` DELETE — delete package (check no active campaigns)
10. `/api/packages/[id]/creators` POST — add creator to package
11. `/api/packages/[id]/creators/[creatorId]` DELETE — remove creator from package
12. Integration tests for all package API routes

#### Creators (afternoon)
13. Creator list page (`/creators`) — RSC, fetch all creators with country
14. Creator list table component (avatar initial, name, niche, platform, reach, engagement, country flag)
15. Search/filter by name and niche (client-side filter or server-side with searchParams)
16. Creator create form (`/creators/new`)
17. Creator edit form (`/creators/[id]/edit`)
18. Creator detail page (`/creators/[id]`) — profile card + related campaigns panel
19. Related campaigns panel — fetch via `CampaignCreator` join: campaign name, status, creatorStatus, contentStatus
20. `/api/creators` POST
21. `/api/creators/[id]` PATCH
22. `/api/creators/[id]` DELETE (check no active campaign assignments)
23. Integration tests for all creator API routes

---

### Day 2 — Brands + Campaigns (list + detail)

**Goal:** Full CRUD for Brands, and Campaigns list + detail pages done.

#### Brands (morning)
1. Brand list page (`/brands`) — RSC, fetch all brands with `_count.campaigns`
2. Brand list table component (avatar initial, name, email, type, campaign count, isActive badge)
3. Brand create form (`/brands/new`)
4. Brand edit form (`/brands/[id]/edit`) — includes isActive toggle
5. Brand detail page (`/brands/[id]`) — profile card + related campaigns list
6. Related campaigns panel — all campaigns with this brandId
7. `/api/brands` POST
8. `/api/brands/[id]` PATCH
9. `/api/brands/[id]` DELETE (soft delete: set isActive=false if has campaigns)
10. Integration tests for all brand API routes

#### Campaigns — list + detail (afternoon)
11. Campaign list page (`/campaigns`) — RSC, fetch all with brand, country, package, `_count.creators`
12. Campaign list table (name, brand, country, package, status badge, creator count, created date)
13. Status filter dropdown (DRAFT / PENDING / ACTIVE / etc.)
14. Campaign detail page (`/campaigns/[id]`):
    - Metadata card (brand, country, package, status, dates)
    - Product info (`CampaignProduct`)
    - Brief content (`CampaignBrief`) — display only
    - Creators table (`CampaignCreator`) — name, status chip, content status chip
    - Payment info (`Payment`) if exists
    - Status history (`CampaignStatusLog`) timeline

---

### Day 3 — Campaigns (create + edit) + API Routes

**Goal:** Campaign create/edit forms working end-to-end with full API coverage.

Tasks:
1. Campaign create form (`/campaigns/new`):
   - Select brand (dropdown from Brand table)
   - Select country (dropdown from Country table)
   - Select package (dropdown from Package table)
   - Promotion type (PRODUCT / SERVICE)
   - Duration (default 30)
   - Product section: brand name, product name, category, description, selling points, URL
2. Campaign edit form (`/campaigns/[id]/edit`) — update status, brandId, duration
3. `/api/campaigns` POST — create campaign + CampaignProduct in a single Prisma transaction
4. `/api/campaigns/[id]` PATCH — update campaign, append to `CampaignStatusLog` if status changed
5. `/api/campaigns/[id]` DELETE
6. Integration tests for all campaign API routes
7. Wire up all form `onSubmit` handlers to their respective API routes (packages, creators, brands, campaigns — verify all forms submit correctly end-to-end)
8. Fix any broken form → API wiring discovered during testing

---

### Day 4 — Polish + Tests

**Goal:** All tests passing, UI pixel-perfect against mvp-template-admin, all states handled.

Tasks:
1. Review every page against `mvp-template-admin/kollab-admin.tsx` — fix spacing, colors, typography, copy (Thai labels)
2. Add Suspense + loading skeletons on all RSC pages
3. Add empty states for all list pages ("ยังไม่มี Campaign" etc.)
4. Add 404 handling for detail pages with unknown IDs (`notFound()`)
5. Wire up sonner toasts on all form submissions (success + error messages)
6. Mobile responsiveness pass — sidebar collapse on small screens, tables get horizontal scroll
7. Run full test suite: `pnpm test` — fix any failures
8. Cross-check all zod schemas match Prisma model fields exactly
9. Fix any ESLint errors: `pnpm lint`

---

### Day 5 — E2E + Deploy Prep

**Goal:** App is deployable, key flows tested end-to-end.

Tasks:
1. E2E test: login → create brand → logout
2. E2E test: create package → assign creator to package → view detail
3. E2E test: create campaign (select brand, country, package) → view detail → change status
4. Copy `Dockerfile` from kollabglobal → update `WORKDIR` and app name
5. Update `docker-compose.yml` — add `kollabglobal-admin` service on a different port, reuse same DB network
6. Write `.env.example` with all required vars
7. Verify `pnpm build` succeeds with zero errors
8. Update `CLAUDE.md` with any gotchas discovered during build

---

## Definition of Done

- All 4 sections (Campaigns, Creators, Brands, Packages) have working list + create + edit + detail pages
- All API routes have integration tests
- Login/logout works; unauthenticated access redirects to /login
- UI matches mvp-template-admin reference (colors, spacing, typography)
- Thai-first labels where applicable (copy from mvp-template-admin)
- Mobile responsive
- `pnpm build` passes with no errors
- `pnpm test` passes with no failures
