# Afferent Signal

> Hyper-local consumer retail intent platform
> **Owner:** Andre Davis / 207 Analytix / Naples, Maine
> **Stack:** Next.js 15 + Tailwind CSS v4 + Supabase + FastAPI + Gemini 2.5 Flash

---

## Architecture

```
Consumer App (/app)     →  Cloudflare Pages  (free, unlimited bandwidth)
Ops Dashboard (/ops)    →  Same deploy, middleware-protected (staff only)
FastAPI Backend         →  Docker / Railway   (port 8000)
Database                →  Supabase PostgreSQL (existing project)
```

## Two Interfaces — Never Merge

| Interface | Path | Audience |
|-----------|------|----------|
| Consumer App | `/app`, `/submit`, `/campaigns`, `/requests`, `/profile`, `/premium` | Public shoppers |
| Ops Dashboard | `/ops` | Staff only — never expose to consumers |

---

## Local Development

```bash
# 1. Clone
git clone https://github.com/207-analytix/afferent-signal.git
cd afferent-signal

# 2. Frontend
cd nextjs
cp .env.example .env.local
# Fill in your Supabase + Gemini keys in .env.local
npm install
npm run dev
# → http://localhost:3000

# 3. Backend (separate terminal)
cd ../backend
cp .env.example .env
# Fill in your keys
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
# → http://localhost:8000

# 4. Or run both with Docker
cd ..
docker-compose up
```

---

## Cloudflare Pages Deployment

### Automatic (recommended)
Every push to `main` that touches `nextjs/` triggers the GitHub Actions workflow
(`.github/workflows/cloudflare-pages.yml`) which builds and deploys automatically.

### Required GitHub Secrets

Go to: **GitHub → afferent-signal → Settings → Secrets and variables → Actions**

| Secret | Where to get it |
|--------|----------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare Dashboard → My Profile → API Tokens → Create Token → "Cloudflare Pages — Edit" template |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Dashboard → right sidebar → Account ID |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API |

### Cloudflare Dashboard Build Settings

| Setting | Value |
|---------|-------|
| Framework preset | `Next.js` |
| Build command | `cd nextjs && npm install && npm run build` |
| Build output directory | `nextjs/.next` |
| Root directory | `/` |

### Environment Variables (Cloudflare Dashboard)

Cloudflare Dashboard → afferent-signal → Settings → Environment Variables:

| Variable | Type |
|----------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Plain text |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Plain text |
| `SUPABASE_SERVICE_ROLE_KEY` | **Encrypted** |
| `GEMINI_API_KEY` | **Encrypted** |

---

## GitHub Pages (Static Prototype Only)

The `/docs` folder serves the static HTML prototype at:
**https://207-analytix.github.io/afferent-signal/**

This is for stakeholder demos only. It is not the production app.

---

## Absolute Rules

1. **NEVER** expose `urgency_score`, `ai_extracted_*`, or raw statuses to consumers
2. **NEVER** merge `/app` (consumers) and `/ops` (staff) interfaces
3. **ALWAYS** use `getStatusLabel()` from `src/lib/status-map.ts`
4. **ALWAYS** brand gradient: `#2563eb → #0f766e → #16a34a`
5. **ALWAYS** Inter font, mobile-first, `max-w-md`, `pb-24` for nav clearance
6. Supabase **anon key** = browser safe. **Service role key** = server only, never client
7. Gemini model = `gemini-2.5-flash` only

---

## Project Structure

```
afferent-signal/
├── .github/workflows/
│   ├── cloudflare-pages.yml   ← auto-deploy to Cloudflare on push
│   └── deploy.yml             ← GitHub Pages static prototype
├── backend/                   ← FastAPI + Gemini 2.5 Flash (Phase 1 complete)
├── docs/                      ← GitHub Pages static prototype
├── nextjs/                    ← Next.js 15 consumer app (Cloudflare target)
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx           ← Home
│   │   │   ├── submit/            ← 3-step product request flow
│   │   │   ├── campaigns/         ← Community campaigns
│   │   │   ├── requests/          ← My requests timeline
│   │   │   ├── profile/           ← User profile & preferences
│   │   │   └── premium/           ← Premium membership tiers
│   │   ├── components/
│   │   └── lib/
│   │       ├── supabase.ts        ← Browser client (anon key)
│   │       ├── supabase-admin.ts  ← Server only (service role)
│   │       └── status-map.ts      ← All status translations
│   └── src/middleware.ts          ← /ops route protection
├── supabase/                  ← Schema + migrations
└── docker-compose.yml         ← Local dev: backend + frontend
```

---
*207 Analytix — afferentsignal.com*
