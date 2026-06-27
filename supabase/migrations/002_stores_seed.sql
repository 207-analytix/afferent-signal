-- ==========================================================================
-- AFFERENT SIGNAL — STORES SEED DATA
-- Test market: ZIP 04020 (Cornish, Maine) and surrounding area
-- ==========================================================================

INSERT INTO stores (store_id, store_name, retailer_chain, zip_code)
VALUES
  ('HFORD_CORNISH_ME',  'Hannaford',         'Hannaford',  '04020'),
  ('SHAWS_STANDISH_ME', 'Shaw''s',            'Shaw''s',    '04084'),
  ('RENYS_BRIDGTON_ME', 'Reny''s',            'Reny''s',    '04009'),
  ('DMKT_NAPLES_ME',    'Naples Dollar Market','Independent','04055'),
  ('COOP_BRIDGTON_ME',  'Bridgton Natural Foods Co-op', 'Co-op', '04009')
ON CONFLICT (store_id) DO NOTHING;
