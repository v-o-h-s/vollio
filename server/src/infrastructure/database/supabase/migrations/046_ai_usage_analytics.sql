-- ============================================================================
-- 1. Table: ai_usage_logs
-- Purpose: Immutable audit trail of every AI request and its cost.
-- ============================================================================

-- Cleanup existing tables if they exist to reflect the name/structure change
DROP TABLE IF EXISTS public.user_ai_limits CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created_ai_limits ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_ai_limits();

CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Action Details
    action_type text NOT NULL CHECK (action_type IN ('chat', 'summary', 'flashcards', 'quiz', 'other')),
    model text NOT NULL, -- e.g. 'gpt-4o', 'claude-3'
    resource_id text,    -- Optional: ID of the document/note created
    
    -- Token Accounting
    input_tokens integer NOT NULL DEFAULT 0,
    output_tokens integer NOT NULL DEFAULT 0,
    total_tokens integer NOT NULL DEFAULT 0,
    cost_multiplier numeric NOT NULL DEFAULT 1.0, -- Token ratio used
    
    -- Context
    metadata jsonb DEFAULT '{}'::jsonb, -- e.g. { "batch_count": 4, "document_size": 15000 }
    
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Indexes for Analytics
CREATE INDEX idx_ai_usage_logs_user_created ON public.ai_usage_logs(user_id, created_at DESC);
CREATE INDEX idx_ai_usage_logs_action_created ON public.ai_usage_logs(action_type, created_at DESC);

-- RLS Policies
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own logs
CREATE POLICY "Users can view own usage logs"
    ON public.ai_usage_logs FOR SELECT
    USING (auth.uid() = user_id);

-- Service Role (Backend) can insert logs
CREATE POLICY "Service role can insert usage logs"
    ON public.ai_usage_logs FOR INSERT
    WITH CHECK (true); -- Only trusted backend will insert

-- Output comment
COMMENT ON TABLE public.ai_usage_logs IS 'Audit log of all AI token usage for history and billing audit.';
