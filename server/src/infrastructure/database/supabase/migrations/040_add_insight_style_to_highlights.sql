-- Migration: Add insight style to highlights table
-- Date: December 29, 2025
-- Description: Update style check constraint to include 'insight'

-- Drop the existing constraint (assuming default naming or previously named highlights_style_check)
-- Note: postgres usually names it highlights_style_check for column checks
ALTER TABLE highlights DROP CONSTRAINT IF EXISTS highlights_style_check;

-- Re-add the constraint with the new 'insight' value
ALTER TABLE highlights 
ADD CONSTRAINT highlights_style_check 
CHECK (style IN ('highlight', 'underline', 'tagged', 'insight'));
