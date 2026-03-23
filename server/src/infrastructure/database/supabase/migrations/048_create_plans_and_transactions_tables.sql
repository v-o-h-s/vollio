-- ============================================================
-- 048: Create plans table
-- ============================================================

-- 1. Plans table: stores the available subscription tiers
-- This is your single source of truth for what plans exist.
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Human-readable name: "Free", "Pro Monthly", "Pro Yearly"
  name TEXT NOT NULL,

  -- Internal slug for code: "free", "pro_monthly", "pro_yearly"
  slug TEXT NOT NULL UNIQUE,

  -- Description shown to the user
  description TEXT,

  -- Price in cents (e.g. 700 = $7.00, 5000 = $50.00/year)
  price_cents INTEGER NOT NULL DEFAULT 0,

  -- Currency code
  currency TEXT NOT NULL DEFAULT 'USD',

  -- Billing interval: "month", "year", or null for free
  billing_interval TEXT,

  -- Whether this plan is currently available for purchase
  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  -- Feature limits for this plan
  max_ai_tokens BIGINT,          -- null = unlimited
  max_storage_bytes BIGINT,      -- null = unlimited

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed the default plans
INSERT INTO plans (name, slug, description, price_cents, currency, billing_interval, is_active, max_ai_tokens, max_storage_bytes)
VALUES
  ('Free', 'free', 'Get started with basic features', 0, 'USD', NULL, TRUE, 10000, 52428800), -- 10k tokens, 50MB
  ('Premium', 'premium', 'Full access to all AI features and storage', 700, 'USD', 'month', TRUE, 10000000, 524288000) -- 10M tokens, 500MB
ON CONFLICT (slug) DO NOTHING;


-- 2. Add plan_id FK to existing subscriptions table
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES plans(id);

-- Backfill: set existing active subscriptions to pro_monthly by default
-- (run this manually if needed, or adjust as appropriate)
-- UPDATE subscriptions SET plan_id = (SELECT id FROM plans WHERE slug = 'pro_monthly') WHERE status = 'active';


-- Enable RLS
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- Plans: everyone can read (they need to see pricing)
CREATE POLICY "Anyone can view active plans"
  ON plans FOR SELECT
  USING (is_active = TRUE);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON subscriptions(plan_id);
