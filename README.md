# Afferent Signal

**Hyper-local consumer retail intent platform** — 207 Analytix

Shoppers in a specific geographic area submit product requests and join community campaigns to collectively influence what local retail stores stock on their shelves.

**Primary test market:** ZIP 04020, Cornish/Naples, Maine

---

## Architecture

```
afferent-signal/
├── backend/          ← FastAPI + async SQLAlchemy + Gemini 2.5 Flash
├── nextjs/           ← Next.js 15 + Tailwind CSS v4 + Supabase
├── prototype/        ← Static HTML demos (GitHub Pages ready)
├── supabase/
│   └── migrations/   ← SQL schema + RLS policies + seed data
└── docker-compose.yml
```

**Two interfaces — never merged:**
- `/app` — Consumer-facing mobile web app (submit requests, join campaigns, track status)
- `/ops` — Internal analytics/triage dashboard (AI signal matrix, urgency scores — staff only)

---

## Quick Start

### 1. Clone

```bash
git clone https://github.com/207-analytix/afferent-signal.git
cd afferent-signal
```

### 2. Configure environment variables

```bash
# Backend
cp backend/.env.example backend/.env
# Fill in: DATABASE_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY

# Frontend
cp nextjs/.env.example nextjs/.env.local
# Fill in: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
#          SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY, NEXT_PUBLIC_API_URL
```

### 3. Run database migrations

In the **Supabase SQL Editor** (Dashboard → SQL Editor), run in order:

1. `supabase/migrations/001_rls_policies.sql` — RLS policies for all consumer tables
2. `supabase/migrations/002_stores_seed.sql` — Seed stores for ZIP 04020
3. `supabase/migrations/003_ops_rls.sql` — Lock intent_signals to service role only

> **Note:** The base schema (tables + indexes) from the original handoff document must be run first before these migrations.

### 4. Start with Docker Compose

```bash
docker compose up --build
```

- Backend API: http://localhost:8000
- Frontend: http://localhost:3000
- API docs (ops only): http://localhost:8000/ops/docs
- Health check: http://localhost:8000/health

### 5. Run locally without Docker

**Backend:**
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd nextjs
npm install
npm run dev
```

---

## API Routes

### Consumer routes (safe — no AI fields, no urgency scores)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/consumer/submit` | Submit a product request |
| `GET` | `/api/v1/consumer/requests/{user_id}` | Get user's own requests |
| `GET` | `/api/v1/consumer/campaigns` | List active campaigns |

### Ops routes (internal only — never call from consumer app)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/signals/capture` | Ingest raw signal + run Gemini triage |

### Next.js API handlers (server-side, service role)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/submit` | Consumer product request submission |
| `GET` | `/api/requests?user_id=` | Fetch user's requests (status translated) |
| `GET` | `/api/campaigns?user_id=` | Fetch active campaigns |
| `POST` | `/api/campaigns` | Join a campaign |
| `GET` | `/api/profile?user_id=` | Fetch user profile |
| `PUT` | `/api/profile` | Update preferences |

---

## Absolute Rules

1. **Never expose** `urgency_score`, `ai_extracted_*`, or raw `processing_status` to consumers
2. **Never merge** `/app` (consumers) and `/ops` (staff) interfaces
3. **Always use** `status-map.ts` / `safe_status_label()` before returning status to consumer
4. **Supabase anon key** = browser-safe (`NEXT_PUBLIC_` prefix only)
5. **Service role key** = server/backend only, never `NEXT_PUBLIC_`
6. **Gemini model** = `gemini-2.5-flash` — do not change
7. **FastAPI** = async SQLAlchemy sessions only — no sync DB calls
8. **Brand gradient** = `linear-gradient(90deg, #2563eb, #0f766e, #16a34a)`
9. **Font** = Inter via Google Fonts — no system fonts as primary
10. **Mobile-first** = `max-w-md`, `pb-24` for bottom nav clearance

---

## Build Status

| Section | Deliverable | Status |
|---------|-------------|--------|
| S1 | Static HTML prototype + Next.js shell | ✅ Complete |
| S2 | All consumer screens + shared components | ✅ Complete |
| S3A | FastAPI backend scaffold | ✅ Complete |
| S3B | Supabase RLS policies + seed data | ✅ Complete |
| S3C | Next.js API route handlers | ✅ Complete |
| S3D | Docker Compose + env examples | ✅ Complete |

---

*207 Analytix — Naples/Cornish, Maine*
