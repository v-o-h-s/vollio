-- Migration: Rename flashcards.explanation to flashcards.hint
-- Description: Renames the 'explanation' column to 'hint' in the flashcards table to match frontend expectations

-- Rename the column from explanation to hint
ALTER TABLE flashcards 
RENAME COLUMN explanation TO hint;

-- Add a comment to document the column purpose
COMMENT ON COLUMN flashcards.hint IS 'Optional hint or additional context to help understand the flashcard';
