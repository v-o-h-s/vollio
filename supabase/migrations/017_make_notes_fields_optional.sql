-- Migration: Make title, content, and pdf_id optional in notes table
-- Description: Allows creating notes without requiring title, content, or pdf_id to be set initially

-- Drop the existing constraints that enforce non-null/non-empty values
ALTER TABLE notes 
DROP CONSTRAINT IF EXISTS notes_title_check,
DROP CONSTRAINT IF EXISTS notes_content_check;

-- Alter columns to allow NULL values
ALTER TABLE notes 
ALTER COLUMN title DROP NOT NULL,
ALTER COLUMN title DROP DEFAULT,
ALTER COLUMN content DROP NOT NULL,
ALTER COLUMN content DROP DEFAULT;

-- Set new defaults that allow NULL
ALTER TABLE notes 
ALTER COLUMN title SET DEFAULT NULL,
ALTER COLUMN content SET DEFAULT NULL;

-- Add comment to document the change
COMMENT ON COLUMN notes.title IS 'Note title - optional, can be NULL';
COMMENT ON COLUMN notes.content IS 'TipTap JSONContent format - optional, can be NULL';
COMMENT ON COLUMN notes.pdf_id IS 'Direct reference to the PDF document - optional, can be NULL';
