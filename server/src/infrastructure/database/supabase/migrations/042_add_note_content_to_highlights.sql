-- Add note_content column to highlights table
ALTER TABLE highlights ADD COLUMN IF NOT EXISTS note_content TEXT;
