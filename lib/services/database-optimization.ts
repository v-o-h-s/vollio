import { createClient } from '@supabase/supabase-js';

/**
 * Database query optimization service
 */

export interface QueryOptimizationOptions {
  enableProfiling?: boolean;
  logSlowQueries?: boolean;
  slowQueryThreshold?: number; // milliseconds
  enableQueryCache?: boolean;
  cacheTimeout?: number; // milliseconds
}

export interface QueryProfile {
  query: string;
  executionTime: number;
  rowsReturned: number;
  planningTime?: number;
  executionPlan?: any;
  timestamp: Date;
}

export interface IndexSuggestion {
  table: string;
  columns: string[];
  indexType: 'btree' | 'gin' | 'gist' | 'hash' | 'ivfflat';
  reason: string;
  estimatedImprovement: string;
  priority: 'high' | 'medium' | 'low';
}

export interface QueryCacheEntry {
  result: any;
  timestamp: number;
  executionTime: number;
  hitCount: number;
}

export class DatabaseOptimizationService {
  private static readonly DEFAULT_SLOW_QUERY_THRESHOLD = 1000; // 1 second
  private static readonly DEFAULT_CACHE_TIMEOUT = 5 * 60 * 1000; // 5 minutes
  private static readonly MAX_CACHE_SIZE = 1000;

  private queryProfiles: QueryProfile[] = [];
  private queryCache = new Map<string, QueryCacheEntry>();
  private options: Required<QueryOptimizationOptions>;

  constructor(options: QueryOptimizationOptions = {}) {
    this.options = {
      enableProfiling: options.enableProfiling ?? true,
      logSlowQueries: options.logSlowQueries ?? true,
      slowQueryThreshold: options.slowQueryThreshold ?? DatabaseOptimizationService.DEFAULT_SLOW_QUERY_THRESHOLD,
      enableQueryCache: options.enableQueryCache ?? true,
      cacheTimeout: options.cacheTimeout ?? DatabaseOptimizationService.DEFAULT_CACHE_TIMEOUT
    };
  }

  /**
   * Execute optimized query with profiling and caching
   */
  async executeOptimizedQuery<T>(
    supabase: any,
    queryBuilder: any,
    cacheKey?: string
  ): Promise<{ data: T[] | null; error: any; profile?: QueryProfile }> {
    const startTime = Date.now();
    let profile: QueryProfile | undefined;

    // Check cache first
    if (this.options.enableQueryCache && cacheKey) {
      const cached = this.getCachedResult(cacheKey);
      if (cached) {
        cached.hitCount++;
        console.log(`🎯 Query cache hit: ${cacheKey}`);
        return { data: cached.result.data, error: cached.result.error };
      }
    }

    // Execute query
    const result = await queryBuilder;
    const executionTime = Date.now() - startTime;

    // Profile query if enabled
    if (this.options.enableProfiling) {
      profile = {
        query: this.extractQueryFromBuilder(queryBuilder),
        executionTime,
        rowsReturned: result.data?.length || 0,
        timestamp: new Date()
      };

      this.queryProfiles.push(profile);

      // Log slow queries
      if (this.options.logSlowQueries && executionTime > this.options.slowQueryThreshold) {
        console.warn(`🐌 Slow query detected (${executionTime}ms):`, profile.query);
      }
    }

    // Cache result
    if (this.options.enableQueryCache && cacheKey && !result.error) {
      this.cacheResult(cacheKey, result, executionTime);
    }

    return { ...result, profile };
  }

  /**
   * Get optimized quiz history query
   */
  getOptimizedQuizHistoryQuery(
    supabase: any,
    userId: string,
    options: {
      page: number;
      limit: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      filters?: any;
    }
  ) {
    let query = supabase
      .from('quiz_attempts')
      .select(`
        id,
        quiz_id,
        score,
        total_questions,
        time_taken,
        completed_at,
        quizzes!inner(
          id,
          title,
          difficulty,
          question_count,
          source_document_ids,
          created_at
        )
      `)
      .eq('user_id', userId);

    // Apply filters
    if (options.filters) {
      if (options.filters.dateFrom) {
        query = query.gte('completed_at', options.filters.dateFrom);
      }
      if (options.filters.dateTo) {
        query = query.lte('completed_at', options.filters.dateTo);
      }
      if (options.filters.minScore !== undefined) {
        query = query.gte('score', options.filters.minScore);
      }
      if (options.filters.maxScore !== undefined) {
        query = query.lte('score', options.filters.maxScore);
      }
      if (options.filters.difficulty?.length > 0) {
        query = query.in('quizzes.difficulty', options.filters.difficulty);
      }
    }

    // Apply sorting
    const sortBy = options.sortBy || 'completed_at';
    const sortOrder = options.sortOrder || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const offset = (options.page - 1) * options.limit;
    query = query.range(offset, offset + options.limit - 1);

    return query;
  }

  /**
   * Get optimized quiz questions query
   */
  getOptimizedQuizQuestionsQuery(
    supabase: any,
    quizId: string,
    options: {
      page: number;
      limit: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      filters?: any;
    }
  ) {
    let query = supabase
      .from('quiz_questions')
      .select(`
        id,
        question_text,
        question_type,
        options,
        correct_answer,
        explanation,
        difficulty,
        order_index,
        source_pages,
        confidence_score
      `)
      .eq('quiz_id', quizId);

    // Apply filters
    if (options.filters) {
      if (options.filters.difficulty?.length > 0) {
        query = query.in('difficulty', options.filters.difficulty);
      }
      if (options.filters.questionTypes?.length > 0) {
        query = query.in('question_type', options.filters.questionTypes);
      }
      if (options.filters.sourcePages?.length > 0) {
        query = query.overlaps('source_pages', options.filters.sourcePages);
      }
      if (options.filters.confidenceThreshold !== undefined) {
        query = query.gte('confidence_score', options.filters.confidenceThreshold);
      }
    }

    // Apply sorting
    const sortBy = options.sortBy || 'order_index';
    const sortOrder = options.sortOrder || 'asc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const offset = (options.page - 1) * options.limit;
    query = query.range(offset, offset + options.limit - 1);

    return query;
  }

  /**
   * Get optimized document chunks query
   */
  getOptimizedDocumentChunksQuery(
    supabase: any,
    documentId: string,
    userId: string,
    options: {
      page: number;
      limit: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      filters?: any;
    }
  ) {
    let query = supabase
      .from('document_chunks')
      .select(`
        id,
        content,
        page_number,
        chunk_index,
        token_count,
        section_title,
        quality_score,
        metadata
      `)
      .eq('document_id', documentId)
      .eq('user_id', userId);

    // Apply filters
    if (options.filters) {
      if (options.filters.pageRange) {
        query = query
          .gte('page_number', options.filters.pageRange.start)
          .lte('page_number', options.filters.pageRange.end);
      }
      if (options.filters.contentTypes?.length > 0) {
        query = query.in('metadata->contentType', options.filters.contentTypes);
      }
      if (options.filters.minQualityScore !== undefined) {
        query = query.gte('quality_score', options.filters.minQualityScore);
      }
    }

    // Apply sorting
    const sortBy = options.sortBy || 'chunk_index';
    const sortOrder = options.sortOrder || 'asc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const offset = (options.page - 1) * options.limit;
    query = query.range(offset, offset + options.limit - 1);

    return query;
  }

  /**
   * Get optimized vector search query
   */
  getOptimizedVectorSearchQuery(
    supabase: any,
    userId: string,
    embedding: number[],
    options: {
      documentIds?: string[];
      pageRange?: { start: number; end: number };
      limit?: number;
      similarityThreshold?: number;
    } = {}
  ) {
    const limit = options.limit || 10;
    const threshold = options.similarityThreshold || 0.7;

    let query = supabase.rpc('match_document_chunks', {
      query_embedding: embedding,
      match_threshold: threshold,
      match_count: limit,
      filter_user_id: userId
    });

    // Apply additional filters in the RPC function or post-process
    if (options.documentIds?.length > 0) {
      // This would need to be handled in the RPC function
      query = query.in('document_id', options.documentIds);
    }

    return query;
  }

  /**
   * Analyze query performance and suggest optimizations
   */
  analyzeQueryPerformance(): {
    slowQueries: QueryProfile[];
    indexSuggestions: IndexSuggestion[];
    performanceMetrics: {
      averageExecutionTime: number;
      slowQueryCount: number;
      totalQueries: number;
      cacheHitRate: number;
    };
  } {
    const slowQueries = this.queryProfiles.filter(
      profile => profile.executionTime > this.options.slowQueryThreshold
    );

    const indexSuggestions = this.generateIndexSuggestions(slowQueries);

    const totalQueries = this.queryProfiles.length;
    const averageExecutionTime = totalQueries > 0 
      ? this.queryProfiles.reduce((sum, profile) => sum + profile.executionTime, 0) / totalQueries
      : 0;

    const totalCacheRequests = Array.from(this.queryCache.values()).reduce(
      (sum, entry) => sum + entry.hitCount, 0
    );
    const cacheHitRate = totalCacheRequests > 0 
      ? (totalCacheRequests - this.queryCache.size) / totalCacheRequests
      : 0;

    return {
      slowQueries,
      indexSuggestions,
      performanceMetrics: {
        averageExecutionTime,
        slowQueryCount: slowQueries.length,
        totalQueries,
        cacheHitRate
      }
    };
  }

  /**
   * Generate index suggestions based on slow queries
   */
  private generateIndexSuggestions(slowQueries: QueryProfile[]): IndexSuggestion[] {
    const suggestions: IndexSuggestion[] = [];

    // Analyze common patterns in slow queries
    const queryPatterns = this.analyzeQueryPatterns(slowQueries);

    // Quiz history optimizations
    if (queryPatterns.quizHistoryFilters.includes('completed_at')) {
      suggestions.push({
        table: 'quiz_attempts',
        columns: ['user_id', 'completed_at'],
        indexType: 'btree',
        reason: 'Frequent filtering by user and completion date',
        estimatedImprovement: '50-70% faster quiz history queries',
        priority: 'high'
      });
    }

    if (queryPatterns.quizHistoryFilters.includes('score')) {
      suggestions.push({
        table: 'quiz_attempts',
        columns: ['user_id', 'score'],
        indexType: 'btree',
        reason: 'Score-based filtering in quiz history',
        estimatedImprovement: '30-50% faster score filtering',
        priority: 'medium'
      });
    }

    // Document chunks optimizations
    if (queryPatterns.documentChunkFilters.includes('page_number')) {
      suggestions.push({
        table: 'document_chunks',
        columns: ['document_id', 'page_number'],
        indexType: 'btree',
        reason: 'Page range filtering in document chunks',
        estimatedImprovement: '40-60% faster page-based queries',
        priority: 'high'
      });
    }

    if (queryPatterns.documentChunkFilters.includes('quality_score')) {
      suggestions.push({
        table: 'document_chunks',
        columns: ['user_id', 'quality_score'],
        indexType: 'btree',
        reason: 'Quality-based filtering in chunks',
        estimatedImprovement: '25-40% faster quality filtering',
        priority: 'medium'
      });
    }

    // Vector search optimizations
    if (queryPatterns.vectorSearchUsage > 0) {
      suggestions.push({
        table: 'document_chunks',
        columns: ['embedding'],
        indexType: 'ivfflat',
        reason: 'Vector similarity search optimization',
        estimatedImprovement: '60-80% faster vector searches',
        priority: 'high'
      });
    }

    // JSONB optimizations
    if (queryPatterns.jsonbQueries.includes('metadata')) {
      suggestions.push({
        table: 'document_chunks',
        columns: ['metadata'],
        indexType: 'gin',
        reason: 'JSONB metadata filtering',
        estimatedImprovement: '70-90% faster metadata queries',
        priority: 'medium'
      });
    }

    return suggestions;
  }

  /**
   * Analyze query patterns from slow queries
   */
  private analyzeQueryPatterns(slowQueries: QueryProfile[]): {
    quizHistoryFilters: string[];
    documentChunkFilters: string[];
    vectorSearchUsage: number;
    jsonbQueries: string[];
  } {
    const patterns = {
      quizHistoryFilters: [] as string[],
      documentChunkFilters: [] as string[],
      vectorSearchUsage: 0,
      jsonbQueries: [] as string[]
    };

    for (const profile of slowQueries) {
      const query = profile.query.toLowerCase();

      // Analyze quiz history patterns
      if (query.includes('quiz_attempts')) {
        if (query.includes('completed_at')) patterns.quizHistoryFilters.push('completed_at');
        if (query.includes('score')) patterns.quizHistoryFilters.push('score');
      }

      // Analyze document chunk patterns
      if (query.includes('document_chunks')) {
        if (query.includes('page_number')) patterns.documentChunkFilters.push('page_number');
        if (query.includes('quality_score')) patterns.documentChunkFilters.push('quality_score');
        if (query.includes('metadata')) patterns.jsonbQueries.push('metadata');
      }

      // Analyze vector search usage
      if (query.includes('embedding') || query.includes('match_document_chunks')) {
        patterns.vectorSearchUsage++;
      }
    }

    return patterns;
  }

  /**
   * Extract query string from Supabase query builder (simplified)
   */
  private extractQueryFromBuilder(queryBuilder: any): string {
    // This is a simplified extraction - in practice, you'd need more sophisticated parsing
    try {
      return queryBuilder.toString() || 'Unknown query';
    } catch {
      return 'Query extraction failed';
    }
  }

  /**
   * Get cached result
   */
  private getCachedResult(cacheKey: string): QueryCacheEntry | null {
    const entry = this.queryCache.get(cacheKey);
    
    if (!entry) {
      return null;
    }

    // Check if cache entry is expired
    if (Date.now() - entry.timestamp > this.options.cacheTimeout) {
      this.queryCache.delete(cacheKey);
      return null;
    }

    return entry;
  }

  /**
   * Cache query result
   */
  private cacheResult(cacheKey: string, result: any, executionTime: number): void {
    // Check cache size limit
    if (this.queryCache.size >= DatabaseOptimizationService.MAX_CACHE_SIZE) {
      this.evictOldestCacheEntries();
    }

    const entry: QueryCacheEntry = {
      result,
      timestamp: Date.now(),
      executionTime,
      hitCount: 0
    };

    this.queryCache.set(cacheKey, entry);
  }

  /**
   * Evict oldest cache entries
   */
  private evictOldestCacheEntries(): void {
    const entries = Array.from(this.queryCache.entries());
    
    // Sort by timestamp (oldest first)
    entries.sort(([, a], [, b]) => a.timestamp - b.timestamp);
    
    // Remove oldest 20% of entries
    const toRemove = Math.floor(entries.length * 0.2);
    for (let i = 0; i < toRemove; i++) {
      this.queryCache.delete(entries[i][0]);
    }
  }

  /**
   * Clear all caches and profiles
   */
  clearAll(): void {
    this.queryCache.clear();
    this.queryProfiles = [];
    console.log('🗑️ Database optimization caches and profiles cleared');
  }

  /**
   * Generate SQL for creating suggested indexes
   */
  generateIndexSQL(suggestions: IndexSuggestion[]): string[] {
    return suggestions.map(suggestion => {
      const indexName = `idx_${suggestion.table}_${suggestion.columns.join('_')}`;
      const columns = suggestion.columns.join(', ');
      
      switch (suggestion.indexType) {
        case 'ivfflat':
          return `CREATE INDEX ${indexName} ON ${suggestion.table} USING ivfflat (${columns}) WITH (lists = 100);`;
        case 'gin':
          return `CREATE INDEX ${indexName} ON ${suggestion.table} USING gin (${columns});`;
        case 'gist':
          return `CREATE INDEX ${indexName} ON ${suggestion.table} USING gist (${columns});`;
        case 'hash':
          return `CREATE INDEX ${indexName} ON ${suggestion.table} USING hash (${columns});`;
        default:
          return `CREATE INDEX ${indexName} ON ${suggestion.table} (${columns});`;
      }
    });
  }
}

// Export singleton instance
export const databaseOptimizationService = new DatabaseOptimizationService();