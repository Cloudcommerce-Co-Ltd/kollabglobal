# Instrucution

## Rules to follow:
1. Migration naming convention should be followed as per the documentation. It should be in the format of `YYYYMMDDHHMMSS_migration_name.php`. This helps in keeping track of the order of migrations and makes it easier to manage them.
2. Always check your source, implementaion, and everything in plan with the latest documentation and codebase of the project. you have to check on context7 and internet for up-to-date stable information.
3. You can not add, update or remove directly with migration files. purpose of migration file is to keep track of changes in the database schema.
4. Each migration must have a singular purpose — one entity, one concern. Never bundle multiple models or unrelated changes into one migration. Name it after the specific entity or change (e.g. `create_country`, `add_campaign_status_index`). Run `pnpm exec prisma migrate dev --name <name>` separately for each.
5. Everything need tests, start from unit tests to integration tests, and make sure to cover all edge cases. This ensures that your code is robust and can handle unexpected scenarios.
6. Implement E2E test to entire flow of the feature, this will help to identify any issues that may arise when different components interact with each other. E2E tests are crucial for ensuring that the entire system works as expected.
7. Use `pnpm` everywhere — NOT npm or npx. Use `pnpm exec` to run binaries (e.g. `pnpm exec prisma migrate dev`).

## Definition Of Done
- Code is clean, well-structured, and follows best practices.
- All tests are passing, and new tests have been added for any new functionality.

## What We're Building
KOLLAB Global — Influencer marketing campaign platform MVP. Brands pick a target country, add product/service info, choose a creator package, select creators, pay via Omise, then manage briefs and shipments. Thai-first UI with English labels.

## Reference Source
- **UI/UX reference:** `../mvp-template/` — the static React+Vite prototype. This is the source of truth for flow, copy, colors, creator data, country data, package data, and all screen layouts.
- **Full single-file template:** `../KOLLAB Global MVP (home+service updated).txt` — contains every page/component in one file including login, dashboard, country selection, product form, package selection, creator selection, checkout, campaign detail, brief creation, and reporting.
- When implementing any page, port the design from mvp-template into Next.js App Router + Tailwind + shadcn components.

## Scope — Campaign Creation Flow (5 steps)
1. **Select Country** → `/campaigns/new/country`
2. **Add Product/Service** → `/campaigns/new/product`
3. **Select Package** → `/campaigns/new/package`
4. **Select Creators** → `/campaigns/new/creators`
5. **Checkout (Omise payment)** → `/campaigns/new/checkout`

Post-creation: Campaign detail page, brief management (AI-assisted via Gemini), shipment tracking.

## External Services — Creds Pending
All three external services have credentials pending from company. Scaffold env-guarded mocks only until creds arrive:
- **Omise** — payment gateway (checkout step)
- **AI service** — AI brief generation + translation
- **AWS S3** — file/image uploads

## Key Technical Decisions
- **Prisma 7:** DB URL lives in `prisma.config.ts` (not schema.prisma). Seed command also in `prisma.config.ts` under `migrations.seed`. Client uses `@prisma/adapter-pg`. All models use `@@map("snake_case_table")`.
- **Next.js 16:** Middleware is `src/proxy.ts` (not middleware.ts). Dynamic route params are `Promise<{}>`.
- **Zustand** for multi-step campaign creation state (no persistence — resets on refresh).
- **Proxy auth** excludes `/api/webhooks` so Omise webhooks can hit without session.

## Design Tokens
```
Primary: #4ECDC4    Secondary: #4A90D9    Accent: #9B7ED8
Dark: #4A4A4A       Muted: #8A90A3       BG: #F5F7FA
Border: #E8ECF0
```
