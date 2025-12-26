-- Migration: Update annotations schema for better note-annotation relationship
-- This updates the annotations table to reference notes instead of notes referencing annotations

-- Add note_id column to annotations table
ALTER TABLE annotations ADD COLUMN note_id UUID REFERENCES notes(id) ON DELETE CASCADE;

-- Remove the document_annotation_id column from notes table (reverse relationship)
ALTER TABLE notes DROP COLUMN IF EXISTS document_annotation_id;

-- Create index for the new note_id column
CREATE INDEX idx_annotations_note_id ON annotations(note_id);

-- Update the annotations table to make note_id NOT NULL after we populate it
-- (This will be done in a separate step once we have data migration logic)

-- Add a comment to document the relationship
COMMENT ON COLUMN annotations.note_id IS 'References the note that contains the annotation content';
COMMENT ON TABLE annotations IS 'Document text annotations linked to notes. Each annotation represents a highlighted text selection in a Document that is linked to a note.';
COMMENT ON TABLE notes IS 'Rich text notes created with the TipTap editor. Can be standalone or linked to Document annotations.';