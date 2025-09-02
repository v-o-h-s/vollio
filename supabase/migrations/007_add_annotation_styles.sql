-- Migration: Add style support for annotations
-- This adds a style column to store highlight colors, borders, and opacity

-- Add style column to annotations table
ALTER TABLE annotations ADD COLUMN style JSONB DEFAULT '{
  "highlightColor": "rgba(255, 255, 0, 0.3)",
  "borderColor": "rgba(255, 193, 7, 0.6)",
  "opacity": 0.3
}'::jsonb;

-- Add index for style queries (in case we want to filter by style properties)
CREATE INDEX idx_annotations_style ON annotations USING GIN (style);

-- Add comment to document the style column
COMMENT ON COLUMN annotations.style IS 'JSON object containing style properties: highlightColor, borderColor, opacity for annotation appearance';

-- Example style object structure:
-- {
--   "highlightColor": "rgba(255, 255, 0, 0.3)",
--   "borderColor": "rgba(255, 193, 7, 0.6)", 
--   "opacity": 0.3
-- }