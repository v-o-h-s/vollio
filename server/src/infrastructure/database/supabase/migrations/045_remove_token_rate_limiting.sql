-- Migration: Remove Token Rate Limiting System
-- Purpose: Drop tables, triggers, and functions related to AI token quota management

-- 1. Drop the trigger first
DROP TRIGGER IF EXISTS on_auth_user_created_token_quota ON auth.users;

-- 2. Drop the functions
DROP FUNCTION IF EXISTS public.initialize_user_token_quota();
DROP FUNCTION IF EXISTS public.reset_daily_token_quotas();
DROP FUNCTION IF EXISTS public.reset_monthly_token_quotas();

-- 3. Drop the tables (logs first because it references user_token_quotas)
-- Actually logs references auth.users, but good practice to drop logs first.
DROP TABLE IF EXISTS public.token_usage_logs;
DROP TABLE IF EXISTS public.user_token_quotas;
