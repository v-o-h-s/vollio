-- Create a table to track subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Status: active, trialing, past_due, paused, canceled
  status TEXT NOT NULL,
  
  -- The ID of the price we created ($7/mo)
  price_id TEXT,
  
  -- When the current period ends
  current_period_end TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one primary subscription record per user
  CONSTRAINT unique_user_subscription UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
