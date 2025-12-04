-- Migration: Update update_updated_at_column trigger function for security
-- This adds SECURITY DEFINER and search_path = '' to prevent potential security issues

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- The trigger itself doesn't need to be recreated as it references the function by name
-- and will automatically use the updated function definition