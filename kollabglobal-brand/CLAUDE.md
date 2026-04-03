# Instrucution

## Rules to follow:
1. Migration naming convention should be followed as per the documentation. It should be in the format of `YYYYMMDDHHMMSS_migration_name.php`. This helps in keeping track of the order of migrations and makes it easier to manage them.
2. Always check your source, implementaion, and everything in plan with the latest documentation and codebase of the project. you have to check on context7 and internet for up-to-date stable information.
3. You can not add, update or remove directly with migration files. purpose of migration file is to keep track of changes in the database schema.
4. Each migration must have a singular purpose — one entity, one concern. Never bundle multiple models or unrelated changes into one migration. Name it after the specific entity or change (e.g. `create_country`, `add_campaign_status_index`). Run `pnpm exec prisma migrate dev --name <name>` separately for each.
5. Everything need tests, start from unit tests to integration tests, and make sure to cover all edge cases. This ensures that your code is robust and can handle unexpected scenarios.
6. Implement E2E test to entire flow of the feature, this will help to identify any issues that may arise when different components interact with each other. E2E tests are crucial for ensuring that the entire system works as expected.
7. Use `pnpm` everywhere — NOT npm or npx. Use `pnpm exec` to run binaries (e.g. `pnpm exec prisma migrate dev`).
8. UI must match the visual design in `../mvp-template/` — layout, spacing, colors, typography, and copy. Port it carefully into Next.js + Tailwind + shadcn components. Do NOT copy static/hardcoded values 1:1; wire all data to real DB fields. Only show UI elements that have real functionality backing them. Never use inline styles — all styles must be Tailwind classes or shadcn component variants.
   - **Color tokens:** Brand colors are defined as CSS variables in `src/app/globals.css` (`@theme inline` block). Always use the Tailwind token classes — `text-brand`, `bg-brand`, `border-brand`, `text-muted-text`, `bg-surface`, `border-border-ui`, `text-dark`, `bg-secondary-brand`, `bg-accent-brand`, `text-warning-text`, `bg-warning-bg`, etc. Never hardcode hex values like `#50DCCD` anywhere in `.tsx`/`.ts` files. For opacity variants use Tailwind's `/` modifier (e.g. `bg-brand/25`). For lucide-react icons, use `className="text-[token]"` instead of the `color` prop.
   - **Component colocation:** Page-specific components live in `_components/` next to their page. Shared components live in `src/components/ui/` or `src/components/[domain]/`.
9. UI have to be mobile-responsive and Thai-first with English labels. This means that the UI should be designed to work well on mobile devices, and the primary language should be Thai, with English used for labels and any secondary text (Copy exactly from `../mvp-template/`). Make sure to test the UI on different screen sizes to ensure it is responsive and looks good on all devices.

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
