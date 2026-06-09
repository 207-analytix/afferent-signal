create extension if not exists pgcrypto;

create table if not exists public.stores (
  store_id varchar primary key,
  store_name varchar not null,
  retailer_chain varchar,
  zip_code varchar
);

create table if not exists public.intent_signals (
  signal_id uuid primary key default gen_random_uuid(),
  store_id varchar not null references public.stores(store_id) on delete cascade,
  timestamp timestamptz not null default now(),
  raw_input text not null,
  session_id varchar not null,
  ai_extracted_category varchar,
  ai_extracted_brand varchar,
  ai_descriptors jsonb not null default '[]'::jsonb,
  intent_type varchar,
  urgency_score int check (urgency_score between 1 and 5),
  processing_status varchar not null default 'PENDING_MANUAL_TRIAGE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_intent_signals_store_status
  on public.intent_signals (store_id, processing_status);

create index if not exists idx_intent_signals_urgency
  on public.intent_signals (urgency_score);

create index if not exists idx_intent_signals_timestamp
  on public.intent_signals (timestamp desc);

create index if not exists idx_intent_signals_brand
  on public.intent_signals (ai_extracted_brand);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_intent_signals_updated_at on public.intent_signals;
create trigger trg_intent_signals_updated_at
before update on public.intent_signals
for each row execute function public.set_updated_at();

alter table public.stores enable row level security;
alter table public.intent_signals enable row level security;

create policy if not exists "Allow anon read stores"
on public.stores for select to anon using (true);

create policy if not exists "Allow anon read signals"
on public.intent_signals for select to anon using (true);

create policy if not exists "Allow service role full access stores"
on public.stores for all to service_role using (true) with check (true);

create policy if not exists "Allow service role full access signals"
on public.intent_signals for all to service_role using (true) with check (true);
