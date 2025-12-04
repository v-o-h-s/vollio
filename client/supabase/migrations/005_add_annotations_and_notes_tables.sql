-- Migration: Add annotations and notes tables
-- This adds the missing annotations table and the new notes table for the Notion-like editor

-- Annotations table (was missing from previous migrations)
CREATE TABLE annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Clerk user ID
  pdf_id UUID NOT NULL REFERENCES pdfs(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  selected_text TEXT NOT NULL,
  note_content TEXT NOT NULL,
  coordinates JSONB NOT NULL, -- {x, y, width, height}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT annotations_user_id_check CHECK (char_length(user_id) > 0),
  CONSTRAINT annotations_page_number_check CHECK (page_number > 0),
  CONSTRAINT annotations_selected_text_check CHECK (char_length(selected_text) > 0),
  CONSTRAINT annotations_coordinates_check CHECK (
    coordinates ? 'x' AND 
    coordinates ? 'y' AND 
    coordinates ? 'width' AND 
    coordinates ? 'height'
  )
);

-- Notes table for the Notion-like editor
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Clerk user ID
  title TEXT NOT NULL DEFAULT 'Untitled',
  content JSONB NOT NULL DEFAULT '{"type":"doc","content":[{"type":"paragraph"}]}', -- TipTap JSONContent format
  pdf_annotation_id UUID REFERENCES annotations(id) ON DELETE SET NULL, -- Optional link to annotation
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE,

  CONSTRAINT notes_user_id_check CHECK (char_length(user_id) > 0),
  CONSTRAINT notes_title_check CHECK (char_length(title) > 0),
  CONSTRAINT notes_content_check CHECK (content ? 'type')
);

-- Enable Row Level Security
ALTER TABLE annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Annotations table - Granular CRUD operations
-- Users can only SELECT their own annotations
CREATE POLICY "Users can only view their own annotations" ON annotations
  FOR SELECT USING (user_id = requesting_user_id());

-- Users can only INSERT annotations with their own user_id
CREATE POLICY "Users can only create their own annotations" ON annotations
  FOR INSERT WITH CHECK (user_id = requesting_user_id());

-- Users can only UPDATE their own annotations
CREATE POLICY "Users can only update their own annotations" ON annotations
  FOR UPDATE USING (user_id = requesting_user_id())
  WITH CHECK (user_id = requesting_user_id());

-- Users can only DELETE their own annotations
CREATE POLICY "Users can only delete their own annotations" ON annotations
  FOR DELETE USING (user_id = requesting_user_id());

-- RLS Policies for Notes table - Granular CRUD operations
-- Users can only SELECT their own notes
CREATE POLICY "Users can only view their own notes" ON notes
  FOR SELECT USING (user_id = requesting_user_id());

-- Users can only INSERT notes with their own user_id
CREATE POLICY "Users can only create their own notes" ON notes
  FOR INSERT WITH CHECK (user_id = requesting_user_id());

-- Users can only UPDATE their own notes
CREATE POLICY "Users can only update their own notes" ON notes
  FOR UPDATE USING (user_id = requesting_user_id())
  WITH CHECK (user_id = requesting_user_id());

-- Users can only DELETE their own notes
CREATE POLICY "Users can only delete their own notes" ON notes
  FOR DELETE USING (user_id = requesting_user_id());

-- Indexes for performance
CREATE INDEX idx_annotations_user_id ON annotations(user_id);
CREATE INDEX idx_annotations_pdf_id ON annotations(pdf_id);
CREATE INDEX idx_annotations_page_number ON annotations(page_number);
CREATE INDEX idx_annotations_created_at ON annotations(created_at DESC);

CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_pdf_annotation_id ON notes(pdf_annotation_id);
CREATE INDEX idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX idx_notes_updated_at ON notes(updated_at DESC);
CREATE INDEX idx_notes_is_deleted ON notes(is_deleted) WHERE is_deleted = FALSE;

-- Update triggers for both tables
CREATE TRIGGER update_annotations_updated_at BEFORE UPDATE ON annotations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();