-- Migration: Update notes table user_id to UUID and add auto-populate trigger for Supabase Auth
-- This migration assumes you're migrating from Clerk to Supabase Auth

-- Step 1: Drop existing RLS policies
DROP POLICY IF EXISTS "Users can only view their own notes" ON notes;
DROP POLICY IF EXISTS "Users can only create their own notes" ON notes;
DROP POLICY IF EXISTS "Users can only update their own notes" ON notes;
DROP POLICY IF EXISTS "Users can only delete their own notes" ON notes;

-- Step 2: Drop the existing notes table (this will cascade delete all data)
DROP TABLE IF EXISTS notes CASCADE;

-- Step 3: Recreate notes table with user_id as UUID
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT DEFAULT NULL,
    content JSONB DEFAULT NULL,
    document_id UUID NULL REFERENCES documents(id) ON DELETE CASCADE,
    document_annotation_id UUID NULL, -- Will be recreated after annotations table is migrated
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    
    -- Constraints
    CONSTRAINT notes_content_check CHECK (content IS NULL OR content ? 'type')
);

-- Step 4: Create indexes for efficient querying
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_document_id ON notes(document_id);
CREATE INDEX idx_notes_document_annotation_id ON notes(document_annotation_id);
CREATE INDEX idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX idx_notes_updated_at ON notes(updated_at DESC);
CREATE INDEX idx_notes_is_deleted ON notes(is_deleted) WHERE is_deleted = FALSE;

-- Step 5: Create trigger to auto-populate user_id from auth.uid() on INSERT
CREATE OR REPLACE FUNCTION auto_set_user_id_for_notes()
RETURNS TRIGGER AS $$
BEGIN
    -- If user_id is not provided or is NULL, set it from the authenticated user
    IF NEW.user_id IS NULL THEN
        NEW.user_id = auth.uid();
    END IF;
    -- Ensure the user_id matches the authenticated user (security check)
    IF NEW.user_id != auth.uid() THEN
        RAISE EXCEPTION 'user_id must match authenticated user';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER notes_set_user_id
    BEFORE INSERT ON notes
    FOR EACH ROW
    EXECUTE FUNCTION auto_set_user_id_for_notes();

-- Step 6: Create updated_at trigger
CREATE OR REPLACE FUNCTION update_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notes_updated_at
    BEFORE UPDATE ON notes
    FOR EACH ROW
    EXECUTE FUNCTION update_notes_updated_at();

-- Step 7: Enable Row Level Security
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Step 8: Create new RLS policies using Supabase Auth
-- Users can only SELECT their own notes
CREATE POLICY "Users can view their own notes"
  ON notes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only INSERT notes with their own user_id
CREATE POLICY "Users can insert their own notes"
  ON notes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only UPDATE their own notes
CREATE POLICY "Users can update their own notes"
  ON notes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only DELETE their own notes
CREATE POLICY "Users can delete their own notes"
  ON notes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Step 9: Add comments
COMMENT ON TABLE notes IS 'User notes with Notion-like editor support using TipTap JSONContent format';
COMMENT ON COLUMN notes.id IS 'Unique identifier for the note';
COMMENT ON COLUMN notes.user_id IS 'Supabase Auth user ID (UUID) - auto-populated from authenticated user';
COMMENT ON COLUMN notes.title IS 'Note title - optional, can be NULL';
COMMENT ON COLUMN notes.content IS 'TipTap JSONContent format - optional, can be NULL';
COMMENT ON COLUMN notes.document_id IS 'Direct reference to the document - optional, can be NULL';
COMMENT ON COLUMN notes.document_annotation_id IS 'Optional link to annotation';
COMMENT ON COLUMN notes.created_at IS 'Creation timestamp';
COMMENT ON COLUMN notes.updated_at IS 'Last update timestamp';
COMMENT ON COLUMN notes.is_deleted IS 'Soft delete flag';
