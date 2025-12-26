-- Migration: Replace annotations table with highlights table
-- Date: September 13, 2025
-- Description: Replace the annotations table with a more focused highlights table
-- that better matches the Document annotation workflow requirements

-- Drop the existing annotations table (will cascade to remove dependent objects)
DROP TABLE IF EXISTS annotations CASCADE;

-- Create the new highlights table with optimized schema
CREATE TABLE highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Clerk user ID
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE, -- Link to associated note
  
  -- Highlight content and metadata
  content TEXT NOT NULL, -- The selected text content that was highlighted
  title TEXT, -- Optional title for the highlight (can be note title or custom)
  
  -- Visual styling
  color VARCHAR(7) NOT NULL DEFAULT '#FFFF00', -- Hex color code for highlight
  opacity DECIMAL(3,2) NOT NULL DEFAULT 0.4 CHECK (opacity >= 0.1 AND opacity <= 1.0),
  
  -- Document positioning data
  page_number INTEGER NOT NULL CHECK (page_number > 0),
  textbounds JSONB NOT NULL, -- Array of TextBounds objects for accurate highlighting [{x, y, width, height}, ...]
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT highlights_user_id_check CHECK (char_length(user_id) > 0),
  CONSTRAINT highlights_content_check CHECK (char_length(content) > 0),
  CONSTRAINT highlights_color_check CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
  CONSTRAINT highlights_textbounds_check CHECK (jsonb_typeof(textbounds) = 'array')
);

-- Enable Row Level Security
ALTER TABLE highlights ENABLE ROW LEVEL SECURITY;

-- RLS Policies for highlights table - Users can only access their own highlights
CREATE POLICY "Users can only view their own highlights" ON highlights
  FOR SELECT USING (user_id = requesting_user_id());

CREATE POLICY "Users can only create their own highlights" ON highlights
  FOR INSERT WITH CHECK (user_id = requesting_user_id());

CREATE POLICY "Users can only update their own highlights" ON highlights
  FOR UPDATE USING (user_id = requesting_user_id())
  WITH CHECK (user_id = requesting_user_id());

CREATE POLICY "Users can only delete their own highlights" ON highlights
  FOR DELETE USING (user_id = requesting_user_id());

-- Performance indexes
CREATE INDEX idx_highlights_user_id ON highlights(user_id);
CREATE INDEX idx_highlights_document_id ON highlights(document_id);
CREATE INDEX idx_highlights_note_id ON highlights(note_id);
CREATE INDEX idx_highlights_page_number ON highlights(page_number);
CREATE INDEX idx_highlights_created_at ON highlights(created_at DESC);
CREATE INDEX idx_highlights_color ON highlights(color); -- For filtering by color
CREATE INDEX idx_highlights_textbounds ON highlights USING GIN (textbounds); -- For spatial queries

-- Update trigger
CREATE TRIGGER update_highlights_updated_at BEFORE UPDATE ON highlights
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add table and column comments for documentation
COMMENT ON TABLE highlights IS 'Document text highlights linked to notes. Each highlight represents a visually marked text selection in a Document that can be linked to a note.';
COMMENT ON COLUMN highlights.content IS 'The actual text content that was selected and highlighted in the Document';
COMMENT ON COLUMN highlights.title IS 'Optional title for the highlight, often derived from the linked note title';
COMMENT ON COLUMN highlights.color IS 'Hex color code for the highlight appearance (e.g., #FFFF00 for yellow)';
COMMENT ON COLUMN highlights.opacity IS 'Opacity level for the highlight (0.1 to 1.0)';
COMMENT ON COLUMN highlights.textbounds IS 'Array of TextBounds objects for accurate multi-line highlighting: [{x, y, width, height}, ...]';
COMMENT ON COLUMN highlights.note_id IS 'Optional reference to the note associated with this highlight';
