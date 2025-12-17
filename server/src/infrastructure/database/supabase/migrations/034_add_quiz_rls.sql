-- ============================================================
-- Migration: Row Level Security for Quiz Domain
-- Date: 2025-12-16
-- Target: Supabase Postgres
-- Assumption: user_id UUID everywhere
-- ============================================================

-- ============================================================
-- COMMON PATTERN NOTES
-- - SECURITY DEFINER + fixed search_path (mandatory)
-- - auth.uid() cast to uuid
-- - service_role inserts allowed (auth.uid() IS NULL)
-- ============================================================

-- ============================================================
-- QUIZZES
-- ============================================================
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own quizzes" ON quizzes;
DROP POLICY IF EXISTS "Users can insert their own quizzes" ON quizzes;
DROP POLICY IF EXISTS "Users can update their own quizzes" ON quizzes;
DROP POLICY IF EXISTS "Users can delete their own quizzes" ON quizzes;

CREATE OR REPLACE FUNCTION auto_set_user_id_quizzes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid()::uuid;
  END IF;

  IF auth.uid() IS NOT NULL AND NEW.user_id <> auth.uid()::uuid THEN
    RAISE EXCEPTION 'user_id must match authenticated user';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS quizzes_set_user_id ON quizzes;
CREATE TRIGGER quizzes_set_user_id
  BEFORE INSERT ON quizzes
  FOR EACH ROW
  EXECUTE FUNCTION auto_set_user_id_quizzes();

CREATE POLICY "Users can view their own quizzes"
  ON quizzes FOR SELECT
  USING (user_id = auth.uid()::uuid);

CREATE POLICY "Users can insert their own quizzes"
  ON quizzes FOR INSERT
  WITH CHECK (user_id = auth.uid()::uuid);

CREATE POLICY "Users can update their own quizzes"
  ON quizzes FOR UPDATE
  USING (user_id = auth.uid()::uuid)
  WITH CHECK (user_id = auth.uid()::uuid);

CREATE POLICY "Users can delete their own quizzes"
  ON quizzes FOR DELETE
  USING (user_id = auth.uid()::uuid);

COMMENT ON TABLE quizzes IS 'Quiz root aggregate. RLS-enforced per owner.';

-- ============================================================
-- QUIZ QUESTIONS
-- ============================================================
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view quiz questions" ON quiz_questions;
DROP POLICY IF EXISTS "Users can insert quiz questions" ON quiz_questions;
DROP POLICY IF EXISTS "Users can update quiz questions" ON quiz_questions;
DROP POLICY IF EXISTS "Users can delete quiz questions" ON quiz_questions;

CREATE OR REPLACE FUNCTION auto_set_user_id_quiz_questions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid()::uuid;
  END IF;

  IF auth.uid() IS NOT NULL AND NEW.user_id <> auth.uid()::uuid THEN
    RAISE EXCEPTION 'user_id must match authenticated user';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS quiz_questions_set_user_id ON quiz_questions;
CREATE TRIGGER quiz_questions_set_user_id
  BEFORE INSERT ON quiz_questions
  FOR EACH ROW
  EXECUTE FUNCTION auto_set_user_id_quiz_questions();

CREATE POLICY "Users can view quiz questions"
  ON quiz_questions FOR SELECT
  USING (user_id = auth.uid()::uuid);

CREATE POLICY "Users can insert quiz questions"
  ON quiz_questions FOR INSERT
  WITH CHECK (user_id = auth.uid()::uuid);

CREATE POLICY "Users can update quiz questions"
  ON quiz_questions FOR UPDATE
  USING (user_id = auth.uid()::uuid)
  WITH CHECK (user_id = auth.uid()::uuid);

CREATE POLICY "Users can delete quiz questions"
  ON quiz_questions FOR DELETE
  USING (user_id = auth.uid()::uuid);

COMMENT ON TABLE quiz_questions IS 'Questions belonging to a quiz.';

-- ============================================================
-- MCQ OPTIONS
-- ============================================================
ALTER TABLE mcq_options ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view mcq options" ON mcq_options;
DROP POLICY IF EXISTS "Users can insert mcq options" ON mcq_options;
DROP POLICY IF EXISTS "Users can update mcq options" ON mcq_options;
DROP POLICY IF EXISTS "Users can delete mcq options" ON mcq_options;

CREATE OR REPLACE FUNCTION auto_set_user_id_mcq_options()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid()::uuid;
  END IF;

  IF auth.uid() IS NOT NULL AND NEW.user_id <> auth.uid()::uuid THEN
    RAISE EXCEPTION 'user_id must match authenticated user';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS mcq_options_set_user_id ON mcq_options;
CREATE TRIGGER mcq_options_set_user_id
  BEFORE INSERT ON mcq_options
  FOR EACH ROW
  EXECUTE FUNCTION auto_set_user_id_mcq_options();

CREATE POLICY "Users can view mcq options"
  ON mcq_options FOR SELECT
  USING (user_id = auth.uid()::uuid);

CREATE POLICY "Users can insert mcq options"
  ON mcq_options FOR INSERT
  WITH CHECK (user_id = auth.uid()::uuid);

CREATE POLICY "Users can update mcq options"
  ON mcq_options FOR UPDATE
  USING (user_id = auth.uid()::uuid)
  WITH CHECK (user_id = auth.uid()::uuid);

CREATE POLICY "Users can delete mcq options"
  ON mcq_options FOR DELETE
  USING (user_id = auth.uid()::uuid);

COMMENT ON TABLE mcq_options IS 'Multiple-choice options.';

-- ============================================================
-- TRUE / FALSE ANSWERS
-- ============================================================
ALTER TABLE true_false_answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view tf answers" ON true_false_answers;
DROP POLICY IF EXISTS "Users can insert tf answers" ON true_false_answers;
DROP POLICY IF EXISTS "Users can update tf answers" ON true_false_answers;
DROP POLICY IF EXISTS "Users can delete tf answers" ON true_false_answers;

CREATE OR REPLACE FUNCTION auto_set_user_id_true_false_answers()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid()::uuid;
  END IF;

  IF auth.uid() IS NOT NULL AND NEW.user_id <> auth.uid()::uuid THEN
    RAISE EXCEPTION 'user_id must match authenticated user';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS true_false_answers_set_user_id ON true_false_answers;
CREATE TRIGGER true_false_answers_set_user_id
  BEFORE INSERT ON true_false_answers
  FOR EACH ROW
  EXECUTE FUNCTION auto_set_user_id_true_false_answers();

CREATE POLICY "Users can view tf answers"
  ON true_false_answers FOR SELECT
  USING (user_id = auth.uid()::uuid);

CREATE POLICY "Users can insert tf answers"
  ON true_false_answers FOR INSERT
  WITH CHECK (user_id = auth.uid()::uuid);

CREATE POLICY "Users can update tf answers"
  ON true_false_answers FOR UPDATE
  USING (user_id = auth.uid()::uuid)
  WITH CHECK (user_id = auth.uid()::uuid);

CREATE POLICY "Users can delete tf answers"
  ON true_false_answers FOR DELETE
  USING (user_id = auth.uid()::uuid);

COMMENT ON TABLE true_false_answers IS 'True/False answers.';

-- ============================================================
-- FILL BLANKS ANSWERS
-- ============================================================
ALTER TABLE fill_blanks_answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view fill blanks answers" ON fill_blanks_answers;
DROP POLICY IF EXISTS "Users can insert fill blanks answers" ON fill_blanks_answers;
DROP POLICY IF EXISTS "Users can update fill blanks answers" ON fill_blanks_answers;
DROP POLICY IF EXISTS "Users can delete fill blanks answers" ON fill_blanks_answers;

CREATE OR REPLACE FUNCTION auto_set_user_id_fill_blanks_answers()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid()::uuid;
  END IF;

  IF auth.uid() IS NOT NULL AND NEW.user_id <> auth.uid()::uuid THEN
    RAISE EXCEPTION 'user_id must match authenticated user';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS fill_blanks_answers_set_user_id ON fill_blanks_answers;
CREATE TRIGGER fill_blanks_answers_set_user_id
  BEFORE INSERT ON fill_blanks_answers
  FOR EACH ROW
  EXECUTE FUNCTION auto_set_user_id_fill_blanks_answers();

CREATE POLICY "Users can view fill blanks answers"
  ON fill_blanks_answers FOR SELECT
  USING (user_id = auth.uid()::uuid);

CREATE POLICY "Users can insert fill blanks answers"
  ON fill_blanks_answers FOR INSERT
  WITH CHECK (user_id = auth.uid()::uuid);

CREATE POLICY "Users can update fill blanks answers"
  ON fill_blanks_answers FOR UPDATE
  USING (user_id = auth.uid()::uuid)
  WITH CHECK (user_id = auth.uid()::uuid);

CREATE POLICY "Users can delete fill blanks answers"
  ON fill_blanks_answers FOR DELETE
  USING (user_id = auth.uid()::uuid);

COMMENT ON TABLE fill_blanks_answers IS 'Fill-in-the-blank accepted answers.';

-- ============================================================
-- SHORT ANSWER META
-- ============================================================
ALTER TABLE short_answer_meta ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view short answer meta" ON short_answer_meta;
DROP POLICY IF EXISTS "Users can insert short answer meta" ON short_answer_meta;
DROP POLICY IF EXISTS "Users can update short answer meta" ON short_answer_meta;
DROP POLICY IF EXISTS "Users can delete short answer meta" ON short_answer_meta;

CREATE OR REPLACE FUNCTION auto_set_user_id_short_answer_meta()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid()::uuid;
  END IF;

  IF auth.uid() IS NOT NULL AND NEW.user_id <> auth.uid()::uuid THEN
    RAISE EXCEPTION 'user_id must match authenticated user';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS short_answer_meta_set_user_id ON short_answer_meta;
CREATE TRIGGER short_answer_meta_set_user_id
  BEFORE INSERT ON short_answer_meta
  FOR EACH ROW
  EXECUTE FUNCTION auto_set_user_id_short_answer_meta();

CREATE POLICY "Users can view short answer meta"
  ON short_answer_meta FOR SELECT
  USING (user_id = auth.uid()::uuid);

CREATE POLICY "Users can insert short answer meta"
  ON short_answer_meta FOR INSERT
  WITH CHECK (user_id = auth.uid()::uuid);

CREATE POLICY "Users can update short answer meta"
  ON short_answer_meta FOR UPDATE
  USING (user_id = auth.uid()::uuid)
  WITH CHECK (user_id = auth.uid()::uuid);

CREATE POLICY "Users can delete short answer meta"
  ON short_answer_meta FOR DELETE
  USING (user_id = auth.uid()::uuid);

COMMENT ON TABLE short_answer_meta IS 'Short answer configuration metadata.';

-- ============================================================
-- END OF MIGRATION
-- ============================================================
