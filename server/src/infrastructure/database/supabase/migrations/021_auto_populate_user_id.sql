-- Migration: Auto-populate user_id from auth.uid() using triggers
-- This eliminates the need to manually set user_id in application code
-- Date: 2025-12-03

-- ============================================================================
-- Step 1: Create reusable trigger function
-- ============================================================================

CREATE OR REPLACE FUNCTION public.set_user_id_from_auth()
RETURNS TRIGGER AS $$
BEGIN
  -- Automatically set user_id to the authenticated user's ID
  NEW.user_id = auth.uid()::text;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Step 2: Create triggers for all tables
-- ============================================================================

-- Notes table
DROP TRIGGER IF EXISTS set_notes_user_id ON notes;
CREATE TRIGGER set_notes_user_id
  BEFORE INSERT ON notes
  FOR EACH ROW
  EXECUTE FUNCTION set_user_id_from_auth();

-- Documents table
DROP TRIGGER IF EXISTS set_documents_user_id ON documents;
CREATE TRIGGER set_documents_user_id
  BEFORE INSERT ON documents
  FOR EACH ROW
  EXECUTE FUNCTION set_user_id_from_auth();

-- Highlights table
DROP TRIGGER IF EXISTS set_highlights_user_id ON highlights;
CREATE TRIGGER set_highlights_user_id
  BEFORE INSERT ON highlights
  FOR EACH ROW
  EXECUTE FUNCTION set_user_id_from_auth();

-- Folders table
DROP TRIGGER IF EXISTS set_folders_user_id ON folders;
CREATE TRIGGER set_folders_user_id
  BEFORE INSERT ON folders
  FOR EACH ROW
  EXECUTE FUNCTION set_user_id_from_auth();

-- User activity table
DROP TRIGGER IF EXISTS set_user_activity_user_id ON user_activity;
CREATE TRIGGER set_user_activity_user_id
  BEFORE INSERT ON user_activity
  FOR EACH ROW
  EXECUTE FUNCTION set_user_id_from_auth();

-- OAuth tokens table
DROP TRIGGER IF EXISTS set_oauth_tokens_user_id ON oauth_tokens;
CREATE TRIGGER set_oauth_tokens_user_id
  BEFORE INSERT ON oauth_tokens
  FOR EACH ROW
  EXECUTE FUNCTION set_user_id_from_auth();

-- Summaries table
DROP TRIGGER IF EXISTS set_summaries_user_id ON summaries;
CREATE TRIGGER set_summaries_user_id
  BEFORE INSERT ON summaries
  FOR EACH ROW
  EXECUTE FUNCTION set_user_id_from_auth();

-- ============================================================================
-- Step 3: (Optional) Make user_id columns have default
-- ============================================================================

-- This makes the schema more explicit about auto-population
-- COMMENTED OUT - Only uncomment if you want to modify column defaults

-- ALTER TABLE notes ALTER COLUMN user_id SET DEFAULT auth.uid()::text;
-- ALTER TABLE documents ALTER COLUMN user_id SET DEFAULT auth.uid()::text;
-- ALTER TABLE highlights ALTER COLUMN user_id SET DEFAULT auth.uid()::text;
-- ALTER TABLE folders ALTER COLUMN user_id SET DEFAULT auth.uid()::text;
-- ALTER TABLE user_activity ALTER COLUMN user_id SET DEFAULT auth.uid()::text;
-- ALTER TABLE oauth_tokens ALTER COLUMN user_id SET DEFAULT auth.uid()::text;
-- ALTER TABLE summaries ALTER COLUMN user_id SET DEFAULT auth.uid()::text;

-- ============================================================================
-- Verification
-- ============================================================================

-- Check that triggers are created
-- SELECT trigger_name, event_object_table, action_statement 
-- FROM information_schema.triggers 
-- WHERE trigger_schema = 'public' 
-- AND trigger_name LIKE 'set_%_user_id';
