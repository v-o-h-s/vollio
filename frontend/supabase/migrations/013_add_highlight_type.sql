-- Migration: Add type field to highlights table
-- Date: October 10, 2025
-- Description: Add a type field to distinguish between different highlight modes (quick, comment, note)

-- Add the type column with appropriate constraints
ALTER TABLE highlights 
ADD COLUMN type VARCHAR(20) NOT NULL DEFAULT 'note' 
CHECK (type IN ('quick', 'comment', 'note'));

-- Add index for filtering by type
CREATE INDEX idx_highlights_type ON highlights(type);

-- Add comment for documentation
COMMENT ON COLUMN highlights.type IS 'Type of highlight: quick (instant highlight), comment (hover comment), note (linked to full note)';

-- Update existing highlights to have 'note' type (since they were all linked to notes)
UPDATE highlights SET type = 'note' WHERE note_id IS NOT NULL;
UPDATE highlights SET type = 'quick' WHERE note_id IS NULL;

-- Now that we have types, we can adjust the note_id constraint
-- note_id should be required for 'note' type highlights, but optional for others
ALTER TABLE highlights 
ADD CONSTRAINT highlights_note_id_type_check 
CHECK (
  (type = 'note' AND note_id IS NOT NULL) OR 
  (type IN ('quick', 'comment') AND note_id IS NULL)
);