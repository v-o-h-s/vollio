-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to extract Clerk user ID from JWT
CREATE OR REPLACE FUNCTION requesting_user_id()
RETURNS TEXT
LANGUAGE SQL
STABLE
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    (current_setting('request.jwt.claims', true)::json->>'user_metadata')::json->>'user_id'
  )::text;
$$;

-- PDFs table
CREATE TABLE pdfs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Clerk user ID
  filename TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  storage_path TEXT NOT NULL, -- Path in Supabase Storage
  mime_type TEXT NOT NULL DEFAULT 'application/pdf',
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT pdfs_user_id_check CHECK (char_length(user_id) > 0),
  CONSTRAINT pdfs_filename_check CHECK (char_length(filename) > 0),
  CONSTRAINT pdfs_file_size_check CHECK (file_size > 0)
);

-- User Activity table
CREATE TABLE user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Clerk user ID
  pdf_id UUID NOT NULL REFERENCES pdfs(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL DEFAULT 'view',
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT user_activity_user_id_check CHECK (char_length(user_id) > 0),
  CONSTRAINT user_activity_type_check CHECK (activity_type IN ('view', 'upload', 'delete'))
);

-- Enable Row Level Security
ALTER TABLE pdfs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- RLS Policies for PDFs table
CREATE POLICY "Users can only access their own PDFs" ON pdfs
  FOR ALL USING (user_id = requesting_user_id());

-- RLS Policies for User Activity table
CREATE POLICY "Users can only access their own activity" ON user_activity
  FOR ALL USING (user_id = requesting_user_id());

-- Indexes for performance
CREATE INDEX idx_pdfs_user_id ON pdfs(user_id);
CREATE INDEX idx_pdfs_uploaded_at ON pdfs(uploaded_at DESC);

CREATE INDEX idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX idx_user_activity_accessed_at ON user_activity(accessed_at DESC);
CREATE INDEX idx_user_activity_pdf_id ON user_activity(pdf_id);

-- Update trigger for pdfs table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pdfs_updated_at BEFORE UPDATE ON pdfs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();