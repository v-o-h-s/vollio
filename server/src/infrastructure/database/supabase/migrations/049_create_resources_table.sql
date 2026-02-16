-- ============================================================
-- 049: Create resources table
-- ============================================================

CREATE TABLE IF NOT EXISTS resources (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Link to the plan this resources is based on
  plan_id UUID REFERENCES plans(id) NOT NULL,

  -- consumable balance
  remaining_ai_tokens BIGINT NOT NULL DEFAULT 0,

  -- storage balance (in bytes)
  remaining_storage_bytes BIGINT NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Users can only see their own resources
CREATE POLICY "Users can view their own resources"
  ON resources FOR SELECT
  USING (auth.uid() = user_id);

-- Index for plan lookups
CREATE INDEX IF NOT EXISTS idx_resources_plan_id ON resources(plan_id);

-- Trigger to update updated_at
-- (Assuming update_updated_at_column function already exists from previous migrations, 
-- but defined here defensively if needed or use a standard one)

CREATE TRIGGER update_resources_updated_at
    BEFORE UPDATE ON resources
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
