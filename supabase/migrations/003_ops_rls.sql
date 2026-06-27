-- ==========================================================================
-- AFFERENT SIGNAL — OPS TABLE RLS
-- intent_signals is ops-only. No consumer should ever query it directly.
-- The anon key cannot read this table. Only the service role key can.
-- ==========================================================================

ALTER TABLE intent_signals ENABLE ROW LEVEL SECURITY;

-- Drop any accidental open policies
DROP POLICY IF EXISTS "signals_select_all" ON intent_signals;
DROP POLICY IF EXISTS "signals_insert_all" ON intent_signals;

-- No policies = RLS blocks ALL anon/authenticated access.
-- Only the service_role key bypasses RLS entirely.
-- FastAPI backend uses service_role — this is the correct setup.

-- Verify: run this query with the anon key — it should return 0 rows:
-- SELECT * FROM intent_signals LIMIT 1;
