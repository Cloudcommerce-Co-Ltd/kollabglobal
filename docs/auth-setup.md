# KOLLAB Global — Setup Guide

## Prerequisites

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- Docker (for PostgreSQL)

## 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable the **Google Identity** API
4. Navigate to **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
5. Set application type to **Web application**
6. Add **Authorized JavaScript origins**: `http://localhost:3000`
7. Add **Authorized redirect URIs**: `http://localhost:3000/api/auth/callback/google`
8. Copy the **Client ID** and **Client Secret**

## 2. Environment Variables

Create `.env.local` in the project root:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/kollabglobal
AUTH_SECRET=          # generate with: npx auth secret
AUTH_GOOGLE_ID=       # from Google Cloud Console
AUTH_GOOGLE_SECRET=   # from Google Cloud Console
```

Generate `AUTH_SECRET`:
```bash
npx auth secret
```

## 3. Database Setup

Start PostgreSQL with Docker:
```bash
docker compose up -d
```

Push the Prisma schema to create tables:
```bash
pnpm exec prisma generate
pnpm exec prisma db push
```

## 4. Run Dev Server

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000).

## 5. Auth Flow

1. Visiting `/` (or any protected route) redirects to `/login`
2. Click "เข้าสู่ระบบด้วย Google"
3. Complete Google OAuth
4. Redirected to `/` showing your name, email, and avatar
5. Click "ออกจากระบบ" to sign out → returns to `/login`

## Protected Routes

All routes are protected except:
- `/login`
- `/api/auth/*`
- Static assets (`_next/static`, `_next/image`, `favicon.ico`)
