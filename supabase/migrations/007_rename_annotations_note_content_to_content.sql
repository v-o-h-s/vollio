-- Migration: Rename note_content to content in annotations table
-- Date: September 6, 2025
-- Description: Rename the note_content column to content for consistency

-- Rename the column from note_content to content
ALTER TABLE annotations 
RENAME COLUMN note_content TO content;

-- Update any existing constraints or indexes that reference the old column name
-- (No additional constraints need updating in this case as they don't reference the column by name)

-- Add a comment to document the change
COMMENT ON COLUMN annotations.content IS 'Content of the annotation note (renamed from note_content for consistency)';
