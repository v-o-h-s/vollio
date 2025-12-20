-- Migration: Add title to quizzes
-- Date: 2025-12-20

ALTER TABLE quizzes ADD COLUMN title TEXT;
