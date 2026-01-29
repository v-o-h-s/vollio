-- Migration: Cleanup Google Classroom Storage
-- Description: Schedule a daily cron job to delete Supabase storage files for Google Classroom documents older than 24 hours.

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create function to perform the cleanup
CREATE OR REPLACE FUNCTION cleanup_google_classroom_storage()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    r RECORD;
    v_deleted_count INTEGER := 0;
BEGIN
    -- Iterate over documents that satisfy the conditions:
    -- 1. From Google Classroom (google_document_id IS NOT NULL)
    -- 2. Has storage path (storage_path IS NOT NULL)
    -- 3. Older than 24 hours (uploaded_at < NOW() - INTERVAL '24 hours')
    FOR r IN
        SELECT id, storage_path
        FROM public.documents
        WHERE google_document_id IS NOT NULL
        AND storage_path IS NOT NULL
        AND uploaded_at < (NOW() - INTERVAL '24 hours')
    LOOP
        -- 1. Delete the file from Supabase storage (storage.objects table)
        -- The storage_path stores the path/name of the file in the bucket.
        -- We assume 'documents' bucket based on StorageService configuration.
        DELETE FROM storage.objects
        WHERE bucket_id = 'documents'
        AND name = r.storage_path;

        -- 2. Update the document to remove the storage_path reference
        UPDATE public.documents
        SET storage_path = NULL,
            updated_at = NOW()
        WHERE id = r.id;
        
        v_deleted_count := v_deleted_count + 1;
    END LOOP;

    -- Raise notice for logs
    IF v_deleted_count > 0 THEN
        RAISE NOTICE 'Cleaned up storage for % Google Classroom documents.', v_deleted_count;
    END IF;
END;
$$;

-- Schedule the cron job to run every day at midnight (UTC)
SELECT cron.schedule(
    'cleanup-google-classroom-storage', -- unique job name
    '0 0 * * *',                        -- daily at 00:00
    $$SELECT cleanup_google_classroom_storage();$$
);

-- Comment on function
COMMENT ON FUNCTION cleanup_google_classroom_storage IS 'Deletes storage files for Google Classroom documents older than 24 hours and updates the record.';
