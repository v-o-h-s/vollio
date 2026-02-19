-- Create a specific migration to lock down the 'documents' bucket settings
-- This ensures that even with a signed upload URL, Supabase will reject 
-- files that exceed the size limit or have the wrong MIME type.

UPDATE storage.buckets
SET allowed_mime_types = ARRAY['application/pdf'],
    file_size_limit = 26214400 -- 25MB in bytes
WHERE id = 'documents';
