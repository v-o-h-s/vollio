-- ============================================================
-- 048: Create plans and transactions tables
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

  -- The Paddle price ID linked to this plan (null for free tier)
  paddle_price_id TEXT UNIQUE,

  -- Whether this plan is currently available for purchase
  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  -- Feature limits for this plan
  max_documents INTEGER,         -- null = unlimited
  max_ai_queries_per_day INTEGER, -- null = unlimited

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed the default plans
INSERT INTO plans (name, slug, description, price_cents, currency, billing_interval, paddle_price_id, is_active, max_documents, max_ai_queries_per_day)
VALUES
  ('Free', 'free', 'Get started with basic features', 0, 'USD', NULL, NULL, TRUE, 5, 10),
  ('Pro Monthly', 'pro_monthly', 'Full access, billed monthly', 700, 'USD', 'month', NULL, TRUE, NULL, NULL),
  ('Pro Yearly', 'pro_yearly', 'Full access, billed yearly — save 30%', 5000, 'USD', 'year', NULL, TRUE, NULL, NULL)
ON CONFLICT (slug) DO NOTHING;


-- 2. Add plan_id FK to existing subscriptions table
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES plans(id);

-- Backfill: set existing active subscriptions to pro_monthly by default
-- (run this manually if needed, or adjust as appropriate)
-- UPDATE subscriptions SET plan_id = (SELECT id FROM plans WHERE slug = 'pro_monthly') WHERE status = 'active';


-- 3. Transactions table: logs every payment from Paddle
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Link to our user
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Link to the subscription this payment is for
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,

  -- Paddle IDs for reference
  paddle_transaction_id TEXT UNIQUE NOT NULL,

  -- Status: draft, ready, billed, paid, completed, canceled, past_due
  status TEXT NOT NULL,

  -- Amount in cents
  amount_cents INTEGER,
  currency TEXT DEFAULT 'USD',

  -- What was billed (Paddle price ID)
  paddle_price_id TEXT,

  -- Billing period this transaction covers
  billing_period_start TIMESTAMPTZ,
  billing_period_end TIMESTAMPTZ,

  -- When Paddle created the transaction
  paddle_created_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Plans: everyone can read (they need to see pricing)
CREATE POLICY "Anyone can view active plans"
  ON plans FOR SELECT
  USING (is_active = TRUE);

-- Transactions: users can only see their own
CREATE POLICY "Users can view their own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_subscription_id ON transactions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_transactions_paddle_transaction_id ON transactions(paddle_transaction_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON subscriptions(plan_id);
