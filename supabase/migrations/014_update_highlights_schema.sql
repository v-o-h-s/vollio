-- Migration: Create highlights table
-- Date: November 29, 2025
-- Description: PDF highlights (text or area) with optional notes. Stores position and content in JSONB format.

-- Drop existing table if it exists
DROP TABLE IF EXISTS highlights CASCADE;

CREATE TABLE highlights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL, -- Clerk user ID
    pdf_id UUID NOT NULL REFERENCES pdfs(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL DEFAULT 'text' 
        CHECK (type IN ('text', 'area')),
    content JSONB DEFAULT '{}'::jsonb,
    position JSONB NOT NULL,
    color VARCHAR(7), -- optional hex code, no default
    has_note BOOLEAN NOT NULL DEFAULT false,
    note_id UUID REFERENCES notes(id) ON DELETE SET NULL, -- optional reference to notes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Constraints
    CONSTRAINT highlights_user_id_check CHECK (char_length(user_id) > 0),
    CONSTRAINT highlights_content_is_object CHECK (jsonb_typeof(content) = 'object'),
    CONSTRAINT highlights_position_is_object CHECK (jsonb_typeof(position) = 'object'),
    CONSTRAINT highlights_position_has_bounding_rect CHECK (position ? 'boundingRect'),
    CONSTRAINT highlights_position_has_rects CHECK (position ? 'rects')
);

-- Indexes
CREATE INDEX idx_highlights_pdf_id ON highlights(pdf_id);
CREATE INDEX idx_highlights_type ON highlights(type);
CREATE INDEX idx_highlights_has_note ON highlights(has_note);
CREATE INDEX idx_highlights_note_id ON highlights(note_id);
CREATE INDEX idx_highlights_content ON highlights USING GIN (content);
CREATE INDEX idx_highlights_position ON highlights USING GIN (position);

-- Comments
COMMENT ON TABLE highlights IS 'PDF highlights (text or area) with optional notes. Stores position data and content in JSONB format.';
COMMENT ON COLUMN highlights.id IS 'Unique identifier for the highlight';
COMMENT ON COLUMN highlights.pdf_id IS 'Which PDF this highlight belongs to';
COMMENT ON COLUMN highlights.type IS 'Type of highlight: "text" (text selection) or "area" (rectangular area)';
COMMENT ON COLUMN highlights.content IS 'JSONB object containing highlight content: { text?: string, image?: string }';
COMMENT ON COLUMN highlights.position IS 'JSONB object containing ScaledPosition structure: { boundingRect: {...}, rects: [...], usePdfCoordinates?: boolean }';
COMMENT ON COLUMN highlights.color IS 'Optional hex color code for the highlight (e.g., #FFFF00)';
COMMENT ON COLUMN highlights.has_note IS 'True if a note is attached to this highlight';
COMMENT ON COLUMN highlights.note_id IS 'Optional reference to the note associated with this highlight';
COMMENT ON COLUMN highlights.created_at IS 'Creation date';
COMMENT ON COLUMN highlights.updated_at IS 'Last update';
