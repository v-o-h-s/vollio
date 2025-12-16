-- Migration: Add Row Level Security for quiz tables
-- Date: 2025-12-16
-- Description: Enable RLS on quizzes and related tables and add policies that allow users to operate only on rows that belong to them.

-- quizzes
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own quizzes" ON quizzes;
DROP POLICY IF EXISTS "Users can insert their own quizzes" ON quizzes;
DROP POLICY IF EXISTS "Users can update their own quizzes" ON quizzes;
DROP POLICY IF EXISTS "Users can delete their own quizzes" ON quizzes;

CREATE OR REPLACE FUNCTION auto_set_user_id_for_quizzes()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  IF NEW.user_id <> auth.uid() THEN
    RAISE EXCEPTION 'user_id must match authenticated user';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS quizzes_set_user_id ON quizzes;
CREATE TRIGGER quizzes_set_user_id
  BEFORE INSERT ON quizzes
  FOR EACH ROW
  EXECUTE FUNCTION auto_set_user_id_for_quizzes();

CREATE POLICY "Users can view their own quizzes" ON quizzes
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own quizzes" ON quizzes
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own quizzes" ON quizzes
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own quizzes" ON quizzes
  FOR DELETE USING (user_id = auth.uid());

COMMENT ON TABLE quizzes IS 'Quiz root aggregate. Access restricted to the owner via RLS.';

-- quiz_questions
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view quiz questions for their quizzes" ON quiz_questions;
DROP POLICY IF EXISTS "Users can insert quiz questions for their quizzes" ON quiz_questions;
DROP POLICY IF EXISTS "Users can update their quiz questions" ON quiz_questions;
DROP POLICY IF EXISTS "Users can delete their quiz questions" ON quiz_questions;

CREATE OR REPLACE FUNCTION auto_set_user_id_for_quiz_questions()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  IF NEW.user_id <> auth.uid() THEN
    RAISE EXCEPTION 'user_id must match authenticated user';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS quiz_questions_set_user_id ON quiz_questions;
CREATE TRIGGER quiz_questions_set_user_id
  BEFORE INSERT ON quiz_questions
  FOR EACH ROW
  EXECUTE FUNCTION auto_set_user_id_for_quiz_questions();

CREATE POLICY "Users can view quiz questions for their quizzes" ON quiz_questions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert quiz questions for their quizzes" ON quiz_questions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their quiz questions" ON quiz_questions
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their quiz questions" ON quiz_questions
  FOR DELETE USING (user_id = auth.uid());

COMMENT ON TABLE quiz_questions IS 'Questions belonging to a quiz. Access restricted to quiz owner.';

-- mcq_options
ALTER TABLE mcq_options ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view mcq options for their quizzes" ON mcq_options;
DROP POLICY IF EXISTS "Users can insert mcq options for their quizzes" ON mcq_options;
DROP POLICY IF EXISTS "Users can update their mcq options" ON mcq_options;
DROP POLICY IF EXISTS "Users can delete their mcq options" ON mcq_options;

CREATE OR REPLACE FUNCTION auto_set_user_id_for_mcq_options()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  IF NEW.user_id <> auth.uid() THEN
    RAISE EXCEPTION 'user_id must match authenticated user';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS mcq_options_set_user_id ON mcq_options;
CREATE TRIGGER mcq_options_set_user_id
  BEFORE INSERT ON mcq_options
  FOR EACH ROW
  EXECUTE FUNCTION auto_set_user_id_for_mcq_options();

CREATE POLICY "Users can view mcq options for their quizzes" ON mcq_options
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert mcq options for their quizzes" ON mcq_options
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their mcq options" ON mcq_options
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their mcq options" ON mcq_options
  FOR DELETE USING (user_id = auth.uid());

COMMENT ON TABLE mcq_options IS 'MCQ options; access restricted to quiz owner.';

-- true_false_answers
ALTER TABLE true_false_answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view true/false answers for their quizzes" ON true_false_answers;
DROP POLICY IF EXISTS "Users can insert true/false answers for their quizzes" ON true_false_answers;
DROP POLICY IF EXISTS "Users can update their true/false answers" ON true_false_answers;
DROP POLICY IF EXISTS "Users can delete their true/false answers" ON true_false_answers;

CREATE OR REPLACE FUNCTION auto_set_user_id_for_true_false_answers()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  IF NEW.user_id <> auth.uid() THEN
    RAISE EXCEPTION 'user_id must match authenticated user';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS true_false_answers_set_user_id ON true_false_answers;
CREATE TRIGGER true_false_answers_set_user_id
  BEFORE INSERT ON true_false_answers
  FOR EACH ROW
  EXECUTE FUNCTION auto_set_user_id_for_true_false_answers();

CREATE POLICY "Users can view true/false answers for their quizzes" ON true_false_answers
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert true/false answers for their quizzes" ON true_false_answers
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their true/false answers" ON true_false_answers
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their true/false answers" ON true_false_answers
  FOR DELETE USING (user_id = auth.uid());

COMMENT ON TABLE true_false_answers IS 'True/False answers for questions. Access restricted to quiz owner.';

-- fill_blanks_answers
ALTER TABLE fill_blanks_answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view fill blanks answers for their quizzes" ON fill_blanks_answers;
DROP POLICY IF EXISTS "Users can insert fill blanks answers for their quizzes" ON fill_blanks_answers;
DROP POLICY IF EXISTS "Users can update their fill blanks answers" ON fill_blanks_answers;
DROP POLICY IF EXISTS "Users can delete their fill blanks answers" ON fill_blanks_answers;

CREATE OR REPLACE FUNCTION auto_set_user_id_for_fill_blanks_answers()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  IF NEW.user_id <> auth.uid() THEN
    RAISE EXCEPTION 'user_id must match authenticated user';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS fill_blanks_answers_set_user_id ON fill_blanks_answers;
CREATE TRIGGER fill_blanks_answers_set_user_id
  BEFORE INSERT ON fill_blanks_answers
  FOR EACH ROW
  EXECUTE FUNCTION auto_set_user_id_for_fill_blanks_answers();

CREATE POLICY "Users can view fill blanks answers for their quizzes" ON fill_blanks_answers
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert fill blanks answers for their quizzes" ON fill_blanks_answers
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their fill blanks answers" ON fill_blanks_answers
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their fill blanks answers" ON fill_blanks_answers
  FOR DELETE USING (user_id = auth.uid());

COMMENT ON TABLE fill_blanks_answers IS 'Fill-in-the-blank acceptable answers. Access restricted to quiz owner.';

-- short_answer_meta
ALTER TABLE short_answer_meta ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view short answer meta for their quizzes" ON short_answer_meta;
DROP POLICY IF EXISTS "Users can insert short answer meta for their quizzes" ON short_answer_meta;
DROP POLICY IF EXISTS "Users can update their short answer meta" ON short_answer_meta;
DROP POLICY IF EXISTS "Users can delete their short answer meta" ON short_answer_meta;

CREATE OR REPLACE FUNCTION auto_set_user_id_for_short_answer_meta()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  IF NEW.user_id <> auth.uid() THEN
    RAISE EXCEPTION 'user_id must match authenticated user';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS short_answer_meta_set_user_id ON short_answer_meta;
CREATE TRIGGER short_answer_meta_set_user_id
  BEFORE INSERT ON short_answer_meta
  FOR EACH ROW
  EXECUTE FUNCTION auto_set_user_id_for_short_answer_meta();

CREATE POLICY "Users can view short answer meta for their quizzes" ON short_answer_meta
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert short answer meta for their quizzes" ON short_answer_meta
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their short answer meta" ON short_answer_meta
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their short answer meta" ON short_answer_meta
  FOR DELETE USING (user_id = auth.uid());

COMMENT ON TABLE short_answer_meta IS 'Short answer metadata. Access restricted to quiz owner.';

-- End of migration
*** End Patch***