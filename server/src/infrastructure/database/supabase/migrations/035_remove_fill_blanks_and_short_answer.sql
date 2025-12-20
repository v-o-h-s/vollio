-- Migration: Remove Fill in the Blanks and Short Answer components
-- Date: 2025-12-20

-- Drop the sub-tables
DROP TABLE IF EXISTS fill_blanks_answers CASCADE;
DROP TABLE IF EXISTS short_answer_meta CASCADE;

-- Note: We generally don't remove values from existing ENUMs in Postgres without recreating the type, 
-- which can be complex if many tables use it. However, since we've dropped the references and updated the code,
-- the 'fill_blanks' and 'short_answer' values in 'question_type_enum' will simply be unused.

-- If we really want to clean up the enum:
-- 1. Create a new enum type
-- 2. Update columns using it
-- 3. Drop old enum type

DO $$
BEGIN
    -- Create new type without the values we want to remove
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'question_type_enum_new') THEN
        CREATE TYPE question_type_enum_new AS ENUM ('mcq', 'true_false');
    END IF;

    -- Update quiz_questions table to use the new type
    -- (Assuming 'fill_blanks' and 'short_answer' entries have been deleted or we don't care about них)
    -- First, delete any existing questions of those types just in case
    DELETE FROM quiz_questions WHERE type NOT IN ('mcq', 'true_false');

    ALTER TABLE quiz_questions 
        ALTER COLUMN type TYPE question_type_enum_new 
        USING type::text::question_type_enum_new;

    -- Drop the old type and rename the new one
    DROP TYPE question_type_enum;
    ALTER TYPE question_type_enum_new RENAME TO question_type_enum;
END$$;
