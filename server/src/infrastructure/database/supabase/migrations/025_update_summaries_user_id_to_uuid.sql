-- Migration: Update summaries table user_id to UUID and update RLS policies for Supabase Auth
-- This migration assumes you're migrating from Clerk to Supabase Auth

-- Step 1: Drop existing RLS policies
DROP POLICY IF EXISTS summaries_select_policy ON summaries;
DROP POLICY IF EXISTS summaries_insert_policy ON summaries;
DROP POLICY IF EXISTS summaries_update_policy ON summaries;
DROP POLICY IF EXISTS summaries_delete_policy ON summaries;

-- Step 2: Drop the existing summaries table (this will cascade delete all data)
DROP TABLE IF EXISTS summaries CASCADE;

-- Step 3: Recreate summaries table with user_id as UUID
CREATE TABLE summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    main_points TEXT[] DEFAULT '{}',
    attributes JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Ensure one summary per user per Document
    CONSTRAINT unique_user_document_summary UNIQUE (user_id, document_id)
);

-- Step 4: Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_summaries_user_id ON summaries(user_id);
CREATE INDEX IF NOT EXISTS idx_summaries_document_id ON summaries(document_id);
CREATE INDEX IF NOT EXISTS idx_summaries_main_points ON summaries USING GIN (main_points);

-- Step 5: Create updated_at trigger
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

-- Step 6: Enable Row Level Security
ALTER TABLE summaries ENABLE ROW LEVEL SECURITY;

-- Step 7: Create new RLS policies using Supabase Auth
-- Users can only SELECT their own summaries
CREATE POLICY "Users can view their own summaries"
  ON summaries
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only INSERT summaries with their own user_id
CREATE POLICY "Users can insert their own summaries"
  ON summaries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only UPDATE their own summaries
CREATE POLICY "Users can update their own summaries"
  ON summaries
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only DELETE their own summaries
CREATE POLICY "Users can delete their own summaries"
  ON summaries
  FOR DELETE
  USING (auth.uid() = user_id);

-- Step 8: Add comments
COMMENT ON TABLE summaries IS 'Stores user summaries with main points collected from Documents';
COMMENT ON COLUMN summaries.user_id IS 'Supabase Auth user ID (UUID)';
COMMENT ON COLUMN summaries.document_id IS 'Reference to the Document';
COMMENT ON COLUMN summaries.main_points IS 'Array of text snippets collected as main points';
COMMENT ON COLUMN summaries.attributes IS 'Flexible JSONB field for additional metadata';
