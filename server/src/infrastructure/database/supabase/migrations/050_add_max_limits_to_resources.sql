-- ============================================================
-- 050: Add max limits to resources table
-- ============================================================

-- Track the total capacity allowed at the time of the last sync.
-- This is essential for calculating current usage: (max - remaining)
ALTER TABLE resources 
  ADD COLUMN IF NOT EXISTS max_ai_tokens BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_storage_bytes BIGINT NOT NULL DEFAULT 0;

-- Backfill based on plan defaults for any existing rows
-- (Optional: only if you have data already, otherwise the defaults handle it)
UPDATE resources r
SET 
  max_ai_tokens = p.max_ai_tokens,
  max_storage_bytes = p.max_storage_bytes
FROM plans p
WHERE r.plan_id = p.id;
