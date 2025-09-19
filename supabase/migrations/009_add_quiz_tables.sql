-- Migration: Add quiz tables for PDF Quiz Generator feature
-- This migration creates the core tables for quiz functionality

-- Create quizzes table
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  source_pdf_ids TEXT[] NOT NULL,
  question_count INTEGER NOT NULL CHECK (question_count >= 1 AND question_count <= 50),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  question_types TEXT[] NOT NULL CHECK (array_length(question_types, 1) > 0),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quiz_questions table
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('mcq', 'truefalse')),
  options JSONB, -- For MCQ options (array of strings)
  correct_answer TEXT NOT NULL,
  explanation TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(quiz_id, order_index)
);

-- Create quiz_attempts table
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}', -- User's answers: { questionId: selectedAnswer }
  score DECIMAL(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
  total_questions INTEGER NOT NULL CHECK (total_questions > 0),
  time_taken INTEGER, -- in seconds
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_quizzes_user_id ON quizzes(user_id);
CREATE INDEX idx_quizzes_created_at ON quizzes(created_at DESC);
CREATE INDEX idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE INDEX idx_quiz_questions_order ON quiz_questions(quiz_id, order_index);
CREATE INDEX idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_completed_at ON quiz_attempts(completed_at DESC);

-- Create updated_at trigger for quizzes table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_quizzes_updated_at 
    BEFORE UPDATE ON quizzes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Quizzes policies - users can only access their own quizzes
CREATE POLICY "Users can view their own quizzes" ON quizzes
    FOR SELECT USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can create their own quizzes" ON quizzes
    FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can update their own quizzes" ON quizzes
    FOR UPDATE USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can delete their own quizzes" ON quizzes
    FOR DELETE USING (auth.jwt() ->> 'sub' = user_id);

-- Quiz questions policies - users can access questions for their own quizzes
CREATE POLICY "Users can view questions for their own quizzes" ON quiz_questions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM quizzes 
            WHERE quizzes.id = quiz_questions.quiz_id 
            AND quizzes.user_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Users can create questions for their own quizzes" ON quiz_questions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM quizzes 
            WHERE quizzes.id = quiz_questions.quiz_id 
            AND quizzes.user_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Users can update questions for their own quizzes" ON quiz_questions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM quizzes 
            WHERE quizzes.id = quiz_questions.quiz_id 
            AND quizzes.user_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Users can delete questions for their own quizzes" ON quiz_questions
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM quizzes 
            WHERE quizzes.id = quiz_questions.quiz_id 
            AND quizzes.user_id = auth.jwt() ->> 'sub'
        )
    );

-- Quiz attempts policies - users can only access their own attempts
CREATE POLICY "Users can view their own quiz attempts" ON quiz_attempts
    FOR SELECT USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can create their own quiz attempts" ON quiz_attempts
    FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can update their own quiz attempts" ON quiz_attempts
    FOR UPDATE USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can delete their own quiz attempts" ON quiz_attempts
    FOR DELETE USING (auth.jwt() ->> 'sub' = user_id);

-- Additional policy to allow users to view quiz attempts for quizzes they own
CREATE POLICY "Quiz owners can view attempts on their quizzes" ON quiz_attempts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM quizzes 
            WHERE quizzes.id = quiz_attempts.quiz_id 
            AND quizzes.user_id = auth.jwt() ->> 'sub'
        )
    );