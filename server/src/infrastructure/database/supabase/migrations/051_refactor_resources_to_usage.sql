-- ============================================================
-- 051: Refactor resources to track usage instead of remaining
-- ============================================================

-- Rename remaining to used for clarity and more robust logic
-- We calculate remaining as (max - used)
ALTER TABLE resources 
  RENAME COLUMN remaining_ai_tokens TO used_ai_tokens;

ALTER TABLE resources
  RENAME COLUMN remaining_storage_bytes TO used_storage_bytes;

-- Migration of data logic:
-- Previously, we stored 'remaining'. Now we want 'used'.
-- used = max - remaining
UPDATE resources 
SET 
  used_ai_tokens = GREATEST(0, max_ai_tokens - used_ai_tokens),
  used_storage_bytes = GREATEST(0, max_storage_bytes - used_storage_bytes);

-- Default values should be 0 (no usage)
ALTER TABLE resources ALTER COLUMN used_ai_tokens SET DEFAULT 0;
ALTER TABLE resources ALTER COLUMN used_storage_bytes SET DEFAULT 0;
