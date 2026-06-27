-- ==========================================================================
-- AFFERENT SIGNAL — RLS POLICIES
-- Run after schema creation (Part 2 of handoff doc)
-- RLS is already ENABLED on all consumer tables via the schema migration.
-- This file creates the actual policies.
-- ==========================================================================


-- ──────────────────────────────────────────────────────────────────────
-- TABLE: users
-- Each user can only read and update their own row.
-- Insert is handled by the service role (on sign-up).
-- ──────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;

CREATE POLICY "users_select_own"
  ON users FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users_update_own"
  ON users FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ──────────────────────────────────────────────────────────────────────
-- TABLE: product_requests
-- Users can insert their own requests and read their own requests only.
-- Staff (service role) can read all for ops triage.
-- ──────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "requests_insert_own" ON product_requests;
DROP POLICY IF EXISTS "requests_select_own" ON product_requests;

CREATE POLICY "requests_insert_own"
  ON product_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "requests_select_own"
  ON product_requests FOR SELECT
  USING (auth.uid() = user_id);


-- ──────────────────────────────────────────────────────────────────────
-- TABLE: campaigns
-- All authenticated users can read active campaigns (community visibility).
-- Only the creator can update or delete their own campaign.
-- Insert allowed for authenticated users (to start campaigns).
-- ──────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "campaigns_select_active" ON campaigns;
DROP POLICY IF EXISTS "campaigns_insert_auth" ON campaigns;
DROP POLICY IF EXISTS "campaigns_update_own" ON campaigns;

CREATE POLICY "campaigns_select_active"
  ON campaigns FOR SELECT
  USING (
    status = 'active'
    OR auth.uid() = created_by
  );

CREATE POLICY "campaigns_insert_auth"
  ON campaigns FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = created_by);

CREATE POLICY "campaigns_update_own"
  ON campaigns FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);


-- ──────────────────────────────────────────────────────────────────────
-- TABLE: campaign_supporters
-- Any authenticated user can join (insert their own row).
-- Users can see who else supports a campaign (community feature).
-- Users can remove only their own support record.
-- ──────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "supporters_select_all" ON campaign_supporters;
DROP POLICY IF EXISTS "supporters_insert_own" ON campaign_supporters;
DROP POLICY IF EXISTS "supporters_delete_own" ON campaign_supporters;

CREATE POLICY "supporters_select_all"
  ON campaign_supporters FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "supporters_insert_own"
  ON campaign_supporters FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "supporters_delete_own"
  ON campaign_supporters FOR DELETE
  USING (auth.uid() = user_id);


-- ──────────────────────────────────────────────────────────────────────
-- TABLE: badges
-- Users can only read their own badges.
-- Insert is service-role only (badges are awarded by the system).
-- ──────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "badges_select_own" ON badges;

CREATE POLICY "badges_select_own"
  ON badges FOR SELECT
  USING (auth.uid() = user_id);


-- ──────────────────────────────────────────────────────────────────────
-- TABLE: stores
-- Public read — all users (even unauthenticated) can see store listings.
-- Write is service-role only.
-- ──────────────────────────────────────────────────────────────────────

ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "stores_public_read" ON stores;

CREATE POLICY "stores_public_read"
  ON stores FOR SELECT
  USING (true);
