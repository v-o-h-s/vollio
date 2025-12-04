-- Migration: Update pdfs table user_id to UUID and update RLS policies for Supabase Auth
-- This migration assumes you're migrating from Clerk to Supabase Auth

-- Step 1: Drop existing RLS policies
DROP POLICY IF EXISTS "Users can only view their own PDFs" ON pdfs;
DROP POLICY IF EXISTS "Users can only create their own PDFs" ON pdfs;
DROP POLICY IF EXISTS "Users can only update their own PDFs" ON pdfs;
DROP POLICY IF EXISTS "Users can only delete their own PDFs" ON pdfs;



-- Step 4: Drop old check constraint if it exists
ALTER TABLE pdfs DROP CONSTRAINT IF EXISTS pdfs_user_id_check;

-- Step 5: Create new RLS policies using Supabase Auth
-- Users can only SELECT their own PDFs
CREATE POLICY "Users can view their own PDFs"
  ON pdfs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only INSERT PDFs with their own user_id
CREATE POLICY "Users can insert their own PDFs"
  ON pdfs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only UPDATE their own PDFs
CREATE POLICY "Users can update their own PDFs"
  ON pdfs
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only DELETE their own PDFs
CREATE POLICY "Users can delete their own PDFs"
  ON pdfs
  FOR DELETE
  USING (auth.uid() = user_id);


