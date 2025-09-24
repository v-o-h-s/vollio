-- Migration: Add search analytics and monitoring tables
-- This migration creates tables for search query logging and performance monitoring

-- Create search_query_logs table for analytics
CREATE TABLE search_query_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  query TEXT NOT NULL,
  search_method TEXT NOT NULL CHECK (search_method IN ('vector', 'keyword', 'hybrid')),
  document_ids UUID[] NOT NULL,
  result_count INTEGER NOT NULL DEFAULT 0,
  search_time INTEGER NOT NULL DEFAULT 0, -- in milliseconds
  query_complexity TEXT NOT NULL CHECK (query_complexity IN ('simple', 'moderate', 'complex')),
  cache_hit BOOLEAN NOT NULL DEFAULT FALSE,
  filters JSONB DEFAULT '{}',
  performance JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create search_performance_metrics table for aggregated metrics
CREATE TABLE search_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  date DATE NOT NULL,
  total_searches INTEGER NOT NULL DEFAULT 0,
  average_search_time DECIMAL(10,2) NOT NULL DEFAULT 0,
  average_result_count DECIMAL(10,2) NOT NULL DEFAULT 0,
  cache_hit_rate DECIMAL(5,4) NOT NULL DEFAULT 0,
  search_method_distribution JSONB DEFAULT '{}',
  query_complexity_distribution JSONB DEFAULT '{}',
  popular_filters JSONB DEFAULT '[]',
  slow_queries JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create search_optimization_recommendations table
CREATE TABLE search_optimization_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('query', 'index', 'cache', 'filter')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  expected_improvement DECIMAL(5,4),
  confidence DECIMAL(5,4),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'dismissed')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX ON search_query_logs (user_id, created_at DESC);
CREATE INDEX ON search_query_logs (search_method);
CREATE INDEX ON search_query_logs (query_complexity);
CREATE INDEX ON search_query_logs (cache_hit);
CREATE INDEX ON search_query_logs (search_time);
CREATE INDEX ON search_query_logs (result_count);
CREATE INDEX ON search_query_logs USING GIN (document_ids);
CREATE INDEX ON search_query_logs USING GIN (filters);
CREATE INDEX ON search_query_logs USING GIN (performance);

-- Indexes for performance metrics
CREATE INDEX ON search_performance_metrics (user_id, date DESC);
CREATE INDEX ON search_performance_metrics (date DESC);
CREATE INDEX ON search_performance_metrics (average_search_time DESC);
CREATE INDEX ON search_performance_metrics (cache_hit_rate DESC);

-- Indexes for recommendations
CREATE INDEX ON search_optimization_recommendations (user_id, status);
CREATE INDEX ON search_optimization_recommendations (recommendation_type);
CREATE INDEX ON search_optimization_recommendations (priority);
CREATE INDEX ON search_optimization_recommendations (created_at DESC);

-- Create updated_at triggers
CREATE TRIGGER update_search_performance_metrics_updated_at 
    BEFORE UPDATE ON search_performance_metrics 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_search_optimization_recommendations_updated_at 
    BEFORE UPDATE ON search_optimization_recommendations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on new tables
ALTER TABLE search_query_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_optimization_recommendations ENABLE ROW LEVEL SECURITY;

-- Search query logs policies - users can only access their own logs
CREATE POLICY "Users can view their own search logs" ON search_query_logs
    FOR SELECT USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can create their own search logs" ON search_query_logs
    FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can update their own search logs" ON search_query_logs
    FOR UPDATE USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can delete their own search logs" ON search_query_logs
    FOR DELETE USING (auth.jwt() ->> 'sub' = user_id);

-- Performance metrics policies - users can access their own metrics and global metrics (user_id IS NULL)
CREATE POLICY "Users can view their own performance metrics" ON search_performance_metrics
    FOR SELECT USING (auth.jwt() ->> 'sub' = user_id OR user_id IS NULL);

CREATE POLICY "Users can create their own performance metrics" ON search_performance_metrics
    FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own performance metrics" ON search_performance_metrics
    FOR UPDATE USING (auth.jwt() ->> 'sub' = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own performance metrics" ON search_performance_metrics
    FOR DELETE USING (auth.jwt() ->> 'sub' = user_id OR user_id IS NULL);

-- Optimization recommendations policies - users can access their own recommendations and global ones
CREATE POLICY "Users can view their own optimization recommendations" ON search_optimization_recommendations
    FOR SELECT USING (auth.jwt() ->> 'sub' = user_id OR user_id IS NULL);

CREATE POLICY "Users can create their own optimization recommendations" ON search_optimization_recommendations
    FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own optimization recommendations" ON search_optimization_recommendations
    FOR UPDATE USING (auth.jwt() ->> 'sub' = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own optimization recommendations" ON search_optimization_recommendations
    FOR DELETE USING (auth.jwt() ->> 'sub' = user_id OR user_id IS NULL);

-- Create function to aggregate daily search metrics
CREATE OR REPLACE FUNCTION aggregate_daily_search_metrics()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Aggregate metrics for yesterday (to ensure complete data)
  INSERT INTO search_performance_metrics (
    user_id,
    date,
    total_searches,
    average_search_time,
    average_result_count,
    cache_hit_rate,
    search_method_distribution,
    query_complexity_distribution
  )
  SELECT 
    user_id,
    DATE(created_at) as date,
    COUNT(*) as total_searches,
    AVG(search_time) as average_search_time,
    AVG(result_count) as average_result_count,
    AVG(CASE WHEN cache_hit THEN 1.0 ELSE 0.0 END) as cache_hit_rate,
    jsonb_object_agg(search_method, method_count) as search_method_distribution,
    jsonb_object_agg(query_complexity, complexity_count) as query_complexity_distribution
  FROM (
    SELECT 
      user_id,
      created_at,
      search_time,
      result_count,
      cache_hit,
      search_method,
      query_complexity,
      COUNT(*) OVER (PARTITION BY user_id, DATE(created_at), search_method) as method_count,
      COUNT(*) OVER (PARTITION BY user_id, DATE(created_at), query_complexity) as complexity_count
    FROM search_query_logs
    WHERE DATE(created_at) = CURRENT_DATE - INTERVAL '1 day'
  ) subq
  GROUP BY user_id, DATE(created_at)
  ON CONFLICT (user_id, date) 
  DO UPDATE SET
    total_searches = EXCLUDED.total_searches,
    average_search_time = EXCLUDED.average_search_time,
    average_result_count = EXCLUDED.average_result_count,
    cache_hit_rate = EXCLUDED.cache_hit_rate,
    search_method_distribution = EXCLUDED.search_method_distribution,
    query_complexity_distribution = EXCLUDED.query_complexity_distribution,
    updated_at = NOW();
END;
$$;

-- Create function to clean up old search logs (keep last 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_search_logs()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM search_query_logs 
  WHERE created_at < CURRENT_DATE - INTERVAL '90 days';
  
  DELETE FROM search_performance_metrics 
  WHERE date < CURRENT_DATE - INTERVAL '365 days';
END;
$$;

-- Create function to generate search optimization recommendations
CREATE OR REPLACE FUNCTION generate_search_optimization_recommendations()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  user_record RECORD;
  avg_search_time DECIMAL;
  cache_hit_rate DECIMAL;
  slow_query_count INTEGER;
BEGIN
  -- Generate recommendations for each user
  FOR user_record IN 
    SELECT DISTINCT user_id 
    FROM search_query_logs 
    WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
  LOOP
    -- Calculate user metrics
    SELECT 
      AVG(search_time),
      AVG(CASE WHEN cache_hit THEN 1.0 ELSE 0.0 END),
      COUNT(*) FILTER (WHERE search_time > 5000)
    INTO avg_search_time, cache_hit_rate, slow_query_count
    FROM search_query_logs
    WHERE user_id = user_record.user_id
      AND created_at >= CURRENT_DATE - INTERVAL '7 days';

    -- Recommend query optimization if searches are slow
    IF avg_search_time > 2000 THEN
      INSERT INTO search_optimization_recommendations (
        user_id, recommendation_type, title, description, 
        expected_improvement, confidence, priority
      ) VALUES (
        user_record.user_id, 'query', 'Enable Query Optimization',
        'Your average search time is ' || ROUND(avg_search_time) || 'ms. Enable stemming and synonym expansion to improve performance.',
        0.25, 0.8, 'medium'
      ) ON CONFLICT DO NOTHING;
    END IF;

    -- Recommend cache optimization if hit rate is low
    IF cache_hit_rate < 0.3 THEN
      INSERT INTO search_optimization_recommendations (
        user_id, recommendation_type, title, description,
        expected_improvement, confidence, priority
      ) VALUES (
        user_record.user_id, 'cache', 'Improve Cache Configuration',
        'Your cache hit rate is ' || ROUND(cache_hit_rate * 100) || '%. Consider increasing cache size or TTL.',
        0.2, 0.7, 'medium'
      ) ON CONFLICT DO NOTHING;
    END IF;

    -- Recommend index optimization if there are many slow queries
    IF slow_query_count > 5 THEN
      INSERT INTO search_optimization_recommendations (
        user_id, recommendation_type, title, description,
        expected_improvement, confidence, priority
      ) VALUES (
        user_record.user_id, 'index', 'Optimize Search Indexes',
        'You have ' || slow_query_count || ' slow queries. Consider optimizing vector and text indexes.',
        0.4, 0.9, 'high'
      ) ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END;
$$;