-- Migration: Add document count columns to resources and plans tables
-- Description: Tracks how many documents a user has uploaded (used_documents)
--              and the maximum allowed by their plan (max_documents).

-- 1. Add to resources table
ALTER TABLE resources
  ADD COLUMN IF NOT EXISTS used_documents INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_documents  INTEGER NOT NULL DEFAULT 0;

-- 2. Add to plans table so each plan can define its document limit
ALTER TABLE plans
  ADD COLUMN IF NOT EXISTS max_documents INTEGER NULL;

-- 3. Set sensible defaults for existing plans (adjust slugs/values as needed)
-- UPDATE plans SET max_documents = 5   WHERE slug = 'free';
-- UPDATE plans SET max_documents = 100 WHERE slug = 'pro';
-- UPDATE plans SET max_documents = 500 WHERE slug = 'enterprise';
