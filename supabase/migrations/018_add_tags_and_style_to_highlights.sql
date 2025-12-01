-- Migration: Add tags and style to highlights table
-- Date: December 1, 2025
-- Description: Add tags array and style field to support categorization and different highlight rendering styles

-- Add tags column (array of text)
ALTER TABLE highlights 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Add style column with enum constraint
ALTER TABLE highlights 
ADD COLUMN IF NOT EXISTS style VARCHAR(20) DEFAULT 'highlight' 
    CHECK (style IN ('highlight', 'underline', 'tagged'));

-- Create index on tags for efficient querying
CREATE INDEX IF NOT EXISTS idx_highlights_tags ON highlights USING GIN (tags);

-- Create index on style for filtering
CREATE INDEX IF NOT EXISTS idx_highlights_style ON highlights(style);

-- Comments
COMMENT ON COLUMN highlights.tags IS 'Array of tags for categorizing highlights (e.g., Definition, Example, Important detail, Key idea, To revisit, Step / Process)';
COMMENT ON COLUMN highlights.style IS 'Visual style of the highlight: "highlight" (background), "underline" (underline), or "tagged" (with tag indicator)';

