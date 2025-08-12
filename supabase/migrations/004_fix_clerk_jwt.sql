-- Migration: Fix requesting_user_id function for Clerk JWT format
-- Clerk automatically populates 'sub' field with user ID

CREATE OR REPLACE FUNCTION requesting_user_id()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(
    -- Try Clerk's 'sub' field first (contains user ID)
    current_setting('request.jwt.claims', true)::json->>'sub',
    -- Fallback to user_id field
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

-- Debug function to see what's in the JWT claims
CREATE OR REPLACE FUNCTION get_jwt_claims()
RETURNS JSON
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT current_setting('request.jwt.claims', true)::json;
$$;