-- Ensure required extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto; 

------------------------
-- Enums (create only if missing)
------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'difficulty_level_enum') THEN
    CREATE TYPE difficulty_level_enum AS ENUM ('easy', 'medium', 'hard');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'explanation_level_enum') THEN
    CREATE TYPE explanation_level_enum AS ENUM ('none', 'brief', 'detailed');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'question_type_enum') THEN
    CREATE TYPE question_type_enum AS ENUM (
      'mcq',
      'true_false',
      'fill_blanks',
      'short_answer'
    );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'language_enum') THEN
    CREATE TYPE language_enum AS ENUM ('en', 'fr', 'ar');
  END IF;
END$$;

------------------------
-- quizzes (root aggregate)
------------------------
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES pdfs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  language language_enum NOT NULL,
  difficulty_level difficulty_level_enum NOT NULL,

  number_of_questions INT NOT NULL CHECK (number_of_questions >= 1),
  time_limit_minutes INT CHECK (time_limit_minutes > 0),
  explanation_level explanation_level_enum NOT NULL,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quizzes_document_id ON quizzes(document_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_user_id ON quizzes(user_id);

------------------------
-- quiz_questions (polymorphic base)
------------------------
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  type question_type_enum NOT NULL,
  text TEXT NOT NULL,
  points INT NOT NULL CHECK (points >= 0),

  explanation TEXT,
  position INT NOT NULL,            -- 1-based ordering in the quiz
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_quiz_questions_quiz_position ON quiz_questions(quiz_id, position);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_user_id ON quiz_questions(user_id);

------------------------
-- mcq_options (for questions.type = 'mcq')
------------------------
CREATE TABLE IF NOT EXISTS mcq_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  position INT NOT NULL DEFAULT 0, -- option ordering
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mcq_options_question_id ON mcq_options(question_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_mcq_options_question_position ON mcq_options(question_id, position);
CREATE INDEX IF NOT EXISTS idx_mcq_options_user_id ON mcq_options(user_id);

------------------------
-- true_false_answers (one row per true_false question)
------------------------
CREATE TABLE IF NOT EXISTS true_false_answers (
  question_id UUID PRIMARY KEY REFERENCES quiz_questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  correct_answer BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_true_false_answers_user_id ON true_false_answers(user_id);

------------------------
-- fill_blanks_answers (multiple acceptable answers per blank)
------------------------
CREATE TABLE IF NOT EXISTS fill_blanks_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  acceptable_answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fill_blanks_answers_question_id ON fill_blanks_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_fill_blanks_answers_user_id ON fill_blanks_answers(user_id);

------------------------
-- short_answer_meta (for questions.type = 'short_answer')
------------------------
CREATE TABLE IF NOT EXISTS short_answer_meta (
  question_id UUID PRIMARY KEY REFERENCES quiz_questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_short_answer_meta_user_id ON short_answer_meta(user_id);

------------------------
-- Triggers to maintain updated_at
------------------------
CREATE OR REPLACE FUNCTION set_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to quizzes
DROP TRIGGER IF EXISTS trg_update_quizzes_updated_at ON quizzes;
CREATE TRIGGER trg_update_quizzes_updated_at
  BEFORE UPDATE ON quizzes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

-- Attach trigger to quiz_questions
DROP TRIGGER IF EXISTS trg_update_quiz_questions_updated_at ON quiz_questions;
CREATE TRIGGER trg_update_quiz_questions_updated_at
  BEFORE UPDATE ON quiz_questions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();
