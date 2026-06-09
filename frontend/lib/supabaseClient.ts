import { createClient } from '@supabase/supabase-js';

// Falls back to build-time env vars (GitHub Actions injects these)
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://wznicchxpogzdiqeyckg.supabase.co';
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'sb_publishable_iDUHjsXn1hok3uGcfRU7dg_T7P7XEyG';

export const supabase = createClient(url, key, {
  auth: { persistSession: false },
});
