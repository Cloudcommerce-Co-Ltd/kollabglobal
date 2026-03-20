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
| Campaign | `dev-campaign-1` | Vietnam · Popular package · DRAFT |
| Product | (linked to campaign) | มะม่วงอบแห้ง Premium · Food & Snack |

**Test URL after login:** `/campaigns/dev-campaign-1/brief/new`

Run seed:
```bash
pnpm exec tsx prisma/seed.ts
```

---

## Checklist before production

- [ ] Remove or gate `src/app/api/dev/` directory
- [ ] Remove the Dev Only block from the login page
- [ ] Confirm `api/dev` is not accessible (returns 404 — already handled by the route guard)
- [ ] Ensure dev seed data (`dev-user-1`, `dev-campaign-1`) is not present in the production database
