-- Migration: Auto-assign free plan resources when a new user signs up
-- Description: Trigger on auth.users that initializes the resources row
--              for every new user with the free plan limits:
--                - 50,000 AI tokens
--                - 50 MB storage (52,428,800 bytes)
--                - 5 documents

-- 1. Create the trigger function
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
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- 2. Attach the trigger to auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created_resources
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_resources();
