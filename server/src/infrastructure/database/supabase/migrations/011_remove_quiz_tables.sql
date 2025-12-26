-- Remove quiz-related tables and functionality
-- This migration removes all quiz-related database structures

-- Drop quiz tables in correct order (respecting foreign key constraints)
DROP TABLE IF EXISTS quiz_attempts CASCADE;
DROP TABLE IF EXISTS quiz_questions CASCADE;
DROP TABLE IF EXISTS quizzes CASCADE;

-- Drop any quiz-related indexes
DROP INDEX IF EXISTS idx_quizzes_user_id;
DROP INDEX IF EXISTS idx_quizzes_created_at;
DROP INDEX IF EXISTS idx_quiz_questions_quiz_id;
DROP INDEX IF EXISTS idx_quiz_questions_type;
DROP INDEX IF EXISTS idx_quiz_attempts_user_id;
DROP INDEX IF EXISTS idx_quiz_attempts_quiz_id;
DROP INDEX IF EXISTS idx_quiz_attempts_created_at;

-- Drop any quiz-related functions
DROP FUNCTION IF EXISTS calculate_quiz_score(uuid);
DROP FUNCTION IF EXISTS get_quiz_statistics(uuid);

-- Drop any quiz-related triggers
DROP TRIGGER IF EXISTS update_quiz_updated_at ON quizzes;
DROP TRIGGER IF EXISTS update_quiz_attempt_updated_at ON quiz_attempts;

-- Remove quiz-related RLS policies (they should be dropped automatically with tables)
-- But we'll be explicit for clarity

-- Clean up any quiz-related storage buckets (if any)
-- Note: This would need to be done manually in Supabase dashboard if there were quiz-related documents

-- Remove quiz-related document processing columns if they exist
-- (These might have been added for RAG functionality)
DO $$ 
BEGIN
    -- Check if columns exist before trying to drop them
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'documents' AND column_name = 'quiz_processed') THEN
        ALTER TABLE documents DROP COLUMN quiz_processed;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'documents' AND column_name = 'quiz_chunks_count') THEN
        ALTER TABLE documents DROP COLUMN quiz_chunks_count;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'document_chunks' AND column_name = 'quiz_suitable') THEN
        ALTER TABLE document_chunks DROP COLUMN quiz_suitable;
    END IF;
END $$;

-- Update chunk usage types to remove quiz_generation
UPDATE document_chunks 
SET metadata = metadata - 'quiz_generation'
WHERE metadata ? 'quiz_generation';

-- Clean up any quiz-related user activity records
DELETE FROM user_activities 
WHERE activity_type IN ('quiz_created', 'quiz_attempted', 'quiz_completed');

-- Add a comment to track this cleanup
COMMENT ON SCHEMA public IS 'Quiz functionality removed in migration 011_remove_quiz_tables.sql';