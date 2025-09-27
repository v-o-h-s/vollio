-- Migration: Add performance optimization indexes
-- This migration creates additional indexes for improved query performance

-- Quiz history performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quiz_attempts_user_completed_at 
ON quiz_attempts (user_id, completed_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quiz_attempts_user_score 
ON quiz_attempts (user_id, score DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quiz_attempts_quiz_completed 
ON quiz_attempts (quiz_id, completed_at DESC);

-- Quiz questions performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quiz_questions_quiz_order 
ON quiz_questions (quiz_id, order_index);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quiz_questions_difficulty 
ON quiz_questions (quiz_id, difficulty);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quiz_questions_type 
ON quiz_questions (quiz_id, question_type);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quiz_questions_confidence 
ON quiz_questions (quiz_id, confidence_score DESC) 
WHERE confidence_score IS NOT NULL;

-- Document chunks performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_document_chunks_user_doc_page 
ON document_chunks (user_id, document_id, page_number);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_document_chunks_user_quality 
ON document_chunks (user_id, quality_score DESC) 
WHERE quality_score IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_document_chunks_doc_chunk_index 
ON document_chunks (document_id, chunk_index);

-- JSONB metadata indexes for document chunks
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_document_chunks_metadata_content_type 
ON document_chunks USING gin ((metadata->>'contentType'));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_document_chunks_metadata_extraction 
ON document_chunks USING gin ((metadata->>'extractionMethod'));

-- Vector search optimization indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_document_chunks_embedding_cosine 
ON document_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)
WHERE embedding IS NOT NULL;

-- Alternative vector index for different similarity measures
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_document_chunks_embedding_l2 
ON document_chunks USING ivfflat (embedding vector_l2_ops) WITH (lists = 100)
WHERE embedding IS NOT NULL;

-- Document processing status indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_processing_status_user_status 
ON document_processing_status (user_id, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_processing_status_doc_status 
ON document_processing_status (document_id, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_processing_status_created_desc 
ON document_processing_status (created_at DESC);

-- Quiz generation performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quizzes_user_created 
ON quizzes (user_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quizzes_user_difficulty 
ON quizzes (user_id, difficulty);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quizzes_source_docs 
ON quizzes USING gin (source_document_ids);

-- Question chunk sources performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_question_chunk_sources_question 
ON question_chunk_sources (question_id, relevance_score DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_question_chunk_sources_chunk 
ON question_chunk_sources (chunk_id, relevance_score DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_question_chunk_sources_usage_type 
ON question_chunk_sources (usage_type, relevance_score DESC);

-- Essential indexes for quiz generation (removed complex analytics indexes)

-- PDF documents performance indexes (if not already exists)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pdfs_user_created 
ON pdfs (user_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pdfs_user_title 
ON pdfs (user_id, title);

-- Notes performance indexes (if notes table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notes') THEN
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notes_user_created 
        ON notes (user_id, created_at DESC);
        
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notes_user_updated 
        ON notes (user_id, updated_at DESC);
        
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notes_title_search 
        ON notes USING gin (to_tsvector('english', title));
        
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notes_content_search 
        ON notes USING gin (to_tsvector('english', content));
    END IF;
END $$;

-- Simple indexes for basic quiz functionality
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quiz_attempts_user_quiz_score_date 
ON quiz_attempts (user_id, quiz_id, score DESC, completed_at DESC);

-- Function-based indexes for JSON operations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quizzes_page_range_start 
ON quizzes ((page_range->>'start')::int) 
WHERE page_range IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quizzes_page_range_end 
ON quizzes ((page_range->>'end')::int) 
WHERE page_range IS NOT NULL;

-- Text search indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_document_chunks_content_search 
ON document_chunks USING gin (to_tsvector('english', content));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quiz_questions_text_search 
ON quiz_questions USING gin (to_tsvector('english', question_text));

-- Statistics update for better query planning
ANALYZE quiz_attempts;
ANALYZE quiz_questions;
ANALYZE document_chunks;
ANALYZE document_processing_status;
ANALYZE quizzes;
ANALYZE question_chunk_sources;

-- Removed complex analytics functions to keep it simple

-- Create a function for vector search with performance optimization
CREATE OR REPLACE FUNCTION match_document_chunks_optimized(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 10,
    filter_user_id text DEFAULT NULL,
    filter_document_ids uuid[] DEFAULT NULL,
    filter_page_range int[] DEFAULT NULL
)
RETURNS TABLE (
    id uuid,
    content text,
    page_number int,
    chunk_index int,
    section_title text,
    similarity float,
    document_id uuid,
    metadata jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dc.id,
        dc.content,
        dc.page_number,
        dc.chunk_index,
        dc.section_title,
        1 - (dc.embedding <=> query_embedding) as similarity,
        dc.document_id,
        dc.metadata
    FROM document_chunks dc
    WHERE 
        dc.embedding IS NOT NULL
        AND (filter_user_id IS NULL OR dc.user_id = filter_user_id)
        AND (filter_document_ids IS NULL OR dc.document_id = ANY(filter_document_ids))
        AND (filter_page_range IS NULL OR dc.page_number BETWEEN filter_page_range[1] AND filter_page_range[2])
        AND 1 - (dc.embedding <=> query_embedding) > match_threshold
    ORDER BY dc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Grant execute permissions on the vector search function
GRANT EXECUTE ON FUNCTION match_document_chunks_optimized(vector, float, int, text, uuid[], int[]) TO authenticated;

-- Add comments for documentation
COMMENT ON FUNCTION match_document_chunks_optimized(vector, float, int, text, uuid[], int[]) IS 'Optimized vector search function with filtering capabilities';