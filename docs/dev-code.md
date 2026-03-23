# Dev-Only Code

All code listed here exists solely for local development and must be removed or kept inert before production deployment.

---

## 1. Dev Login — Bypass Google OAuth

### `src/app/api/dev/login/route.ts`
Creates a real next-auth database session for the dev user and sets the session cookie. Returns 404 in non-development environments.

**How to use:** Visit `/api/dev/login` directly, or click the "Login as Dev User" button on the login page.

---

### `src/app/(auth)/login/page.tsx` — Dev block
The following block renders only when `NODE_ENV === "development"`:

```tsx
{process.env.NODE_ENV === "development" && (
  <div className="mt-4 rounded-[16px] border border-dashed border-amber-300 bg-amber-50 px-5 py-4">
    <p className="mb-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-amber-600">
      Dev Only
    </p>
    <a
      href="/api/dev/login"
      className="block w-full rounded-xl border border-amber-300 bg-white py-3 text-center text-[14px] font-semibold text-amber-700 transition-colors hover:bg-amber-50"
    >
      Login as Dev User
    </a>
    <p className="mt-2 text-center text-[11px] text-amber-500">
      dev@kollabglobal.com • campaign: dev-campaign-1
    </p>
  </div>
)}
```

---

### `src/proxy.ts` — Middleware exclusion
`api/dev` is excluded from the auth middleware matcher so the login route is reachable without a session:

```ts
matcher: ["/((?!login|api/auth|api/webhooks|api/dev|_next/static|_next/image|favicon.ico).*)"],
```

Remove `api/dev` from this exclusion in production (or keep it — the route itself returns 404 when `NODE_ENV !== "development"`).

---

## 2. Dev Test Data — Seed

### `prisma/seed.ts` — Dev campaign block
Wrapped in `if (process.env.NODE_ENV !== 'production')`. Creates:

| Resource | ID | Details |
|---|---|---|
| User | `dev-user-1` | `dev@kollabglobal.com` |
| Campaign 1 | `dev-campaign-1` | Vietnam · Popular package · DRAFT |
| Campaign 2 | `dev-campaign-2` | Thailand · Popular package · DRAFT |
| Product | (linked to campaigns) | มะม่วงอบแห้ง Premium / TH Brand |

**Test URL after login:** `/campaigns/dev-campaign-1/brief/new` or `/campaigns/dev-campaign-2/brief/new`

Run seed:
```bash
pnpm exec tsx prisma/seed.ts
```

---

## 3. Creator Avatars — `unoptimized` on `next/Image`

### `src/app/(dashboard)/campaigns/new/creators/page.tsx`, `package/page.tsx`, `checkout/page.tsx`

All `<Image>` components rendering creator avatars use `unoptimized` as a temporary workaround because the current `avatar` values in the seed are social profile page URLs (e.g. `https://www.tiktok.com/@handle`), not direct image URLs. Next.js Image would reject them otherwise.

**What to do before production:**
1. Replace all `avatar` values in the seed with real image URLs (S3 after credentials arrive, or direct CDN links to profile photos).
2. Remove `unoptimized` from all three `<Image>` components — Next.js will then optimize via the `*.s3.*.amazonaws.com` pattern already in `next.config.ts`.

## 4. Dev State Simulation — Creator Acceptance

### `src/components/campaign/accepting-card.tsx`

The `AcceptingCard` component includes a mock simulation button ("▶ จำลองครีเอเตอร์ตอบรับหมด") that artificially advances the `accepted` state of creators. This is solely for demonstrating the UI transition and pipeline updates locally without having real webhooks or creator side interactions.

**What to do before production:**
- Remove the `"▶ จำลองครีเอเตอร์ตอบรับหมด"` button and its `simulate` state logic from `accepting-card.tsx`, as this state should only be advanced via real API updates from the backend when a creator accepts an invitation.

---

## Checklist before production

- [ ] Remove or gate `src/app/api/dev/` directory
- [ ] Remove the Dev Only block from the login page
- [ ] Confirm `api/dev` is not accessible (returns 404 — already handled by the route guard)
- [ ] Ensure dev seed data (`dev-user-1`, `dev-campaign-1`, `dev-campaign-2`) is not present in the production database
- [ ] Replace creator `avatar` seed values with real image URLs and remove `unoptimized` from `<Image>` components in creators, package, and checkout pages
- [ ] Remove Dev State Simulation block ("▶ จำลองครีเอเตอร์ตอบรับหมด") and simulate logic from `src/components/campaign/accepting-card.tsx`
