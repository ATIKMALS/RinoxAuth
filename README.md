# RinoxAuth

Modern licensing and authentication stack: **Next.js 14** admin panel (`apps/web`), **FastAPI** API + SQLite (`backend`), and **SDK** examples (C++, C#, Python).

---

## Table of contents

1. [What you get](#what-you-get)
2. [Repository layout](#repository-layout)
3. [Prerequisites](#prerequisites)
4. [Run locally (development)](#run-locally-development)
5. [Environment variables](#environment-variables)
6. [Production hosting (step by step)](#production-hosting-step-by-step)
7. [URLs and auth checklist](#urls-and-auth-checklist)
8. [Logout and session issues](#logout-and-session-issues)
9. [Build, lint, and typecheck](#build-lint-and-typecheck)
10. [API overview](#api-overview)
11. [Security notes](#security-notes)
12. [SDK contract](#sdk-contract)

---

## What you get

- Dashboard: users, apps, licenses, analytics, activity logs, settings
- Auth: **NextAuth** (JWT session) + backend `/api/auth/login` for credentials
- License and user CRUD via FastAPI admin routes
- Optional OAuth providers (Google, GitHub, Discord) when keys are set

---

## Repository layout

```text
web auth/
├── apps/web/          # Next.js 14 app (dashboard, marketing, NextAuth)
│   ├── app/           # App Router pages + API routes
│   ├── components/
│   ├── lib/           # config, auth options, client env helpers
│   ├── middleware.ts  # protects dashboard routes
│   └── .env           # copy from .env.example
├── backend/           # FastAPI + SQLite
│   ├── main.py
│   ├── requirements.txt
│   └── .env           # copy from .env.example
├── sdk/               # cpp, csharp, python examples
├── docs/api/          # auth contract
└── README.md
```

---

## Prerequisites

| Tool    | Suggested version |
|---------|-------------------|
| Node.js | 20+               |
| npm     | 10+               |
| Python  | 3.10+             |

```bash
node -v
npm -v
python --version
```

---

## Run locally (development)

### 1) Backend

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
# source .venv/bin/activate

pip install -r requirements.txt
copy .env.example .env   # Windows — edit values
# cp .env.example .env   # Unix

uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

Health check: `http://127.0.0.1:8000/health`

### 2) Frontend

```bash
cd apps/web
npm install
copy .env.example .env   # Windows — edit values
npm run dev
```

Open **the same host** you put in `NEXTAUTH_URL` (recommended: `http://localhost:3000`).

**Demo login** (from `backend/.env` defaults):

- Username: `admin`
- Password: `admin123`

---

## Environment variables

### `apps/web/.env` (Next.js)

| Variable | Required | Purpose |
|----------|----------|---------|
| `BACKEND_BASE_URL` | Yes | Server-side API base URL, e.g. `http://127.0.0.1:8000` |
| `NEXT_PUBLIC_BACKEND_URL` | Strongly recommended | Same URL as above for **browser** forms (CORS must allow your Next origin) |
| `NEXT_PUBLIC_APP_URL` | Yes in production | Public site URL, e.g. `https://panel.example.com` (metadata, OG tags) |
| `NEXTAUTH_URL` | Yes | **Must exactly match** the URL users open in the browser (scheme + host + port) |
| `NEXTAUTH_SECRET` | Yes | Random long string; signs JWT. Same value used by middleware |
| `BACKEND_SECRET` | Yes | Shared secret with FastAPI; sent as `X-App-Secret` |
| `BACKEND_APP_NAME` | Yes | Must match backend `APP_NAME` |
| `BACKEND_OWNER_ID` | Yes | Must match backend `OWNER_ID` |
| `SESSION_COOKIE_NAME` | Optional | Custom session cookie name if you extend cookie auth |
| OAuth vars | Optional | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, etc. |

Copy the template:

```bash
cd apps/web
cp .env.example .env
```

### `backend/.env` (FastAPI)

| Variable | Purpose |
|----------|---------|
| `APP_NAME` | Application id — must match `BACKEND_APP_NAME` in Next |
| `OWNER_ID` | Owner id — must match `BACKEND_OWNER_ID` in Next |
| `APP_SECRET` | Must match `BACKEND_SECRET` in Next |
| `DEMO_USERNAME` / `DEMO_PASSWORD` | Seed admin user |
| `DB_PATH` | SQLite file path (default `auth.db`) |
| `CORS_ORIGINS` | Comma-separated allowed browser origins (see production section) |

---

## Production hosting (step by step)

You typically deploy **two services**: the **Next.js** site and the **FastAPI** API. They can live on different domains (e.g. `panel.example.com` + `api.example.com`) or one VPS with a reverse proxy.

### A) Frontend on Vercel + backend on Railway / Render / Fly.io

**Backend**

1. Create a new Web Service from this repo; set **root directory** to `backend`.
2. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT` (platform-specific; Render uses `$PORT`).
3. Set all `backend/.env` variables in the platform UI.
4. Note the public HTTPS URL, e.g. `https://your-api.onrender.com`.

**Frontend (Vercel)**

1. Import the Git repo; set **Root Directory** to `apps/web`.
2. **Framework**: Next.js. **Build**: `npm run build`. **Output**: default (`.next`).
3. Add **every** variable from the table above. Critical:
   - `NEXTAUTH_URL` = your Vercel URL, e.g. `https://your-app.vercel.app`
   - `NEXT_PUBLIC_APP_URL` = same as `NEXTAUTH_URL` unless you use a custom domain
   - `BACKEND_BASE_URL` = your deployed API HTTPS URL
   - `NEXT_PUBLIC_BACKEND_URL` = **same** as `BACKEND_BASE_URL` so browser forms hit the API
   - `NEXTAUTH_SECRET` = long random string (generate once and keep)
4. **Custom domain** (optional): add in Vercel, then update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to `https://panel.yourdomain.com` and redeploy.

**CORS**

Your backend currently allows broad origins; for production you should restrict `allow_origins` in `backend/main.py` to your real Next origin(s) only.

### B) Everything on one VPS (Ubuntu + Nginx + SSL)

High-level flow:

1. Point **two DNS records** (or one) to the server IP, e.g. `panel.example.com` and `api.example.com`.
2. Install **Node 20**, **Python 3.10+**, **Nginx**, **Certbot** (Let’s Encrypt).
3. Run FastAPI behind **Uvicorn** on `127.0.0.1:8000` (or a Unix socket), e.g. with **systemd**:
   - `ExecStart=/path/to/.venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000`
4. Build Next: `cd apps/web && npm ci && npm run build && npm run start` (or use **PM2** for `next start -p 3000`).
5. **Nginx**: `server_name panel.example.com` → `proxy_pass http://127.0.0.1:3000`; `server_name api.example.com` → `proxy_pass http://127.0.0.1:8000`; enable `listen 443 ssl` with Certbot certificates.
6. Set `apps/web/.env` on the server with **production** URLs:
   - `NEXTAUTH_URL=https://panel.example.com`
   - `NEXT_PUBLIC_APP_URL=https://panel.example.com`
   - `BACKEND_BASE_URL=https://api.example.com`
   - `NEXT_PUBLIC_BACKEND_URL=https://api.example.com`
7. Restart both processes after any `.env` change.

### C) Docker (outline)

- **Image 1**: `backend` — `FROM python:3.12-slim`, install `requirements.txt`, `CMD ["uvicorn","main:app","--host","0.0.0.0","--port","8000"]`.
- **Image 2**: `apps/web` — multi-stage build: `npm ci && npm run build`, run `node server.js` or `next start`.
- Pass env vars via compose `environment:` or secrets store.
- Put **Traefik** or **Nginx** in front for TLS and routing.

---

## URLs and auth checklist

Use this before going live:

1. **`NEXTAUTH_URL`** equals the exact URL users type (including `https` and no trailing slash unless you always use one consistently).
2. **`NEXTAUTH_SECRET`** is set and never committed to git.
3. **`NEXTAUTH_SECRET`** (or `BACKEND_SECRET` if you use it as fallback) matches what **middleware** expects — both read from the same env on the server.
4. **`BACKEND_BASE_URL`** and **`NEXT_PUBLIC_BACKEND_URL`** point to the **same** API in production.
5. **`BACKEND_SECRET` / `APP_SECRET`**, **`BACKEND_APP_NAME` / `APP_NAME`**, **`BACKEND_OWNER_ID` / `OWNER_ID`** match between Next and FastAPI.
6. Do not mix **`localhost`** and **`127.0.0.1`** in the browser vs `NEXTAUTH_URL` — CSRF cookies are host-sensitive.

---

## Logout and session issues

The app uses **NextAuth** `signOut` plus a **full page** redirect to `/login` so cookies and middleware stay in sync.

If logout used to “flash” login and bounce back:

- Ensure **`SessionProvider`** wraps the app (done in `app/layout.tsx`).
- Ensure **`NEXTAUTH_URL`** matches how you open the site.
- After changing secrets, **clear site cookies** or use a private window.

---

## Build, lint, and typecheck

```bash
cd apps/web
npm run lint
npm run typecheck
npm run build
npm run start    # production serve on :3000
```

---

## API overview

Consumed by the dashboard and `services/api.ts` (server-side):

- `GET /health`
- `GET /api/apps`, `GET /api/users`, `GET /api/licenses`, …
- Admin: `POST /api/admin/users`, `POST /api/admin/licenses`, `POST /api/admin/apps`, etc.

Full list is in `backend/main.py` and earlier sections of this file.

---

## Security notes

- Rotate `BACKEND_SECRET` / `APP_SECRET` for production; use long random values.
- Prefer **HTTPS** everywhere; align `NEXTAUTH_URL` with TLS.
- Tighten **CORS** to your real frontend origin(s).
- Consider **PostgreSQL** instead of SQLite for multi-instance deployments.
- Add rate limiting and auditing for sensitive admin routes.

---

## SDK contract

Canonical contract: `docs/api/auth-contract.md`  
When the API changes: update that doc first, then update `sdk/python`, `sdk/csharp`, and `sdk/cpp`.

---

## Troubleshooting

| Symptom | What to check |
|---------|----------------|
| Login fails | Backend running? `BACKEND_BASE_URL` correct? Secrets match? |
| Empty dashboard | API returns data? Browser network tab for `/api/...` or server logs |
| Logout loop / flash | `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `SessionProvider` present |
| Forms fail from browser | `NEXT_PUBLIC_BACKEND_URL` set; API CORS allows your Next origin |

---

## Tech stack

- **Frontend:** Next.js 14, React 18, Tailwind CSS, NextAuth, Zod, Sonner, Recharts  
- **Backend:** FastAPI, Uvicorn, SQLite  
- **Icons / UX:** Lucide, Framer Motion (marketing)
