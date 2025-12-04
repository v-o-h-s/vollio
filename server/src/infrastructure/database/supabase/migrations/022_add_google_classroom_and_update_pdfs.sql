-- Migration: Add Google Classroom integration and update PDFs table
-- Date: 2025-12-04
-- Description: Create user_google_classroom table and add google_file_id to pdfs table

-- Create user_google_classroom table
CREATE TABLE IF NOT EXISTS user_google_classroom (
  user_id TEXT PRIMARY KEY,
  google_email TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expiry TIMESTAMP WITH TIME ZONE,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for user_google_classroom
ALTER TABLE user_google_classroom ENABLE ROW LEVEL SECURITY;

-- Create policies for user_google_classroom
CREATE POLICY "Users can view their own google classroom connection"
  ON user_google_classroom FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert their own google classroom connection"
  ON user_google_classroom FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own google classroom connection"
  ON user_google_classroom FOR UPDATE
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can delete their own google classroom connection"
  ON user_google_classroom FOR DELETE
  USING (user_id = auth.uid()::text);

-- Update pdfs table
ALTER TABLE pdfs ADD COLUMN IF NOT EXISTS google_file_id TEXT;
ALTER TABLE pdfs ALTER COLUMN storage_path DROP NOT NULL;

-- Comment on table and columns
COMMENT ON TABLE user_google_classroom IS 'Stores Google Classroom connection details for users';
COMMENT ON COLUMN user_google_classroom.user_id IS 'Supabase Auth User ID';
COMMENT ON COLUMN pdfs.google_file_id IS 'Google Drive File ID for Classroom integration';
