-- Migration: Add TTL cleanup job and index for embeddings
-- Date: December 15, 2025
-- Description: Ensure index on created_at for embeddings and schedule a cron job to periodically delete rows older than 14 hours (deletes in batches to avoid long transactions)

-- 1️⃣ Make sure pgvector and pg_cron extensions exist (pgvector should already be enabled earlier)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2️⃣ Ensure index on created_at for fast lookups and deletions
CREATE INDEX IF NOT EXISTS idx_embeddings_created_at ON embeddings(created_at);

-- 3️⃣ Create batch-delete function to remove old rows in safe chunks
CREATE OR REPLACE FUNCTION cleanup_old_embeddings(batch_size INT DEFAULT 1000)
RETURNS VOID AS $$
DECLARE
    deleted_count INT := 0;
BEGIN
    LOOP
        DELETE FROM embeddings
        WHERE id IN (
            SELECT id FROM embeddings
            WHERE created_at < now() - interval '14 hours'
            ORDER BY created_at
            LIMIT batch_size
        );
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        EXIT WHEN deleted_count = 0;
        -- optional small pause to reduce DB pressure
        PERFORM pg_sleep(0.1);
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4️⃣ Ensure a scheduled job exists to run cleanup hourly
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'embeddings_cleanup') THEN
    PERFORM cron.schedule(
      'embeddings_cleanup',  -- job name
      '0 * * * *',           -- run at minute 0 every hour
      $$SELECT cleanup_old_embeddings(1000);$$
    );
  END IF;
END$$;

-- 5️⃣ Comment for clarity
COMMENT ON FUNCTION cleanup_old_embeddings IS 'Deletes embeddings older than 14 hours in batches. Scheduled by pg_cron as job "embeddings_cleanup".';
