-- ============================================================
-- 052: Create storage usage logs table
-- ============================================================

CREATE TABLE IF NOT EXISTS storage_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- The action that caused the change: "upload", "delete", "rename" (if it affects path/logic), etc.
  action_type TEXT NOT NULL,
  
  -- The size changed in bytes (positive for consumption, negative for release)
  size_bytes BIGINT NOT NULL,
  
  -- The document or resource affected
  resource_id UUID,
  
  -- Descriptive metadata (e.g., filename, previous size)
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE storage_usage_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own logs
CREATE POLICY "Users can view their own storage logs"
  ON storage_usage_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Index for user lookups
CREATE INDEX IF NOT EXISTS idx_storage_usage_logs_user_id ON storage_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_storage_usage_logs_resource_id ON storage_usage_logs(resource_id);
