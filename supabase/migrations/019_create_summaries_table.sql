-- Migration: Create summaries table
-- Date: December 2, 2025
-- Description: Create summaries table to store main points collected from PDFs without creating highlights

-- Create summaries table
CREATE TABLE IF NOT EXISTS summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    pdf_id UUID NOT NULL REFERENCES pdfs(id) ON DELETE CASCADE,
    main_points TEXT[] DEFAULT '{}',
    attributes JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Ensure one summary per user per PDF
    CONSTRAINT unique_user_pdf_summary UNIQUE (user_id, pdf_id)
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_summaries_user_id ON summaries(user_id);
CREATE INDEX IF NOT EXISTS idx_summaries_pdf_id ON summaries(pdf_id);
CREATE INDEX IF NOT EXISTS idx_summaries_main_points ON summaries USING GIN (main_points);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_summaries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER summaries_updated_at
    BEFORE UPDATE ON summaries
    FOR EACH ROW
    EXECUTE FUNCTION update_summaries_updated_at();

-- Enable Row Level Security
ALTER TABLE summaries ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own summaries
CREATE POLICY summaries_select_policy ON summaries
    FOR SELECT
    USING (auth.jwt() ->> 'sub' = user_id);

-- RLS Policy: Users can only insert their own summaries
CREATE POLICY summaries_insert_policy ON summaries
    FOR INSERT
    WITH CHECK (auth.jwt() ->> 'sub' = user_id);

-- RLS Policy: Users can only update their own summaries
CREATE POLICY summaries_update_policy ON summaries
    FOR UPDATE
    USING (auth.jwt() ->> 'sub' = user_id);

-- RLS Policy: Users can only delete their own summaries
CREATE POLICY summaries_delete_policy ON summaries
    FOR DELETE
    USING (auth.jwt() ->> 'sub' = user_id);

-- Comments
COMMENT ON TABLE summaries IS 'Stores user summaries with main points collected from PDFs';
COMMENT ON COLUMN summaries.user_id IS 'Clerk user ID';
COMMENT ON COLUMN summaries.pdf_id IS 'Reference to the PDF';
COMMENT ON COLUMN summaries.main_points IS 'Array of text snippets collected as main points';
COMMENT ON COLUMN summaries.attributes IS 'Flexible JSONB field for additional metadata';
