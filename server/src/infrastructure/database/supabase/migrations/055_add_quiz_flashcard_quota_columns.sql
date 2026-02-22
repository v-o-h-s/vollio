-- Migration: Add quiz and flashcard quota columns to resources and plans tables
-- Description: Tracks how many quizzes/flashcard sets a user has created (used_*)
--              and the maximum allowed by their plan (max_*).

-- 1. Add to resources table
ALTER TABLE resources
  ADD COLUMN IF NOT EXISTS used_quizzes    INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_quizzes     INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS used_flashcards INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_flashcards  INTEGER NOT NULL DEFAULT 0;

-- 2. Add to plans table so each plan can define its quiz/flashcard limits
ALTER TABLE plans
  ADD COLUMN IF NOT EXISTS max_quizzes    INTEGER NULL,
  ADD COLUMN IF NOT EXISTS max_flashcards INTEGER NULL;

-- 3. Set sensible defaults for existing plans (adjust slugs/values as needed)
-- UPDATE plans SET max_quizzes = 5,  max_flashcards = 5  WHERE slug = 'free';
-- UPDATE plans SET max_quizzes = 50, max_flashcards = 50 WHERE slug = 'pro';
