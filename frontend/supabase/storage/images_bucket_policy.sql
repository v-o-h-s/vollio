-- Storage policies for the images bucket using Clerk authentication
-- This creates policies for image uploads in the editor

-- Create the images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', false)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload images to their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;

-- Allow authenticated users to upload images to their own folder
CREATE POLICY "Users can upload images to their own folder" ON storage.objects
  FOR INSERT WITH CHECK (
    -- It's going into the images bucket
    bucket_id = 'images' AND 
    -- The first folder in the path matches their Clerk user ID
    storage_requesting_user_id() = (storage.foldername(name))[1] AND 
    -- The file is an allowed image type
    (storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'gif', 'webp')
  );

-- Allow users to view their own images
CREATE POLICY "Users can view their own images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'images' AND
    storage_requesting_user_id() = (storage.foldername(name))[1]
  );

-- Allow users to delete their own images
CREATE POLICY "Users can delete their own images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'images' AND
    storage_requesting_user_id() = (storage.foldername(name))[1]
  );

-- Allow users to update their own images (for metadata updates)
CREATE POLICY "Users can update their own images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'images' AND
    storage_requesting_user_id() = (storage.foldername(name))[1]
  );