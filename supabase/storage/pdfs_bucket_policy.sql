  -- Updated storage policies for Clerk authentication
  -- This replaces the previous storage policies to work with Clerk JWT tokens

  -- First, drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can upload PDFs to their own folder" ON storage.objects;
  DROP POLICY IF EXISTS "Users can view their own PDFs" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own PDFs" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own PDFs" ON storage.objects;

  -- Create function to extract Clerk user ID for storage operations
  CREATE OR REPLACE FUNCTION storage_requesting_user_id()
  RETURNS TEXT
  LANGUAGE SQL
  STABLE
  AS $
    SELECT COALESCE(
      current_setting('request.jwt.claims', true)::json->>'sub',
      (current_setting('request.jwt.claims', true)::json->>'user_metadata')::json->>'user_id'
    )::text;
  $;

  -- Storage policies for the PDFs bucket using Clerk authentication
  -- Allow authenticated users to upload files to their own folder
  CREATE POLICY "Users can upload PDFs to their own folder" ON storage.objects
    FOR INSERT WITH CHECK (
      -- It's going into the pdfs bucket
      bucket_id = 'pdfs' AND 
      -- The first folder in the path matches their Clerk user ID
      storage_requesting_user_id() = (storage.foldername(name))[1] AND 
      -- The file ends with .pdf
      (storage.extension(name)) = 'pdf'  
    );

  -- Allow users to view their own PDFs
  CREATE POLICY "Users can view their own PDFs" ON storage.objects
    FOR SELECT USING (
      bucket_id = 'pdfs' AND
      storage_requesting_user_id() = (storage.foldername(name))[1]
    );

  -- Allow users to delete their own PDFs
  CREATE POLICY "Users can delete their own PDFs" ON storage.objects
    FOR DELETE USING (
      bucket_id = 'pdfs' AND
      storage_requesting_user_id() = (storage.foldername(name))[1]
    );

  -- Allow users to update their own PDFs (for metadata updates)
  CREATE POLICY "Users can update their own PDFs" ON storage.objects
    FOR UPDATE USING (
      bucket_id = 'pdfs' AND
      storage_requesting_user_id() = (storage.foldername(name))[1]
    );

  -- Test the storage function (optional - for verification)
  -- SELECT storage_requesting_user_id() as current_storage_user_id;