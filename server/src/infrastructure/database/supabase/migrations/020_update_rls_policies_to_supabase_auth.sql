-- Migration: Update all RLS policies to use auth.uid() instead of requesting_user_id()
-- This migration updates all tables to use Supabase Auth's native auth.uid() function
-- Date: 2025-12-03

-- ============================================================================
-- Step 1: Drop all existing RLS policies
-- ============================================================================

-- PDFs table policies
DROP POLICY IF EXISTS "Users can only view their own PDFs" ON pdfs;
DROP POLICY IF EXISTS "Users can only create their own PDFs" ON pdfs;
DROP POLICY IF EXISTS "Users can only update their own PDFs" ON pdfs;
DROP POLICY IF EXISTS "Users can only delete their own PDFs" ON pdfs;

-- User activity table policies
DROP POLICY IF EXISTS "Users can only view their own activity" ON user_activity;
DROP POLICY IF EXISTS "Users can only create their own activity" ON user_activity;
DROP POLICY IF EXISTS "Users can only update their own activity" ON user_activity;
DROP POLICY IF EXISTS "Users can only delete their own activity" ON user_activity;

-- Highlights table policies
DROP POLICY IF EXISTS "Users can only view their own highlights" ON highlights;
DROP POLICY IF EXISTS "Users can only create their own highlights" ON highlights;
DROP POLICY IF EXISTS "Users can only update their own highlights" ON highlights;
DROP POLICY IF EXISTS "Users can only delete their own highlights" ON highlights;

-- Notes table policies
DROP POLICY IF EXISTS "Users can only view their own notes" ON notes;
DROP POLICY IF EXISTS "Users can only create their own notes" ON notes;
DROP POLICY IF EXISTS "Users can only update their own notes" ON notes;
DROP POLICY IF EXISTS "Users can only delete their own notes" ON notes;

-- Folders table policies
DROP POLICY IF EXISTS "Users can only view their own folders" ON folders;
DROP POLICY IF EXISTS "Users can only create their own folders" ON folders;
DROP POLICY IF EXISTS "Users can only update their own folders" ON folders;
DROP POLICY IF EXISTS "Users can only delete their own folders" ON folders;

-- OAuth tokens table policies
DROP POLICY IF EXISTS "Users can access their own OAuth tokens" ON oauth_tokens;

-- Summaries table policies
DROP POLICY IF EXISTS "summaries_select_policy" ON summaries;
DROP POLICY IF EXISTS "summaries_insert_policy" ON summaries;
DROP POLICY IF EXISTS "summaries_update_policy" ON summaries;
DROP POLICY IF EXISTS "summaries_delete_policy" ON summaries;

-- ============================================================================
-- Step 2: Create new RLS policies using auth.uid()
-- ============================================================================

-- PDFs table policies
CREATE POLICY "Users can only view their own PDFs" ON pdfs
  FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can only create their own PDFs" ON pdfs
  FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can only update their own PDFs" ON pdfs
  FOR UPDATE
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can only delete their own PDFs" ON pdfs
  FOR DELETE
  USING (user_id = auth.uid()::text);

-- User activity table policies
CREATE POLICY "Users can only view their own activity" ON user_activity
  FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can only create their own activity" ON user_activity
  FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can only update their own activity" ON user_activity
  FOR UPDATE
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can only delete their own activity" ON user_activity
  FOR DELETE
  USING (user_id = auth.uid()::text);

-- Highlights table policies
CREATE POLICY "Users can only view their own highlights" ON highlights
  FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can only create their own highlights" ON highlights
  FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can only update their own highlights" ON highlights
  FOR UPDATE
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can only delete their own highlights" ON highlights
  FOR DELETE
  USING (user_id = auth.uid()::text);

-- Notes table policies
CREATE POLICY "Users can only view their own notes" ON notes
  FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can only create their own notes" ON notes
  FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can only update their own notes" ON notes
  FOR UPDATE
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can only delete their own notes" ON notes
  FOR DELETE
  USING (user_id = auth.uid()::text);

-- Folders table policies
CREATE POLICY "Users can only view their own folders" ON folders
  FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can only create their own folders" ON folders
  FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can only update their own folders" ON folders
  FOR UPDATE
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can only delete their own folders" ON folders
  FOR DELETE
  USING (user_id = auth.uid()::text);

-- OAuth tokens table policies
CREATE POLICY "Users can access their own OAuth tokens" ON oauth_tokens
  FOR ALL
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

-- Summaries table policies
CREATE POLICY "summaries_select_policy" ON summaries
  FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "summaries_insert_policy" ON summaries
  FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "summaries_update_policy" ON summaries
  FOR UPDATE
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "summaries_delete_policy" ON summaries
  FOR DELETE
  USING (user_id = auth.uid()::text);

-- ============================================================================
-- Step 3: Drop old Clerk-specific functions (optional)
-- ============================================================================

-- Uncomment these if you want to completely remove Clerk functions
-- DROP FUNCTION IF EXISTS requesting_user_id();
-- DROP FUNCTION IF EXISTS get_jwt_claims();

-- ============================================================================
-- Verification queries
-- ============================================================================

-- Run these to verify policies are correctly created:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE schemaname = 'public' 
-- ORDER BY tablename, policyname;
