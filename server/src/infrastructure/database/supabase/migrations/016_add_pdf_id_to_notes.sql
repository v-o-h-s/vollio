-- Migration: Add document_id column to notes table
-- Description: Adds a direct link between notes and Documents, allowing notes to be associated with a Document document without necessarily being linked to a specific highlight.

-- Add document_id column to notes table
ALTER TABLE notes 
ADD COLUMN document_id UUID NULL REFERENCES documents(id) ON DELETE CASCADE;

-- Add index for performance
CREATE INDEX idx_notes_document_id ON notes(document_id);

-- Add comment
COMMENT ON COLUMN notes.document_id IS 'Direct reference to the Document document this note belongs to';
