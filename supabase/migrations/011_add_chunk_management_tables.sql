-- Migration: Add chunk management tables for versioning and analytics
-- This migration creates tables for chunk versioning, analytics, and quality tracking

-- Create chunk_versions table for versioning support
CREATE TABLE chunk_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chunk_id UUID NOT NULL REFERENCES document_chunks(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536),
  token_count INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}',
  quality_metrics JSONB DEFAULT '{}',
  parent_version UUID REFERENCES chunk_versions(id) ON DELETE SET NULL,
  change_reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(chunk_id, version)
);

-- Create chunk_analytics table for performance tracking
CREATE TABLE chunk_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chunk_id UUID NOT NULL REFERENCES document_chunks(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  document_id UUID NOT NULL,
  usage_count INTEGER DEFAULT 0,
  total_relevance_score DECIMAL(10,4) DEFAULT 0,
  last_used TIMESTAMP WITH TIME ZONE,
  usage_type TEXT CHECK (usage_type IN ('quiz_generation', 'content_search', 'similarity_search')),
  success_count INTEGER DEFAULT 0,
  user_feedback DECIMAL(3,2) DEFAULT 0, -- 0.00-1.00 user rating
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(chunk_id, user_id)
);

-- Create chunk_quality_scores table for quality tracking
CREATE TABLE chunk_quality_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chunk_id UUID NOT NULL REFERENCES document_chunks(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  content_length INTEGER NOT NULL,
  token_density DECIMAL(5,4) NOT NULL,
  structural_coherence DECIMAL(3,2) NOT NULL,
  semantic_coherence DECIMAL(3,2) NOT NULL,
  information_density DECIMAL(3,2) NOT NULL,
  readability DECIMAL(3,2) NOT NULL,
  duplicate_score DECIMAL(3,2) NOT NULL,
  overall_quality DECIMAL(3,2) NOT NULL,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(chunk_id, user_id)
);

-- Create indexes for efficient queries
CREATE INDEX ON chunk_versions (chunk_id, version DESC);
CREATE INDEX ON chunk_versions (created_at DESC);
CREATE INDEX ON chunk_versions (parent_version);

CREATE INDEX ON chunk_analytics (chunk_id);
CREATE INDEX ON chunk_analytics (user_id, document_id);
CREATE INDEX ON chunk_analytics (last_used DESC);
CREATE INDEX ON chunk_analytics (usage_count DESC);
CREATE INDEX ON chunk_analytics (total_relevance_score DESC);

CREATE INDEX ON chunk_quality_scores (chunk_id);
CREATE INDEX ON chunk_quality_scores (user_id);
CREATE INDEX ON chunk_quality_scores (overall_quality DESC);
CREATE INDEX ON chunk_quality_scores (calculated_at DESC);

-- Create updated_at triggers
CREATE TRIGGER update_chunk_analytics_updated_at 
    BEFORE UPDATE ON chunk_analytics 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on new tables
ALTER TABLE chunk_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chunk_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE chunk_quality_scores ENABLE ROW LEVEL SECURITY;

-- Chunk versions policies - users can access versions for their own chunks
CREATE POLICY "Users can view versions for their own chunks" ON chunk_versions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM document_chunks 
            WHERE document_chunks.id = chunk_versions.chunk_id 
            AND document_chunks.user_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Users can create versions for their own chunks" ON chunk_versions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM document_chunks 
            WHERE document_chunks.id = chunk_versions.chunk_id 
            AND document_chunks.user_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Users can update versions for their own chunks" ON chunk_versions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM document_chunks 
            WHERE document_chunks.id = chunk_versions.chunk_id 
            AND document_chunks.user_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Users can delete versions for their own chunks" ON chunk_versions
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM document_chunks 
            WHERE document_chunks.id = chunk_versions.chunk_id 
            AND document_chunks.user_id = auth.jwt() ->> 'sub'
        )
    );

-- Chunk analytics policies
CREATE POLICY "Users can view their own chunk analytics" ON chunk_analytics
    FOR SELECT USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can create their own chunk analytics" ON chunk_analytics
    FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can update their own chunk analytics" ON chunk_analytics
    FOR UPDATE USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can delete their own chunk analytics" ON chunk_analytics
    FOR DELETE USING (auth.jwt() ->> 'sub' = user_id);

-- Chunk quality scores policies
CREATE POLICY "Users can view their own chunk quality scores" ON chunk_quality_scores
    FOR SELECT USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can create their own chunk quality scores" ON chunk_quality_scores
    FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can update their own chunk quality scores" ON chunk_quality_scores
    FOR UPDATE USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can delete their own chunk quality scores" ON chunk_quality_scores
    FOR DELETE USING (auth.jwt() ->> 'sub' = user_id);

-- Add quality metrics column to existing document_chunks table
ALTER TABLE document_chunks 
ADD COLUMN quality_score DECIMAL(3,2) DEFAULT NULL,
ADD COLUMN last_quality_check TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index for quality score
CREATE INDEX ON document_chunks (quality_score DESC);
CREATE INDEX ON document_chunks (last_quality_check DESC);