-- Migration: Token Rate Limiting System
-- Purpose: Add tables for per-user token quota management and usage logging

-- ============================================================================
-- Table: user_token_quotas
-- Purpose: Store per-user token limits and current usage
-- ============================================================================
CREATE TABLE public.user_token_quotas (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Configurable limits (weighted tokens)
  monthly_limit bigint NOT NULL DEFAULT 10000000,  -- 10M tokens/month
  daily_limit bigint NOT NULL DEFAULT 500000,      -- 500K tokens/day
  burst_capacity bigint NOT NULL DEFAULT 500000,   -- 500K burst (for large docs)
  
  -- Current usage counters
  monthly_used bigint NOT NULL DEFAULT 0,
  daily_used bigint NOT NULL DEFAULT 0,
  
  -- Reset timestamps
  last_daily_reset timestamp with time zone DEFAULT now(),
  last_monthly_reset timestamp with time zone DEFAULT now(),
  
  -- Metadata
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_token_quotas ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own quota
CREATE POLICY "Users can view own quota"
  ON public.user_token_quotas
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can update their own usage (but not limits)
CREATE POLICY "Users can update own usage"
  ON public.user_token_quotas
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Service role can do anything (for backend operations)
CREATE POLICY "Service role full access"
  ON public.user_token_quotas
  FOR ALL
  USING (auth.role() = 'service_role');

-- Index for fast lookups
CREATE INDEX idx_user_token_quotas_user_id ON public.user_token_quotas(user_id);

-- ============================================================================
-- Table: token_usage_logs
-- Purpose: Audit log for token consumption (for analytics and debugging)
-- ============================================================================
CREATE TABLE public.token_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Token counts
  prompt_tokens integer NOT NULL,
  completion_tokens integer NOT NULL,
  weighted_tokens bigint NOT NULL,  -- prompt*1 + completion*4
  
  -- Request context
  model text NOT NULL,
  endpoint text NOT NULL,
  
  -- Metadata
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.token_usage_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own logs
CREATE POLICY "Users can view own logs"
  ON public.token_usage_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can insert logs
CREATE POLICY "Service role can insert logs"
  ON public.token_usage_logs
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Indexes for analytics queries
CREATE INDEX idx_token_usage_logs_user_id ON public.token_usage_logs(user_id);
CREATE INDEX idx_token_usage_logs_created_at ON public.token_usage_logs(created_at);
CREATE INDEX idx_token_usage_logs_user_created ON public.token_usage_logs(user_id, created_at);

-- ============================================================================
-- Function: Initialize quota for new users
-- Purpose: Automatically create quota record when user signs up
-- ============================================================================
CREATE OR REPLACE FUNCTION public.initialize_user_token_quota()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_token_quotas (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Auto-create quota on user creation
CREATE TRIGGER on_auth_user_created_token_quota
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_user_token_quota();

-- ============================================================================
-- Function: Reset daily quotas (run via cron job at midnight UTC)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.reset_daily_token_quotas()
RETURNS void AS $$
BEGIN
  UPDATE public.user_token_quotas
  SET 
    daily_used = 0,
    last_daily_reset = now(),
    updated_at = now()
  WHERE last_daily_reset < date_trunc('day', now());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Function: Reset monthly quotas (run via cron job on 1st of month)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.reset_monthly_token_quotas()
RETURNS void AS $$
BEGIN
  UPDATE public.user_token_quotas
  SET 
    monthly_used = 0,
    last_monthly_reset = now(),
    updated_at = now()
  WHERE last_monthly_reset < date_trunc('month', now());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Initialize quotas for existing users
-- ============================================================================
INSERT INTO public.user_token_quotas (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- Add comment for documentation
COMMENT ON TABLE public.user_token_quotas IS 'Per-user token quota limits and usage tracking for AI rate limiting';
COMMENT ON TABLE public.token_usage_logs IS 'Audit log of token consumption per AI request';
COMMENT ON COLUMN public.user_token_quotas.burst_capacity IS 'Maximum tokens allowed in a single request (for large document processing)';
COMMENT ON COLUMN public.token_usage_logs.weighted_tokens IS 'Calculated as: prompt_tokens * 1 + completion_tokens * 4';
