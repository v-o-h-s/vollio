-- Migration: Add pdf_id column to notes table
-- Description: Adds a direct link between notes and PDFs, allowing notes to be associated with a PDF document without necessarily being linked to a specific highlight.

-- Add pdf_id column to notes table
ALTER TABLE notes 
ADD COLUMN pdf_id UUID NULL REFERENCES pdfs(id) ON DELETE CASCADE;

-- Add index for performance
CREATE INDEX idx_notes_pdf_id ON notes(pdf_id);

-- Add comment
COMMENT ON COLUMN notes.pdf_id IS 'Direct reference to the PDF document this note belongs to';
