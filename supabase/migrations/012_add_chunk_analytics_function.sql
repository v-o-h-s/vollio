-- Migration: Add chunk analytics update function
-- This migration creates a function to efficiently update chunk analytics

-- Create function to update chunk analytics
CREATE OR REPLACE FUNCTION update_chunk_analytics(
  p_chunk_id UUID,
  p_usage_type TEXT,
  p_relevance_score DECIMAL(5,4),
  p_success BOOLEAN DEFAULT TRUE
)
RETURNS VOID AS $$
DECLARE
  v_user_id TEXT;
  v_document_id UUID;
BEGIN
  -- Get user_id and document_id from the chunk
  SELECT user_id, document_id 
  INTO v_user_id, v_document_id
  FROM document_chunks 
  WHERE id = p_chunk_id;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Chunk not found: %', p_chunk_id;
  END IF;
  
  -- Insert or update analytics record
  INSERT INTO chunk_analytics (
    chunk_id,
    user_id,
    document_id,
    usage_count,
    total_relevance_score,
    last_used,
    usage_type,
    success_count,
    created_at,
    updated_at
  ) VALUES (
    p_chunk_id,
    v_user_id,
    v_document_id,
    1,
    p_relevance_score,
    NOW(),
    p_usage_type,
    CASE WHEN p_success THEN 1 ELSE 0 END,
    NOW(),
    NOW()
  )
  ON CONFLICT (chunk_id, user_id) 
  DO UPDATE SET
    usage_count = chunk_analytics.usage_count + 1,
    total_relevance_score = chunk_analytics.total_relevance_score + p_relevance_score,
    last_used = NOW(),
    usage_type = p_usage_type,
    success_count = chunk_analytics.success_count + CASE WHEN p_success THEN 1 ELSE 0 END,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_chunk_analytics(UUID, TEXT, DECIMAL, BOOLEAN) TO authenticated;

-- Create function to get chunk performance summary
CREATE OR REPLACE FUNCTION get_chunk_performance_summary(p_user_id TEXT)
RETURNS TABLE (
  total_chunks BIGINT,
  avg_quality DECIMAL(5,4),
  high_quality_chunks BIGINT,
  low_quality_chunks BIGINT,
  total_usage BIGINT,
  quiz_generation_usage BIGINT,
  content_search_usage BIGINT,
  similarity_search_usage BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(dc.id) as total_chunks,
    COALESCE(AVG(dc.quality_score), 0)::DECIMAL(5,4) as avg_quality,
    COUNT(CASE WHEN dc.quality_score >= 0.7 THEN 1 END) as high_quality_chunks,
    COUNT(CASE WHEN dc.quality_score < 0.5 THEN 1 END) as low_quality_chunks,
    COALESCE(SUM(ca.usage_count), 0) as total_usage,
    COALESCE(SUM(CASE WHEN ca.usage_type = 'quiz_generation' THEN ca.usage_count ELSE 0 END), 0) as quiz_generation_usage,
    COALESCE(SUM(CASE WHEN ca.usage_type = 'content_search' THEN ca.usage_count ELSE 0 END), 0) as content_search_usage,
    COALESCE(SUM(CASE WHEN ca.usage_type = 'similarity_search' THEN ca.usage_count ELSE 0 END), 0) as similarity_search_usage
  FROM document_chunks dc
  LEFT JOIN chunk_analytics ca ON dc.id = ca.chunk_id
  WHERE dc.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_chunk_performance_summary(TEXT) TO authenticated;

-- Create function to clean up old chunk data
CREATE OR REPLACE FUNCTION cleanup_old_chunk_data(
  p_user_id TEXT,
  p_retention_days INTEGER DEFAULT 90
)
RETURNS TABLE (
  versions_removed BIGINT,
  analytics_removed BIGINT
) AS $$
DECLARE
  v_cutoff_date TIMESTAMP WITH TIME ZONE;
  v_versions_removed BIGINT := 0;
  v_analytics_removed BIGINT := 0;
BEGIN
  v_cutoff_date := NOW() - (p_retention_days || ' days')::INTERVAL;
  
  -- Remove old chunk versions
  WITH deleted_versions AS (
    DELETE FROM chunk_versions cv
    WHERE cv.created_at < v_cutoff_date
    AND EXISTS (
      SELECT 1 FROM document_chunks dc 
      WHERE dc.id = cv.chunk_id 
      AND dc.user_id = p_user_id
    )
    RETURNING 1
  )
  SELECT COUNT(*) INTO v_versions_removed FROM deleted_versions;
  
  -- Remove old analytics records
  WITH deleted_analytics AS (
    DELETE FROM chunk_analytics ca
    WHERE ca.created_at < v_cutoff_date
    AND ca.user_id = p_user_id
    RETURNING 1
  )
  SELECT COUNT(*) INTO v_analytics_removed FROM deleted_analytics;
  
  RETURN QUERY SELECT v_versions_removed, v_analytics_removed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION cleanup_old_chunk_data(TEXT, INTEGER) TO authenticated;

-- Create function to find duplicate chunks
CREATE OR REPLACE FUNCTION find_duplicate_chunks(
  p_user_id TEXT,
  p_similarity_threshold DECIMAL(3,2) DEFAULT 0.95
)
RETURNS TABLE (
  chunk_id UUID,
  duplicate_of UUID,
  similarity_score DECIMAL(5,4)
) AS $$
BEGIN
  RETURN QUERY
  WITH chunk_pairs AS (
    SELECT 
      dc1.id as chunk1_id,
      dc2.id as chunk2_id,
      -- Simple content similarity using character overlap
      (
        LENGTH(dc1.content) + LENGTH(dc2.content) - 
        LENGTH(REPLACE(REPLACE(dc1.content || dc2.content, dc1.content, ''), dc2.content, ''))
      )::DECIMAL / GREATEST(LENGTH(dc1.content), LENGTH(dc2.content)) as similarity
    FROM document_chunks dc1
    CROSS JOIN document_chunks dc2
    WHERE dc1.user_id = p_user_id
    AND dc2.user_id = p_user_id
    AND dc1.id < dc2.id  -- Avoid duplicates and self-comparison
    AND dc1.token_count BETWEEN dc2.token_count * 0.8 AND dc2.token_count * 1.2  -- Similar length
  )
  SELECT 
    chunk2_id as chunk_id,
    chunk1_id as duplicate_of,
    similarity::DECIMAL(5,4) as similarity_score
  FROM chunk_pairs
  WHERE similarity >= p_similarity_threshold
  ORDER BY similarity DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION find_duplicate_chunks(TEXT, DECIMAL) TO authenticated;