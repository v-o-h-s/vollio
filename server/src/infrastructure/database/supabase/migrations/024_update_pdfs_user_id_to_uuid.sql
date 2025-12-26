-- Migration: Update documents table user_id to UUID and update RLS policies for Supabase Auth
-- This migration assumes you're migrating from Clerk to Supabase Auth

-- Step 1: Drop existing RLS policies
DROP POLICY IF EXISTS "Users can only view their own Documents" ON documents;
DROP POLICY IF EXISTS "Users can only create their own Documents" ON documents;
DROP POLICY IF EXISTS "Users can only update their own Documents" ON documents;
DROP POLICY IF EXISTS "Users can only delete their own Documents" ON documents;



-- Step 4: Drop old check constraint if it exists
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_user_id_check;

-- Step 5: Create new RLS policies using Supabase Auth
-- Users can only SELECT their own Documents
CREATE POLICY "Users can view their own Documents"
  ON documents
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only INSERT Documents with their own user_id
CREATE POLICY "Users can insert their own Documents"
  ON documents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only UPDATE their own Documents
CREATE POLICY "Users can update their own Documents"
  ON documents
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only DELETE their own Documents
CREATE POLICY "Users can delete their own Documents"
  ON documents
  FOR DELETE
  USING (auth.uid() = user_id);


