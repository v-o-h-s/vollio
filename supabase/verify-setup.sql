-- Verification script for Supabase setup
-- Run this in Supabase SQL editor to verify everything is set up correctly

-- Check if tables exist
SELECT 
  schemaname,
  tablename,
  tableowner,
  hasindexes,
  hasrules,
  hastriggers
FROM pg_tables 
WHERE tablename IN ('pdfs', 'user_activity');

-- Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('pdfs', 'user_activity');

-- Check if policies exist
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('pdfs', 'user_activity');

-- Check if function exists
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_name = 'requesting_user_id';

-- Check if indexes exist
SELECT 
  indexname,
  tablename,
  indexdef
FROM pg_indexes 
WHERE tablename IN ('pdfs', 'user_activity');

-- Check storage bucket
SELECT 
  id,
  name,
  public
FROM storage.buckets 
WHERE name = 'pdfs';

-- Check storage policies
SELECT 
  policyname,
  definition
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';