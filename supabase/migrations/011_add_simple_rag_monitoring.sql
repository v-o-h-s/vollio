-- Simple RAG Monitoring Tables
-- This migration adds basic monitoring tables for RAG operations

-- Enable RLS on all tables
SET row_security = on;

-- Simple embedding quality tracking
CREATE TABLE embedding_quality_simple (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  document_id UUID NOT NULL,
  chunk_id UUID NOT NULL,
  quality_score DECIMAL(3,2) NOT NULL CHECK (quality_score >= 0 AND quality_score <= 1),
  is_valid BOOLEAN NOT NULL DEFAULT true,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Simple quiz quality tracking
CREATE TABLE quiz_quality_simple (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  quiz_id UUID NOT NULL,
  question_id UUID NOT NULL,
  quality_score DECIMAL(3,2) NOT NULL CHECK (quality_score >= 0 AND quality_score <= 1),
  question_type TEXT NOT NULL CHECK (question_type IN ('mcq', 'truefalse', 'fillblank')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Simple search tracking
CREATE TABLE search_tracking_simple (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  search_query TEXT NOT NULL,
  result_count INTEGER NOT NULL DEFAULT 0,
  search_time INTEGER NOT NULL DEFAULT 0, -- in milliseconds
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Simple user feedback
CREATE TABLE user_feedback_simple (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('quiz', 'search', 'general')),
  target_id TEXT NOT NULL, -- quiz ID, search query hash, etc.
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_embedding_quality_simple_user_id ON embedding_quality_simple(user_id);
CREATE INDEX idx_embedding_quality_simple_timestamp ON embedding_quality_simple(timestamp);

CREATE INDEX idx_quiz_quality_simple_user_id ON quiz_quality_simple(user_id);
CREATE INDEX idx_quiz_quality_simple_quiz_id ON quiz_quality_simple(quiz_id);
CREATE INDEX idx_quiz_quality_simple_timestamp ON quiz_quality_simple(timestamp);

CREATE INDEX idx_search_tracking_simple_user_id ON search_tracking_simple(user_id);
CREATE INDEX idx_search_tracking_simple_timestamp ON search_tracking_simple(timestamp);

CREATE INDEX idx_user_feedback_simple_user_id ON user_feedback_simple(user_id);
CREATE INDEX idx_user_feedback_simple_timestamp ON user_feedback_simple(timestamp);
CREATE INDEX idx_user_feedback_simple_type ON user_feedback_simple(feedback_type);

-- Enable Row Level Security (RLS)
ALTER TABLE embedding_quality_simple ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_quality_simple ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_tracking_simple ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feedback_simple ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only access their own data
CREATE POLICY "Users can view their own embedding quality data" ON embedding_quality_simple
  FOR SELECT USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can insert their own embedding quality data" ON embedding_quality_simple
  FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can view their own quiz quality data" ON quiz_quality_simple
  FOR SELECT USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can insert their own quiz quality data" ON quiz_quality_simple
  FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can view their own search tracking data" ON search_tracking_simple
  FOR SELECT USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can insert their own search tracking data" ON search_tracking_simple
  FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can view their own feedback data" ON user_feedback_simple
  FOR SELECT USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can insert their own feedback data" ON user_feedback_simple
  FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = user_id);

-- Add comments for documentation
COMMENT ON TABLE embedding_quality_simple IS 'Simple tracking of embedding generation quality';
COMMENT ON TABLE quiz_quality_simple IS 'Simple tracking of quiz question generation quality';
COMMENT ON TABLE search_tracking_simple IS 'Simple tracking of search operations';
COMMENT ON TABLE user_feedback_simple IS 'Simple user feedback collection';