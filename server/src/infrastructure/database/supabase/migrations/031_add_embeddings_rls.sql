-- Migration: Add Row Level Security for embeddings
-- Date: December 15, 2025
-- Description: Enable RLS on the `embeddings` table and add policies that allow users to operate only on embeddings that belong to Documents they own.

-- 1️⃣ Enable Row Level Security
ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;

-- 0️⃣ Drop existing policies if any (idempotency)
DROP POLICY IF EXISTS "Users can view their own embeddings" ON embeddings;
DROP POLICY IF EXISTS "Users can insert their own embeddings" ON embeddings;
DROP POLICY IF EXISTS "Users can update their own embeddings" ON embeddings;
DROP POLICY IF EXISTS "Users can delete their own embeddings" ON embeddings;

-- 1️⃣ Create trigger to auto-populate user_id from auth.uid() on INSERT
CREATE OR REPLACE FUNCTION auto_set_user_id_for_embeddings()
RETURNS TRIGGER AS $$
BEGIN
    -- If user_id is not provided or is NULL, set it from the authenticated user
    IF NEW.user_id IS NULL THEN
        NEW.user_id = auth.uid();
    END IF;
    -- Ensure the user_id matches the authenticated user (security check)
    IF NEW.user_id != auth.uid() THEN
        RAISE EXCEPTION 'user_id must match authenticated user';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER embeddings_set_user_id
    BEFORE INSERT ON embeddings
    FOR EACH ROW
    EXECUTE FUNCTION auto_set_user_id_for_embeddings();

-- 2️⃣ Create updated_at trigger
CREATE OR REPLACE FUNCTION update_embeddings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER embeddings_updated_at
    BEFORE UPDATE ON embeddings
    FOR EACH ROW
    EXECUTE FUNCTION update_embeddings_updated_at();

-- 2️⃣ RLS Policy: Users can view embeddings belonging to their Documents
CREATE POLICY "Users can view their own embeddings" ON embeddings
    FOR SELECT
    USING (
        -- allow when the embedding owner matches the authenticated user
        auth.uid() = user_id
    );

-- 3️⃣ RLS Policy: Users can insert embeddings only for Documents they own
CREATE POLICY "Users can insert their own embeddings" ON embeddings
    FOR INSERT
    WITH CHECK (
        -- ensure embedding's user_id matches the authenticated user
        auth.uid() = user_id
    );

-- 4️⃣ RLS Policy: Users can update embeddings only when the embedding belongs to a Document they own
CREATE POLICY "Users can update their own embeddings" ON embeddings
    FOR UPDATE
    USING (
        auth.uid() = user_id
    )
    WITH CHECK (
        auth.uid() = user_id
    );

-- 5️⃣ RLS Policy: Users can delete embeddings belonging to their Documents
CREATE POLICY "Users can delete their own embeddings" ON embeddings
    FOR DELETE
    USING (
        auth.uid() = user_id
    );

-- Comments
COMMENT ON TABLE embeddings IS 'Embeddings extracted from Documents; access is restricted to the Document owner by RLS policies';
COMMENT ON COLUMN embeddings.document_id IS 'Reference to the Document this embedding chunk belongs to';
COMMENT ON COLUMN embeddings.chunk_index IS 'Index of the chunk inside the original Document';
COMMENT ON COLUMN embeddings.token_count IS 'Number of tokens in the chunk (if available)';
COMMENT ON COLUMN embeddings.metadata IS 'Flexible JSONB for chunk-level metadata (page range, heading, etc.)';
