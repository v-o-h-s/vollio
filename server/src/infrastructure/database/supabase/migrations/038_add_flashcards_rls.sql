-- Migration: Add Flashcards RLS
-- Description: Enables RLS and adds policies for flashcard_sets and flashcards.

-- Flashcard Sets
ALTER TABLE flashcard_sets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own flashcard_sets" ON flashcard_sets;
DROP POLICY IF EXISTS "Users can insert their own flashcard_sets" ON flashcard_sets;
DROP POLICY IF EXISTS "Users can update their own flashcard_sets" ON flashcard_sets;
DROP POLICY IF EXISTS "Users can delete their own flashcard_sets" ON flashcard_sets;

CREATE OR REPLACE FUNCTION auto_set_user_id_flashcard_sets()
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

CREATE TRIGGER flashcard_sets_set_user_id
  BEFORE INSERT ON flashcard_sets
  FOR EACH ROW
  EXECUTE FUNCTION auto_set_user_id_flashcard_sets();

CREATE POLICY "Users can view their own flashcard_sets"
  ON flashcard_sets FOR SELECT
  USING (user_id = auth.uid()::uuid);

CREATE POLICY "Users can insert their own flashcard_sets"
  ON flashcard_sets FOR INSERT
  WITH CHECK (user_id = auth.uid()::uuid);

CREATE POLICY "Users can update their own flashcard_sets"
  ON flashcard_sets FOR UPDATE
  USING (user_id = auth.uid()::uuid)
  WITH CHECK (user_id = auth.uid()::uuid);

CREATE POLICY "Users can delete their own flashcard_sets"
  ON flashcard_sets FOR DELETE
  USING (user_id = auth.uid()::uuid);

-- Flashcards
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own flashcards" ON flashcards;
DROP POLICY IF EXISTS "Users can insert their own flashcards" ON flashcards;
DROP POLICY IF EXISTS "Users can update their own flashcards" ON flashcards;
DROP POLICY IF EXISTS "Users can delete their own flashcards" ON flashcards;

CREATE OR REPLACE FUNCTION auto_set_user_id_flashcards()
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

CREATE TRIGGER flashcards_set_user_id
  BEFORE INSERT ON flashcards
  FOR EACH ROW
  EXECUTE FUNCTION auto_set_user_id_flashcards();

CREATE POLICY "Users can view their own flashcards"
  ON flashcards FOR SELECT
  USING (user_id = auth.uid()::uuid);

CREATE POLICY "Users can insert their own flashcards"
  ON flashcards FOR INSERT
  WITH CHECK (user_id = auth.uid()::uuid);

CREATE POLICY "Users can update their own flashcards"
  ON flashcards FOR UPDATE
  USING (user_id = auth.uid()::uuid)
  WITH CHECK (user_id = auth.uid()::uuid);

CREATE POLICY "Users can delete their own flashcards"
  ON flashcards FOR DELETE
  USING (user_id = auth.uid()::uuid);
