# Instruction

## Rules to follow:
1. Migration naming convention should be followed as per the documentation. It should be in the format of `YYYYMMDDHHMMSS_migration_name.php`. This helps in keeping track of the order of migrations and makes it easier to manage them.
2. Always check your source, implementation, and everything in plan with the latest documentation and codebase of the project. You have to check on context7 and internet for up-to-date stable information.
3. You can not add, update or remove directly with migration files. Purpose of migration file is to keep track of changes in the database schema.
4. Each migration must have a singular purpose — one entity, one concern. Never bundle multiple models or unrelated changes into one migration. Name it after the specific entity or change (e.g. `create_campaign`, `add_creator_status_index`). Run `pnpm exec prisma migrate dev --name <name>` separately for each.
5. Everything needs tests, start from unit tests to integration tests, and make sure to cover all edge cases. This ensures that your code is robust and can handle unexpected scenarios.
6. Implement E2E test to entire flow of the feature, this will help to identify any issues that may arise when different components interact with each other. E2E tests are crucial for ensuring that the entire system works as expected.
7. Use `pnpm` everywhere — NOT npm or npx. Use `pnpm exec` to run binaries (e.g. `pnpm exec prisma migrate dev`).
8. UI must match the visual design in `../mvp-template-admin/kollab-admin.tsx` — layout, spacing, colors, typography, and copy. Port it carefully into Next.js + Tailwind + shadcn components. Do NOT copy static/hardcoded values 1:1; wire all data to real DB fields. Only show UI elements that have real functionality backing them. Never use inline styles — all styles must be Tailwind classes or shadcn component variants.
   - **Color tokens:** Admin colors are defined as CSS variables in `src/app/globals.css` (`@theme inline` block). Always use the Tailwind token classes — `text-brand` (#00B8A0), `text-teal`, `bg-teal-bg`, `border-teal-border`, `text-dark`, `text-muted-text`, `text-ghost`, `bg-surface`, `bg-raised`, `border-border-ui`, `bg-hover`, `text-danger`, `bg-danger-bg`, `text-warning-text`, `bg-warning-bg`, `text-good`, `bg-good-bg`, `text-blue`, `bg-blue-bg`. Never hardcode hex values like `#00B8A0` anywhere in `.tsx`/`.ts` files. For opacity variants use Tailwind's `/` modifier (e.g. `bg-brand/25`). For lucide-react icons, use `className="text-[token]"` instead of the `color` prop.
   - **Component colocation:** Page-specific components live in `_components/` next to their page. Shared components live in `src/components/ui/` or `src/components/[domain]/`.
9. UI must be mobile-responsive and Thai-first with English labels. This means that the UI should be designed to work well on mobile devices, and the primary language should be Thai, with English used for labels and any secondary text. Make sure to test the UI on different screen sizes to ensure it is responsive and looks good on all devices.
10. **Use `Result<T, E>` and `Maybe<T>` types** from `src/lib/types/result.ts` for all operations that can fail or return optional values. Prefer pure functions that return `Result` over throwing exceptions. Use `ok()`, `err()`, `fromNullable()` for Result construction. Use `isSome()`, `isNone()`, `mapMaybe()`, `getOrElse()`, `getOrThrow()` for Maybe operations. Never use `try/catch` for expected error paths — model them as `Result` instead.
11. **Use shadcn/ui components** wherever available before writing custom UI. Installed components live in `src/components/ui/`. Available: sidebar, button, badge, input, label, select, table, card, dialog, separator, sheet, dropdown-menu, skeleton, tooltip. To add a new shadcn component: `pnpm dlx shadcn@latest add <name>`. Never re-implement UI that shadcn already provides.

## Definition Of Done
- Code is clean, well-structured, and follows best practices.
- All tests are passing, and new tests have been added for any new functionality.

## What We're Building
KOLLAB Global Admin — Backend administration system for managing campaigns, creators, brands, and packages. Admin-only access with Google OAuth authentication and email allowlist.

## Reference Source
- **UI/UX reference:** `../mvp-template-admin/kollab-admin.tsx` — the admin interface template. This is the source of truth for admin flow, copy, colors, and screen layouts.
- When implementing any page, port the design from mvp-template-admin into Next.js App Router + Tailwind + shadcn components.

## Scope — Admin CRUD Operations
1. **Campaigns** — Create, read, update, delete campaigns. View campaign status, briefs, and shipments.
2. **Creators** — Manage creator profiles, packages, rates, and availability.
3. **Brands** — Manage brand profiles and contact information.
4. **Packages** — Manage campaign packages, pricing, deliverables, and tier structure.

## Authentication
- **Google OAuth via next-auth** — Admin users authenticate using their Google accounts.
- **Adapter:** `@auth/prisma-adapter` — integrates with Prisma models for session and account storage.
- **AdminUser table** — Acts as an email allowlist. Only users with an email in the AdminUser table can authenticate and access the admin dashboard.
- **No brand OAuth login** — Brands do not use OAuth. They are managed by admins only.

## Key Technical Decisions
- **Prisma 7:** DB URL lives in `prisma.config.ts` (not schema.prisma). Seed command also in `prisma.config.ts` under `migrations.seed`. Client uses `@prisma/adapter-pg`. All models use `@@map("snake_case_table")`.
- **Next.js 16:** Middleware is `src/proxy.ts` (not middleware.ts). Dynamic route params are `Promise<{}>`.
- **Next-Auth:** Session and account data persisted via `@auth/prisma-adapter`. Proxy auth validates admin session before allowing access to admin routes.
