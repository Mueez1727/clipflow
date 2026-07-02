# opal-webprodigies (Next.js Frontend)

> Workspace folder: `opal-webprodigies/`

## Purpose

Primary web application for the Opal video platform. Users authenticate via Clerk, manage workspaces/folders/videos in a dashboard, share previews, and receive recordings uploaded from the desktop app.

## Major Features

- **Authentication** — Clerk sign-in/sign-up with DB user sync on `/auth/callback`
- **Dashboard** — Workspace library, folders, video management, notifications, settings, billing view
- **Video preview** — Public `/preview/[videoId]` pages with CloudFront stream URLs
- **Recording API** — REST endpoints consumed by the Express socket server during desktop recording
- **Studio settings API** — Persists screen/mic/preset preferences for the desktop recorder
- **Invites** — Email-based workspace invitations via Nodemailer
- **Wix CMS** — Dashboard home content (requires Wix OAuth key)
- **Stripe / Voiceflow** — Code present but intentionally disabled

## Architecture

```
Browser / Desktop (HTTP)
        │
        ▼
┌───────────────────────────────────────┐
│  Next.js 14 App Router (port 3000)    │
│  ├── middleware.ts (Clerk + CORS)     │
│  ├── src/app/ (pages + API routes)    │
│  ├── src/actions/ (server actions)    │
│  └── src/components/ (UI)             │
└───────────────┬───────────────────────┘
                │
                ▼
        PostgreSQL via Prisma
```

**State management:** Redux Toolkit (workspace/folder slices), TanStack React Query for server state.

**Styling:** Tailwind CSS + shadcn/ui components.

## Folder Structure

| Path | Purpose |
|------|---------|
| `src/app/` | App Router pages, layouts, API route handlers |
| `src/app/api/` | REST API for auth sync, studio, recording pipeline |
| `src/app/dashboard/` | Authenticated workspace UI |
| `src/app/auth/` | Clerk auth pages and callback |
| `src/actions/` | Server actions (`user.ts`, `workspace.ts`) |
| `src/components/global/` | Feature components (sidebar, videos, folders) |
| `src/components/ui/` | shadcn primitives |
| `src/hooks/` | Custom React hooks |
| `src/lib/` | Prisma client, utilities, Voiceflow stub |
| `src/redux/` | Redux store and slices |
| `prisma/` | PostgreSQL schema |

## Important Files

| File | Role |
|------|------|
| `src/middleware.ts` | Clerk auth guard for `/dashboard`, CORS for desktop (`localhost:5173`) |
| `src/actions/user.ts` | User auth sync, invites, comments, subscriptions |
| `src/actions/workspace.ts` | Workspaces, folders, videos, Wix integration |
| `src/lib/prisma.ts` | Prisma singleton client |
| `prisma/schema.prisma` | Database models (User, Video, WorkSpace, etc.) |
| `src/app/api/auth/[id]/route.ts` | Sync Clerk user → PostgreSQL (desktop calls this) |
| `src/app/api/recording/[id]/*` | Recording lifecycle: processing → transcribe → complete |
| `src/app/api/studio/[id]/route.ts` | Update recording studio preferences |
| `src/constants/index.tsx` | Sidebar navigation links |

## Environment Variables

See `.env.example` for the full list. Required for local dev:

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk frontend key |
| `CLERK_SECRET_KEY` | Yes | Clerk backend key |
| `NEXT_PUBLIC_HOST_URL` | Yes | App base URL for links/invites |
| `NEXT_PUBLIC_CLOUD_FRONT_STREAM_URL` | For playback | CDN prefix for video streams |

Optional: `MAILER_EMAIL`, `MAILER_PASSWORD`, `WIX_OAUTH_KEY`, `CLOUD_WAYS_POST`, Stripe/Voiceflow keys (features disabled).

## Startup Commands

```bash
cd opal-webprodigies
npm install
npx prisma generate          # after schema changes
npx prisma db push           # sync schema to local DB (no migrations checked in)
npm run dev                  # http://localhost:3000
npm run build                # production build
npm run start                # serve production build
```

## Communication With Other Projects

### Desktop App (`OPAL-WEBPRODIGIES-DESKTOP-APP`)

- Desktop calls `GET /api/auth/{clerkId}` to sync/fetch user profile
- Desktop calls `POST /api/studio/{userId}` to save screen/mic/preset
- Middleware allows CORS from `http://localhost:5173`
- Vite dev proxy in desktop forwards `/api` → `localhost:3000/api`

### Express Server (`OPAL-WEBPRODIGIES-EXPRESS`)

During recording upload, Express calls:

- `POST /api/recording/{userId}/processing` — create video row
- `POST /api/recording/{userId}/transcribe` — save AI title/summary (PRO)
- `POST /api/recording/{userId}/complete` — mark `processing: false`

Configure `NEXT_API_HOST=http://localhost:3000/api/` in the Express `.env`.

## Known Limitations

- **No Prisma migrations** — use `prisma db push` against a running PostgreSQL instance
- **Stripe payments disabled** — `/api/payment` returns 503; upgrade button non-functional
- **Voiceflow AI widget disabled** — commented out in code
- **Wix / Cloudways** — dashboard home content fails gracefully without API keys
- **Email invites** — require Gmail SMTP credentials
- **Video playback** — requires AWS S3 + CloudFront URLs configured in Express and `NEXT_PUBLIC_CLOUD_FRONT_STREAM_URL`

## API Routes Summary

| Route | Method | Status |
|-------|--------|--------|
| `/api/auth/[id]` | GET | Active |
| `/api/studio/[id]` | POST | Active |
| `/api/recording/[id]/processing` | POST | Active |
| `/api/recording/[id]/transcribe` | POST | Active |
| `/api/recording/[id]/complete` | POST | Active |
| `/api/payment` | GET | Disabled (503) |
