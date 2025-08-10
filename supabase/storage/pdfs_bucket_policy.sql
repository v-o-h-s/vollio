-- Create the PDFs storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('pdfs', 'pdfs', false);

-- Storage policies for the PDFs bucket
-- Allow authenticated users to upload files to their own folder
CREATE POLICY "Users can upload PDFs to their own folder" ON storage.objects
  FOR INSERT WITH CHECK (
    -- It’s going into the pdfs bucket
    bucket_id = 'pdfs' AND 
   -- The first folder in the path matches their own user ID
    auth.uid()::text = (storage.foldername(name))[1] AND 
    -- The file ends with .pdf"
    (storage.extension(name)) = 'pdf'  
  );

-- Allow users to view their own PDFs
CREATE POLICY "Users can view their own PDFs" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'pdfs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own PDFs
CREATE POLICY "Users can delete their own PDFs" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'pdfs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to update their own PDFs (for metadata updates)
CREATE POLICY "Users can update their own PDFs" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'pdfs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );