-- Migration: Update highlights table user_id to UUID and add auto-populate trigger for Supabase Auth
-- This migration assumes you're migrating from Clerk to Supabase Auth

-- Step 1: Drop existing RLS policies (if any)
DROP POLICY IF EXISTS highlights_select_policy ON highlights;
DROP POLICY IF EXISTS highlights_insert_policy ON highlights;
DROP POLICY IF EXISTS highlights_update_policy ON highlights;
DROP POLICY IF EXISTS highlights_delete_policy ON highlights;

-- Step 2: Drop the existing highlights table (this will cascade delete all data)
DROP TABLE IF EXISTS highlights CASCADE;

-- Step 3: Recreate highlights table with user_id as UUID
CREATE TABLE highlights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL DEFAULT 'text' 
        CHECK (type IN ('text', 'area')),
    content JSONB DEFAULT '{}'::jsonb,
    position JSONB NOT NULL,
    color VARCHAR(7), -- optional hex code, no default
    has_note BOOLEAN NOT NULL DEFAULT false,
    note_id UUID REFERENCES notes(id) ON DELETE SET NULL, -- optional reference to notes
    tags TEXT[] DEFAULT '{}',
    style VARCHAR(20) DEFAULT 'highlight' 
        CHECK (style IN ('highlight', 'underline', 'tagged')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Constraints
    CONSTRAINT highlights_content_is_object CHECK (jsonb_typeof(content) = 'object'),
    CONSTRAINT highlights_position_is_object CHECK (jsonb_typeof(position) = 'object'),
    CONSTRAINT highlights_position_has_bounding_rect CHECK (position ? 'boundingRect'),
    CONSTRAINT highlights_position_has_rects CHECK (position ? 'rects')
);

-- Step 4: Create indexes for efficient querying
CREATE INDEX idx_highlights_user_id ON highlights(user_id);
CREATE INDEX idx_highlights_document_id ON highlights(document_id);
CREATE INDEX idx_highlights_type ON highlights(type);
CREATE INDEX idx_highlights_has_note ON highlights(has_note);
CREATE INDEX idx_highlights_note_id ON highlights(note_id);
CREATE INDEX idx_highlights_content ON highlights USING GIN (content);
CREATE INDEX idx_highlights_position ON highlights USING GIN (position);
CREATE INDEX idx_highlights_tags ON highlights USING GIN (tags);
CREATE INDEX idx_highlights_style ON highlights(style);

-- Step 5: Create trigger to auto-populate user_id from auth.uid() on INSERT
CREATE OR REPLACE FUNCTION auto_set_user_id_for_highlights()
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

CREATE TRIGGER highlights_set_user_id
    BEFORE INSERT ON highlights
    FOR EACH ROW
    EXECUTE FUNCTION auto_set_user_id_for_highlights();

-- Step 6: Create updated_at trigger
CREATE OR REPLACE FUNCTION update_highlights_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER highlights_updated_at
    BEFORE UPDATE ON highlights
    FOR EACH ROW
    EXECUTE FUNCTION update_highlights_updated_at();

-- Step 7: Enable Row Level Security
ALTER TABLE highlights ENABLE ROW LEVEL SECURITY;

-- Step 8: Create new RLS policies using Supabase Auth
-- Users can only SELECT their own highlights
CREATE POLICY "Users can view their own highlights"
  ON highlights
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only INSERT highlights with their own user_id
CREATE POLICY "Users can insert their own highlights"
  ON highlights
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only UPDATE their own highlights
CREATE POLICY "Users can update their own highlights"
  ON highlights
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only DELETE their own highlights
CREATE POLICY "Users can delete their own highlights"
  ON highlights
  FOR DELETE
  USING (auth.uid() = user_id);

-- Step 9: Add comments
COMMENT ON TABLE highlights IS 'Document highlights (text or area) with optional notes. Stores position data and content in JSONB format.';
COMMENT ON COLUMN highlights.id IS 'Unique identifier for the highlight';
COMMENT ON COLUMN highlights.user_id IS 'Supabase Auth user ID (UUID) - auto-populated from authenticated user';
COMMENT ON COLUMN highlights.document_id IS 'Which Document this highlight belongs to';
COMMENT ON COLUMN highlights.type IS 'Type of highlight: "text" (text selection) or "area" (rectangular area)';
COMMENT ON COLUMN highlights.content IS 'JSONB object containing highlight content: { text?: string, image?: string }';
COMMENT ON COLUMN highlights.position IS 'JSONB object containing ScaledPosition structure: { boundingRect: {...}, rects: [...], usePdfCoordinates?: boolean }';
COMMENT ON COLUMN highlights.color IS 'Optional hex color code for the highlight (e.g., #FFFF00)';
COMMENT ON COLUMN highlights.has_note IS 'True if a note is attached to this highlight';
COMMENT ON COLUMN highlights.note_id IS 'Optional reference to the note associated with this highlight';
COMMENT ON COLUMN highlights.tags IS 'Array of tags for categorizing highlights (e.g., Definition, Example, Important detail, Key idea, To revisit, Step / Process)';
COMMENT ON COLUMN highlights.style IS 'Visual style of the highlight: "highlight" (background), "underline" (underline), or "tagged" (with tag indicator)';
COMMENT ON COLUMN highlights.created_at IS 'Creation date';
COMMENT ON COLUMN highlights.updated_at IS 'Last update';
