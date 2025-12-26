-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to extract Clerk user ID from JWT
CREATE OR REPLACE FUNCTION requesting_user_id()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    (current_setting('request.jwt.claims', true)::json->>'user_metadata')::json->>'user_id'
  )::text;
$$;

-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Clerk user ID
  documentname TEXT NOT NULL,
  document_size BIGINT NOT NULL,
  storage_path TEXT NOT NULL, -- Path in Supabase Storage
  mime_type TEXT NOT NULL DEFAULT 'application/pdf',
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT documents_user_id_check CHECK (char_length(user_id) > 0),
  CONSTRAINT documents_documentname_check CHECK (char_length(documentname) > 0),
  CONSTRAINT documents_document_size_check CHECK (document_size > 0)
);

-- User Activity table
CREATE TABLE user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Clerk user ID
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL DEFAULT 'view',
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT user_activity_user_id_check CHECK (char_length(user_id) > 0),
  CONSTRAINT user_activity_type_check CHECK (activity_type IN ('view', 'upload', 'delete'))
);

-- Enable Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Documents table - Granular CRUD operations
-- Users can only SELECT their own Documents
CREATE POLICY "Users can only view their own Documents" ON documents
  FOR SELECT USING (user_id = requesting_user_id());

-- Users can only INSERT Documents with their own user_id
CREATE POLICY "Users can only create their own Documents" ON documents
  FOR INSERT WITH CHECK (user_id = requesting_user_id());

-- Users can only UPDATE their own Documents
CREATE POLICY "Users can only update their own Documents" ON documents
  FOR UPDATE USING (user_id = requesting_user_id())
  WITH CHECK (user_id = requesting_user_id());

-- Users can only DELETE their own Documents
CREATE POLICY "Users can only delete their own Documents" ON documents
  FOR DELETE USING (user_id = requesting_user_id());

-- RLS Policies for User Activity table - Granular CRUD operations
-- Users can only SELECT their own activity
CREATE POLICY "Users can only view their own activity" ON user_activity
  FOR SELECT USING (user_id = requesting_user_id());

-- Users can only INSERT activity with their own user_id
CREATE POLICY "Users can only create their own activity" ON user_activity
  FOR INSERT WITH CHECK (user_id = requesting_user_id());

-- Users can only UPDATE their own activity
CREATE POLICY "Users can only update their own activity" ON user_activity
  FOR UPDATE USING (user_id = requesting_user_id())
  WITH CHECK (user_id = requesting_user_id());

-- Users can only DELETE their own activity
CREATE POLICY "Users can only delete their own activity" ON user_activity
  FOR DELETE USING (user_id = requesting_user_id());

-- Indexes for performance
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_uploaded_at ON documents(uploaded_at DESC);

CREATE INDEX idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX idx_user_activity_accessed_at ON user_activity(accessed_at DESC);
CREATE INDEX idx_user_activity_document_id ON user_activity(document_id);

-- Update trigger for documents table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();