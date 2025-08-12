-- Migration: Fix requesting_user_id function for Clerk JWT format
-- Clerk's JWT has the user ID in the 'sub' field directly

CREATE OR REPLACE FUNCTION requesting_user_id()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(
    -- Try Clerk's standard 'sub' field first
    current_setting('request.jwt.claims', true)::json->>'sub',
    -- Fallback to other possible locations
    current_setting('request.jwt.claims', true)::json->>'user_id',
    -- Another fallback for different JWT structures
    (current_setting('request.jwt.claims', true)::json->>'user_metadata')::json->>'user_id'
  )::text;
$$;

-- Also update the storage function for consistency
CREATE OR REPLACE FUNCTION storage_requesting_user_id()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    current_setting('request.jwt.claims', true)::json->>'user_id',
    (current_setting('request.jwt.claims', true)::json->>'user_metadata')::json->>'user_id'
  )::text;
$$;