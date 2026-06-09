# Afferent Signal

Hyper-local consumer intent platform for retail environments.

## Stack
- **Frontend**: Next.js 14 static export → GitHub Pages
- **Backend**: Supabase Edge Function (Deno/TypeScript)
- **Database**: Supabase Postgres (RLS enabled)
- **AI**: Gemini 2.5 Flash structured output

---

## Setup

### 1. Supabase
1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste and run `supabase/migrations/001_init.sql`
3. Go to **Settings → API** — copy your **Project URL** and **anon public** key
4. Go to **Settings → Edge Functions** — copy your **service_role** key

### 2. Deploy the Edge Function
```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
# Set secrets
supabase secrets set GOOGLE_API_KEY=your-gemini-api-key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
# Deploy
supabase functions deploy triage --no-verify-jwt
```

### 3. Frontend — local dev
```bash
cd frontend
cp .env.local.example .env.local
# Fill in your values in .env.local
npm install
npm run dev
# → http://localhost:3000
```

### 4. Frontend — GitHub Pages deploy
1. Push this repo to GitHub
2. Go to **Settings → Secrets and variables → Actions** and add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_DASHBOARD_KEYS`
   - `NEXT_PUBLIC_BASE_PATH` (e.g. `/afferent-signal` or leave empty for custom domain)
3. Go to **Settings → Pages** → set source to `gh-pages` branch
4. Push to `main` — GitHub Actions builds and deploys automatically

---

## Local test — capture a signal
```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/triage \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"store_id":"store_001","raw_input":"You never have Coca-Cola Zero in stock","session_id":"test-1"}'
```
