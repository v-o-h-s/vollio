-- Migration: Add Google Classroom integration and update Documents table
-- Date: 2025-12-04
-- Description: Create user_google_classroom table and add google_document_id to documents table

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

-- Update documents table
ALTER TABLE documents ADD COLUMN IF NOT EXISTS google_document_id TEXT;
ALTER TABLE documents ALTER COLUMN storage_path DROP NOT NULL;

-- Comment on table and columns
COMMENT ON TABLE user_google_classroom IS 'Stores Google Classroom connection details for users';
COMMENT ON COLUMN user_google_classroom.user_id IS 'Supabase Auth User ID';
COMMENT ON COLUMN documents.google_document_id IS 'Google Drive Document ID for Classroom integration';
