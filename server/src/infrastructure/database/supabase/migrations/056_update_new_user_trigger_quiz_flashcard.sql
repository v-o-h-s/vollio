-- Migration: Update new-user trigger to also initialise quiz and flashcard quotas
-- This replaces the trigger function from 054 to include the new columns.

CREATE OR REPLACE FUNCTION public.handle_new_user_resources()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  free_plan_id UUID;
BEGIN
  -- Look up the free plan dynamically so this stays in sync with plan changes
  SELECT id INTO free_plan_id
  FROM plans
  WHERE slug = 'free'
  LIMIT 1;

  -- Insert initial resources for the new user
  INSERT INTO resources (
    user_id,
    plan_id,
    used_ai_tokens,
    used_storage_bytes,
    used_documents,
    max_ai_tokens,
    max_storage_bytes,
    max_documents,
    used_quizzes,
    max_quizzes,
    used_flashcards,
    max_flashcards,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    free_plan_id,
    0,          -- used_ai_tokens
    0,          -- used_storage_bytes
    0,          -- used_documents
    50000,      -- max_ai_tokens (50k tokens)
    52428800,   -- max_storage_bytes (50 MB = 50 * 1024 * 1024)
    5,          -- max_documents
    0,          -- used_quizzes
    5,          -- max_quizzes
    0,          -- used_flashcards
    5,          -- max_flashcards
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;
