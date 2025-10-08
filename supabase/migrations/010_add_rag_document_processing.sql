    -- Migration: Add RAG document processing tables
    -- This migration creates tables for document processing, chunking, and vector storage

    -- Enable pgvector extension for vector embeddings
    CREATE EXTENSION IF NOT EXISTS vector;

    -- Create document_chunks table for storing processed text chunks with embeddings
    CREATE TABLE document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    document_id UUID NOT NULL REFERENCES pdfs(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536), -- OpenAI ada-002 dimension, adjust for other models
    token_count INTEGER NOT NULL,
    page_number INTEGER NOT NULL,
    section_title TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create document_processing_status table for tracking processing progress
    CREATE TABLE document_processing_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    document_id UUID NOT NULL REFERENCES pdfs(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    total_chunks INTEGER DEFAULT 0,
    processed_chunks INTEGER DEFAULT 0,
    extraction_method TEXT CHECK (extraction_method IN ('syncfusion', 'ocr')),
    error_message TEXT,
    processing_started_at TIMESTAMP WITH TIME ZONE,
    processing_completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, document_id)
    );

    -- Update quizzes table to support RAG features
    ALTER TABLE quizzes 
    ADD COLUMN source_document_ids UUID[] NOT NULL DEFAULT '{}',
    ADD COLUMN page_range JSONB, -- {start: number, end: number} or null for entire document
    ADD COLUMN notes TEXT,
    ADD COLUMN focus_areas TEXT[],
    ADD COLUMN learning_objectives TEXT[],
    ADD COLUMN generation_method TEXT DEFAULT 'rag' CHECK (generation_method IN ('rag', 'simple'));

    -- Remove the old source_pdf_ids column (rename to source_document_ids)
    ALTER TABLE quizzes DROP COLUMN IF EXISTS source_pdf_ids;

    -- Update quiz_questions table to support RAG features
    ALTER TABLE quiz_questions 
    ADD COLUMN source_chunks UUID[] DEFAULT '{}', -- References to document_chunks used for this question
    ADD COLUMN source_pages INTEGER[] DEFAULT '{}', -- Page numbers where content was sourced
    ADD COLUMN confidence_score DECIMAL(3,2); -- AI confidence in question quality (0.00-1.00)

    -- Add fill-in-the-blank question type
    ALTER TABLE quiz_questions DROP CONSTRAINT IF EXISTS quiz_questions_question_type_check;
    ALTER TABLE quiz_questions ADD CONSTRAINT quiz_questions_question_type_check 
    CHECK (question_type IN ('mcq', 'truefalse', 'fillblank'));

    -- Create question_chunk_sources table for mapping questions to source chunks
    CREATE TABLE question_chunk_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES quiz_questions(id) ON DELETE CASCADE,
    chunk_id UUID REFERENCES document_chunks(id) ON DELETE CASCADE,
    relevance_score DECIMAL(5,4) NOT NULL, -- Similarity score from vector search
    usage_type TEXT NOT NULL CHECK (usage_type IN ('primary', 'supporting', 'context')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create indexes for efficient vector search and queries
    CREATE INDEX ON document_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
    CREATE INDEX ON document_chunks (user_id, document_id);
    CREATE INDEX ON document_chunks (user_id, page_number);
    CREATE INDEX ON document_chunks (document_id, chunk_index);
    CREATE INDEX ON document_chunks (page_number);

    -- Indexes for processing status
    CREATE INDEX ON document_processing_status (user_id, document_id);
    CREATE INDEX ON document_processing_status (status);
    CREATE INDEX ON document_processing_status (created_at DESC);

    -- Indexes for question-chunk mapping
    CREATE INDEX ON question_chunk_sources (question_id);
    CREATE INDEX ON question_chunk_sources (chunk_id);
    CREATE INDEX ON question_chunk_sources (relevance_score DESC);

    -- Create updated_at triggers
    CREATE TRIGGER update_document_chunks_updated_at 
        BEFORE UPDATE ON document_chunks 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_document_processing_status_updated_at 
        BEFORE UPDATE ON document_processing_status 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();

    -- Row Level Security (RLS) Policies

    -- Enable RLS on new tables
    ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
    ALTER TABLE document_processing_status ENABLE ROW LEVEL SECURITY;
    ALTER TABLE question_chunk_sources ENABLE ROW LEVEL SECURITY;

    -- Document chunks policies - users can only access their own document chunks
    CREATE POLICY "Users can view their own document chunks" ON document_chunks
        FOR SELECT USING (auth.jwt() ->> 'sub' = user_id);

    CREATE POLICY "Users can create their own document chunks" ON document_chunks
        FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = user_id);

    CREATE POLICY "Users can update their own document chunks" ON document_chunks
        FOR UPDATE USING (auth.jwt() ->> 'sub' = user_id);

    CREATE POLICY "Users can delete their own document chunks" ON document_chunks
        FOR DELETE USING (auth.jwt() ->> 'sub' = user_id);

    -- Document processing status policies
    CREATE POLICY "Users can view their own processing status" ON document_processing_status
        FOR SELECT USING (auth.jwt() ->> 'sub' = user_id);

    CREATE POLICY "Users can create their own processing status" ON document_processing_status
        FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = user_id);

    CREATE POLICY "Users can update their own processing status" ON document_processing_status
        FOR UPDATE USING (auth.jwt() ->> 'sub' = user_id);

    CREATE POLICY "Users can delete their own processing status" ON document_processing_status
        FOR DELETE USING (auth.jwt() ->> 'sub' = user_id);

    -- Question chunk sources policies - users can access mappings for their own questions
    CREATE POLICY "Users can view chunk sources for their own questions" ON question_chunk_sources
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM quiz_questions 
                JOIN quizzes ON quizzes.id = quiz_questions.quiz_id
                WHERE quiz_questions.id = question_chunk_sources.question_id 
                AND quizzes.user_id = auth.jwt() ->> 'sub'
            )
        );

    CREATE POLICY "Users can create chunk sources for their own questions" ON question_chunk_sources
        FOR INSERT WITH CHECK (
            EXISTS (
                SELECT 1 FROM quiz_questions 
                JOIN quizzes ON quizzes.id = quiz_questions.quiz_id
                WHERE quiz_questions.id = question_chunk_sources.question_id 
                AND quizzes.user_id = auth.jwt() ->> 'sub'
            )
        );

    CREATE POLICY "Users can update chunk sources for their own questions" ON question_chunk_sources
        FOR UPDATE USING (
            EXISTS (
                SELECT 1 FROM quiz_questions 
                JOIN quizzes ON quizzes.id = quiz_questions.quiz_id
                WHERE quiz_questions.id = question_chunk_sources.question_id 
                AND quizzes.user_id = auth.jwt() ->> 'sub'
            )
        );

    CREATE POLICY "Users can delete chunk sources for their own questions" ON question_chunk_sources
        FOR DELETE USING (
            EXISTS (
                SELECT 1 FROM quiz_questions 
                JOIN quizzes ON quizzes.id = quiz_questions.quiz_id
                WHERE quiz_questions.id = question_chunk_sources.question_id 
                AND quizzes.user_id = auth.jwt() ->> 'sub'
            )
        );