import { getAuthenticatedSupabaseClient } from '@/lib/supabaseClient';
import { embeddingService } from './embedding-service';
import { vectorSearchService } from './vector-search-service';
import type { DocumentChunk, ChunkMetadata } from '@/lib/types';

/**
 * Hybrid search configuration options
 */
export interface HybridSearchOptions {
  // Vector search options
  vectorWeight?: number;
  keywordWeight?: number;
  similarityThreshold?: number;
  
  // Keyword search options
  enableFuzzyMatch?: boolean;
  stemming?: boolean;
  synonymExpansion?: boolean;
  
  // Filtering options
  contentTypes?: ('paragraph' | 'heading' | 'list' | 'table' | 'caption')[];
  confidenceRange?: { min: number; max: number };
  relevanceRange?: { min: number; max: number };
  pageRange?: { start: number; end: number };
  documentIds?: string[];
  
  // Result options
  limit?: number;
  includeExplanations?: boolean;
  enableDebugging?: boolean;
  
  // Performance options
  enableCaching?: boolean;
  cacheTimeout?: number;
}

/**
 * Hybrid search result with detailed scoring
 */
export interface HybridSearchResult {
  chunk: DocumentChunk;
  vectorScore: number;
  keywordScore: number;
  combinedScore: number;
  rank: number;
  explanation?: SearchExplanation;
  debugInfo?: SearchDebugInfo;
}

/**
 * Search explanation for result transparency
 */
export interface SearchExplanation {
  vectorMatches: string[];
  keywordMatches: string[];
  scoringBreakdown: {
    vectorContribution: number;
    keywordContribution: number;
    boosts: Array<{ type: string; value: number; reason: string }>;
    penalties: Array<{ type: string; value: number; reason: string }>;
  };
  relevanceFactors: string[];
}

/**
 * Debug information for search optimization
 */
export interface SearchDebugInfo {
  originalQuery: string;
  processedQuery: string;
  vectorEmbeddingTime: number;
  keywordProcessingTime: number;
  filteringTime: number;
  rankingTime: number;
  cacheHit: boolean;
  indexesUsed: string[];
  queryPlan?: any;
}

/**
 * Batch hybrid search result
 */
export interface HybridSearchBatchResult {
  success: boolean;
  results: HybridSearchResult[];
  totalResults: number;
  searchTime: number;
  analytics: SearchAnalytics;
  error?: string;
}

/**
 * Search analytics and performance metrics
 */
export interface SearchAnalytics {
  queryComplexity: 'simple' | 'moderate' | 'complex';
  vectorSearchTime: number;
  keywordSearchTime: number;
  combinationTime: number;
  filteringTime: number;
  totalProcessingTime: number;
  resultsBeforeFiltering: number;
  resultsAfterFiltering: number;
  cacheHitRate: number;
  indexEfficiency: number;
}

/**
 * Query optimization result
 */
interface QueryOptimization {
  originalQuery: string;
  optimizedQuery: string;
  keywordTerms: string[];
  synonyms: string[];
  stemmedTerms: string[];
  optimizations: string[];
}

/**
 * Advanced filtering configuration
 */
interface AdvancedFilter {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains' | 'regex';
  value: any;
  boost?: number;
}

export class HybridSearchService {
  private static readonly DEFAULT_VECTOR_WEIGHT = 0.7;
  private static readonly DEFAULT_KEYWORD_WEIGHT = 0.3;
  private static readonly DEFAULT_SIMILARITY_THRESHOLD = 0.6;
  private static readonly DEFAULT_LIMIT = 20;
  private static readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes
  
  private searchCache = new Map<string, {
    result: HybridSearchBatchResult;
    timestamp: Date;
    accessCount: number;
  }>();
  
  private performanceMetrics: SearchAnalytics[] = [];

  /**
   * Perform hybrid search combining vector and keyword search
   */
  async hybridSearch(
    query: string,
    options: HybridSearchOptions = {}
  ): Promise<HybridSearchBatchResult> {
    const startTime = Date.now();
    const config = this.getSearchConfig(options);
    
    try {
      // Check cache first
      if (config.enableCaching) {
        const cacheKey = this.getCacheKey(query, config);
        const cached = this.getCachedResult(cacheKey);
        if (cached) {
          return {
            ...cached,
            analytics: {
              ...cached.analytics,
              cacheHitRate: 1.0
            }
          };
        }
      }

      // Optimize query for both vector and keyword search
      const queryOptimization = await this.optimizeQuery(query, config);
      
      // Perform parallel vector and keyword searches
      const [vectorResults, keywordResults] = await Promise.all([
        this.performVectorSearch(queryOptimization.optimizedQuery, config),
        this.performKeywordSearch(queryOptimization, config)
      ]);

      // Combine and rank results
      const combinationStartTime = Date.now();
      const combinedResults = await this.combineSearchResults(
        vectorResults,
        keywordResults,
        config
      );
      const combinationTime = Date.now() - combinationStartTime;

      // Apply advanced filtering
      const filteringStartTime = Date.now();
      const filteredResults = await this.applyAdvancedFiltering(
        combinedResults,
        config
      );
      const filteringTime = Date.now() - filteringStartTime;

      // Generate explanations and debug info if requested
      if (config.includeExplanations || config.enableDebugging) {
        await this.enrichResultsWithExplanations(
          filteredResults,
          queryOptimization,
          config
        );
      }

      const totalSearchTime = Date.now() - startTime;

      // Calculate analytics
      const analytics: SearchAnalytics = {
        queryComplexity: this.assessQueryComplexity(query),
        vectorSearchTime: 0, // Will be set from actual search times
        keywordSearchTime: 0, // Will be set from actual search times
        combinationTime,
        filteringTime,
        totalProcessingTime: totalSearchTime,
        resultsBeforeFiltering: combinedResults.length,
        resultsAfterFiltering: filteredResults.length,
        cacheHitRate: 0,
        indexEfficiency: this.calculateIndexEfficiency(filteredResults.length, totalSearchTime)
      };

      const result: HybridSearchBatchResult = {
        success: true,
        results: filteredResults.slice(0, config.limit),
        totalResults: filteredResults.length,
        searchTime: totalSearchTime,
        analytics,
        error: undefined
      };

      // Cache the result
      if (config.enableCaching) {
        const cacheKey = this.getCacheKey(query, config);
        this.cacheResult(cacheKey, result);
      }

      // Record performance metrics
      this.performanceMetrics.push(analytics);

      return result;
    } catch (error) {
      return {
        success: false,
        results: [],
        totalResults: 0,
        searchTime: Date.now() - startTime,
        analytics: {
          queryComplexity: 'simple',
          vectorSearchTime: 0,
          keywordSearchTime: 0,
          combinationTime: 0,
          filteringTime: 0,
          totalProcessingTime: Date.now() - startTime,
          resultsBeforeFiltering: 0,
          resultsAfterFiltering: 0,
          cacheHitRate: 0,
          indexEfficiency: 0
        },
        error: error instanceof Error ? error.message : 'Unknown hybrid search error'
      };
    }
  }

  /**
   * Perform vector search component
   */
  private async performVectorSearch(
    query: string,
    config: HybridSearchOptions & {
      vectorWeight: number;
      keywordWeight: number;
      similarityThreshold: number;
      limit: number;
    }
  ): Promise<Array<{ chunk: DocumentChunk; score: number; type: 'vector' }>> {
    const vectorStartTime = Date.now();
    
    try {
      const searchResult = await vectorSearchService.searchSimilarChunks(query, {
        similarityThreshold: config.similarityThreshold,
        limit: config.limit * 2, // Get more results for combination
        pageRange: config.pageRange,
        documentIds: config.documentIds,
        contentTypes: config.contentTypes,
        includeMetadata: true,
        rankingMethod: 'hybrid'
      });

      if (!searchResult.success) {
        throw new Error(searchResult.error || 'Vector search failed');
      }

      return searchResult.results.map(result => ({
        chunk: result.chunk,
        score: result.similarity,
        type: 'vector' as const
      }));
    } catch (error) {
      console.error('Vector search error:', error);
      return [];
    }
  }

  /**
   * Perform keyword search component
   */
  private async performKeywordSearch(
    queryOptimization: QueryOptimization,
    config: HybridSearchOptions & {
      vectorWeight: number;
      keywordWeight: number;
      similarityThreshold: number;
      limit: number;
    }
  ): Promise<Array<{ chunk: DocumentChunk; score: number; type: 'keyword' }>> {
    const keywordStartTime = Date.now();
    
    try {
      const client = await getAuthenticatedSupabaseClient();
      
      // Build keyword search query using PostgreSQL full-text search
      let query = client
        .from('document_chunks')
        .select(`
          id,
          user_id,
          document_id,
          chunk_index,
          content,
          token_count,
          page_number,
          section_title,
          metadata,
          created_at,
          updated_at,
          ts_rank(to_tsvector('english', content), plainto_tsquery('english', $1)) as keyword_score
        `)
        .textSearch('content', queryOptimization.keywordTerms.join(' | '), {
          type: 'websearch',
          config: 'english'
        })
        .gt('ts_rank(to_tsvector(\'english\', content), plainto_tsquery(\'english\', \'' + 
           queryOptimization.keywordTerms.join(' | ') + '\'))', 0)
        .order('keyword_score', { ascending: false })
        .limit(config.limit * 2);

      // Apply filters
      if (config.documentIds && config.documentIds.length > 0) {
        query = query.in('document_id', config.documentIds);
      }

      if (config.pageRange) {
        query = query
          .gte('page_number', config.pageRange.start)
          .lte('page_number', config.pageRange.end);
      }

      if (config.contentTypes && config.contentTypes.length > 0) {
        query = query.in('metadata->contentType', config.contentTypes);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Keyword search failed: ${error.message}`);
      }

      if (!data) {
        return [];
      }

      return data.map(row => ({
        chunk: {
          id: row.id,
          userId: row.user_id,
          documentId: row.document_id,
          chunkIndex: row.chunk_index,
          content: row.content,
          embedding: [], // Don't return embeddings for performance
          tokenCount: row.token_count,
          pageNumber: row.page_number,
          sectionTitle: row.section_title,
          metadata: row.metadata as ChunkMetadata,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        },
        score: (row as any).keyword_score || 0,
        type: 'keyword' as const
      }));
    } catch (error) {
      console.error('Keyword search error:', error);
      return [];
    }
  }

  /**
   * Combine vector and keyword search results
   */
  private async combineSearchResults(
    vectorResults: Array<{ chunk: DocumentChunk; score: number; type: 'vector' }>,
    keywordResults: Array<{ chunk: DocumentChunk; score: number; type: 'keyword' }>,
    config: HybridSearchOptions & {
      vectorWeight: number;
      keywordWeight: number;
      similarityThreshold: number;
      limit: number;
    }
  ): Promise<HybridSearchResult[]> {
    // Create a map to combine results by chunk ID
    const combinedMap = new Map<string, {
      chunk: DocumentChunk;
      vectorScore: number;
      keywordScore: number;
      sources: Set<'vector' | 'keyword'>;
    }>();

    // Add vector results
    for (const result of vectorResults) {
      combinedMap.set(result.chunk.id, {
        chunk: result.chunk,
        vectorScore: result.score,
        keywordScore: 0,
        sources: new Set(['vector'])
      });
    }

    // Add keyword results (merge with existing vector results)
    for (const result of keywordResults) {
      const existing = combinedMap.get(result.chunk.id);
      if (existing) {
        existing.keywordScore = result.score;
        existing.sources.add('keyword');
      } else {
        combinedMap.set(result.chunk.id, {
          chunk: result.chunk,
          vectorScore: 0,
          keywordScore: result.score,
          sources: new Set(['keyword'])
        });
      }
    }

    // Calculate combined scores and create hybrid results
    const hybridResults: HybridSearchResult[] = Array.from(combinedMap.values())
      .map((combined, index) => {
        // Normalize scores to 0-1 range
        const normalizedVectorScore = Math.min(1, Math.max(0, combined.vectorScore));
        const normalizedKeywordScore = Math.min(1, Math.max(0, combined.keywordScore / 0.5)); // Keyword scores are typically lower
        
        // Calculate weighted combined score
        const combinedScore = 
          (normalizedVectorScore * config.vectorWeight) + 
          (normalizedKeywordScore * config.keywordWeight);

        // Apply boosts for results found in both searches
        const bothSourcesBoost = combined.sources.size === 2 ? 0.1 : 0;
        const finalScore = Math.min(1, combinedScore + bothSourcesBoost);

        return {
          chunk: combined.chunk,
          vectorScore: normalizedVectorScore,
          keywordScore: normalizedKeywordScore,
          combinedScore: finalScore,
          rank: index + 1, // Will be re-ranked later
          explanation: undefined, // Will be added later if requested
          debugInfo: undefined // Will be added later if requested
        };
      })
      .sort((a, b) => b.combinedScore - a.combinedScore)
      .map((result, index) => ({
        ...result,
        rank: index + 1
      }));

    return hybridResults;
  }

  /**
   * Apply advanced filtering to search results
   */
  private async applyAdvancedFiltering(
    results: HybridSearchResult[],
    config: HybridSearchOptions & {
      vectorWeight: number;
      keywordWeight: number;
      similarityThreshold: number;
      limit: number;
    }
  ): Promise<HybridSearchResult[]> {
    let filteredResults = [...results];

    // Apply confidence range filter
    if (config.confidenceRange) {
      filteredResults = filteredResults.filter(result => {
        const confidence = result.chunk.metadata.confidence || 0.5;
        return confidence >= config.confidenceRange!.min && 
               confidence <= config.confidenceRange!.max;
      });
    }

    // Apply relevance range filter
    if (config.relevanceRange) {
      filteredResults = filteredResults.filter(result => {
        return result.combinedScore >= config.relevanceRange!.min && 
               result.combinedScore <= config.relevanceRange!.max;
      });
    }

    // Apply content type filter (already applied in individual searches, but double-check)
    if (config.contentTypes && config.contentTypes.length > 0) {
      filteredResults = filteredResults.filter(result => {
        const contentType = result.chunk.metadata.contentType;
        return contentType && config.contentTypes!.includes(contentType as any);
      });
    }

    // Apply page range filter (already applied in individual searches, but double-check)
    if (config.pageRange) {
      filteredResults = filteredResults.filter(result => {
        return result.chunk.pageNumber >= config.pageRange!.start && 
               result.chunk.pageNumber <= config.pageRange!.end;
      });
    }

    return filteredResults;
  }

  /**
   * Enrich results with explanations and debug information
   */
  private async enrichResultsWithExplanations(
    results: HybridSearchResult[],
    queryOptimization: QueryOptimization,
    config: HybridSearchOptions & {
      vectorWeight: number;
      keywordWeight: number;
      similarityThreshold: number;
      limit: number;
    }
  ): Promise<void> {
    for (const result of results) {
      if (config.includeExplanations) {
        result.explanation = await this.generateSearchExplanation(
          result,
          queryOptimization,
          config
        );
      }

      if (config.enableDebugging) {
        result.debugInfo = await this.generateDebugInfo(
          result,
          queryOptimization,
          config
        );
      }
    }
  }

  /**
   * Generate search explanation for a result
   */
  private async generateSearchExplanation(
    result: HybridSearchResult,
    queryOptimization: QueryOptimization,
    config: HybridSearchOptions & {
      vectorWeight: number;
      keywordWeight: number;
      similarityThreshold: number;
      limit: number;
    }
  ): Promise<SearchExplanation> {
    // Find vector matches (semantic similarity indicators)
    const vectorMatches = this.findSemanticMatches(
      result.chunk.content,
      queryOptimization.optimizedQuery
    );

    // Find keyword matches
    const keywordMatches = this.findKeywordMatches(
      result.chunk.content,
      queryOptimization.keywordTerms
    );

    // Calculate scoring breakdown
    const vectorContribution = result.vectorScore * config.vectorWeight;
    const keywordContribution = result.keywordScore * config.keywordWeight;

    // Identify boosts and penalties
    const boosts: Array<{ type: string; value: number; reason: string }> = [];
    const penalties: Array<{ type: string; value: number; reason: string }> = [];

    // Content type boost
    const contentType = result.chunk.metadata.contentType;
    if (contentType === 'heading') {
      boosts.push({
        type: 'content_type',
        value: 0.1,
        reason: 'Headings are typically more important'
      });
    }

    // Confidence boost/penalty
    const confidence = result.chunk.metadata.confidence || 0.5;
    if (confidence > 0.8) {
      boosts.push({
        type: 'high_confidence',
        value: 0.05,
        reason: 'High extraction confidence'
      });
    } else if (confidence < 0.3) {
      penalties.push({
        type: 'low_confidence',
        value: 0.1,
        reason: 'Low extraction confidence'
      });
    }

    // Relevance factors
    const relevanceFactors: string[] = [];
    if (result.vectorScore > 0.8) {
      relevanceFactors.push('High semantic similarity');
    }
    if (result.keywordScore > 0.5) {
      relevanceFactors.push('Strong keyword matches');
    }
    if (keywordMatches.length > 2) {
      relevanceFactors.push('Multiple keyword matches');
    }
    if (contentType === 'heading' || contentType === 'table') {
      relevanceFactors.push('Structured content type');
    }

    return {
      vectorMatches,
      keywordMatches,
      scoringBreakdown: {
        vectorContribution,
        keywordContribution,
        boosts,
        penalties
      },
      relevanceFactors
    };
  }

  /**
   * Generate debug information for a result
   */
  private async generateDebugInfo(
    result: HybridSearchResult,
    queryOptimization: QueryOptimization,
    config: HybridSearchOptions & {
      vectorWeight: number;
      keywordWeight: number;
      similarityThreshold: number;
      limit: number;
    }
  ): Promise<SearchDebugInfo> {
    return {
      originalQuery: queryOptimization.originalQuery,
      processedQuery: queryOptimization.optimizedQuery,
      vectorEmbeddingTime: 0, // Would need to track this
      keywordProcessingTime: 0, // Would need to track this
      filteringTime: 0, // Would need to track this
      rankingTime: 0, // Would need to track this
      cacheHit: false, // Would need to track this
      indexesUsed: ['document_chunks_embedding_idx', 'document_chunks_content_fts'],
      queryPlan: undefined // Could add EXPLAIN output
    };
  }

  /**
   * Find semantic matches in content
   */
  private findSemanticMatches(content: string, query: string): string[] {
    // This is a simplified implementation
    // In a full implementation, this could use more sophisticated NLP
    const queryWords = query.toLowerCase().split(/\s+/);
    const contentWords = content.toLowerCase().split(/\s+/);
    
    const matches: string[] = [];
    
    // Find direct word matches
    for (const queryWord of queryWords) {
      if (contentWords.some(word => word.includes(queryWord) || queryWord.includes(word))) {
        matches.push(queryWord);
      }
    }
    
    return matches;
  }

  /**
   * Find keyword matches in content
   */
  private findKeywordMatches(content: string, keywords: string[]): string[] {
    const contentLower = content.toLowerCase();
    const matches: string[] = [];
    
    for (const keyword of keywords) {
      if (contentLower.includes(keyword.toLowerCase())) {
        matches.push(keyword);
      }
    }
    
    return matches;
  }

  /**
   * Optimize query for hybrid search
   */
  private async optimizeQuery(
    query: string,
    config: HybridSearchOptions
  ): Promise<QueryOptimization> {
    const originalQuery = query.trim();
    let optimizedQuery = originalQuery;
    const optimizations: string[] = [];

    // Extract keyword terms
    const keywordTerms = this.extractKeywordTerms(optimizedQuery);
    
    // Generate synonyms if enabled
    const synonyms: string[] = [];
    if (config.synonymExpansion) {
      // This would integrate with a synonym service
      // For now, just use basic synonyms
      synonyms.push(...this.getBasicSynonyms(keywordTerms));
      if (synonyms.length > 0) {
        optimizations.push('Added synonyms');
      }
    }

    // Apply stemming if enabled
    const stemmedTerms: string[] = [];
    if (config.stemming) {
      stemmedTerms.push(...this.applyStemming(keywordTerms));
      if (stemmedTerms.length > 0) {
        optimizations.push('Applied stemming');
      }
    }

    // Remove stop words
    const filteredTerms = this.removeStopWords(keywordTerms);
    if (filteredTerms.length < keywordTerms.length) {
      optimizations.push('Removed stop words');
    }

    // Create optimized query
    const allTerms = [...filteredTerms, ...synonyms, ...stemmedTerms];
    optimizedQuery = allTerms.join(' ');

    return {
      originalQuery,
      optimizedQuery,
      keywordTerms: filteredTerms,
      synonyms,
      stemmedTerms,
      optimizations
    };
  }

  /**
   * Extract keyword terms from query
   */
  private extractKeywordTerms(query: string): string[] {
    return query
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(term => term.length > 2);
  }

  /**
   * Get basic synonyms for terms
   */
  private getBasicSynonyms(terms: string[]): string[] {
    const synonymMap: Record<string, string[]> = {
      'big': ['large', 'huge', 'massive'],
      'small': ['tiny', 'little', 'mini'],
      'fast': ['quick', 'rapid', 'speedy'],
      'slow': ['sluggish', 'gradual'],
      'good': ['excellent', 'great', 'fine'],
      'bad': ['poor', 'terrible', 'awful']
    };

    const synonyms: string[] = [];
    for (const term of terms) {
      if (synonymMap[term]) {
        synonyms.push(...synonymMap[term]);
      }
    }
    
    return synonyms;
  }

  /**
   * Apply basic stemming to terms
   */
  private applyStemming(terms: string[]): string[] {
    // Basic stemming rules
    return terms.map(term => {
      if (term.endsWith('ing')) {
        return term.slice(0, -3);
      }
      if (term.endsWith('ed')) {
        return term.slice(0, -2);
      }
      if (term.endsWith('s') && term.length > 3) {
        return term.slice(0, -1);
      }
      return term;
    });
  }

  /**
   * Remove stop words from terms
   */
  private removeStopWords(terms: string[]): string[] {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
      'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
    ]);

    return terms.filter(term => !stopWords.has(term));
  }

  /**
   * Assess query complexity
   */
  private assessQueryComplexity(query: string): 'simple' | 'moderate' | 'complex' {
    const wordCount = query.split(/\s+/).length;
    const hasSpecialChars = /[^\w\s]/.test(query);
    const hasQuotes = /["']/.test(query);
    
    if (wordCount <= 3 && !hasSpecialChars && !hasQuotes) {
      return 'simple';
    } else if (wordCount <= 8 && (!hasSpecialChars || !hasQuotes)) {
      return 'moderate';
    } else {
      return 'complex';
    }
  }

  /**
   * Calculate index efficiency score
   */
  private calculateIndexEfficiency(resultCount: number, searchTime: number): number {
    // Simple efficiency calculation: more results in less time = higher efficiency
    if (searchTime === 0) return 1.0;
    return Math.min(1.0, (resultCount / 100) / (searchTime / 1000));
  }

  /**
   * Get search configuration with defaults
   */
  private getSearchConfig(options: HybridSearchOptions): HybridSearchOptions & {
    vectorWeight: number;
    keywordWeight: number;
    similarityThreshold: number;
    limit: number;
  } {
    return {
      vectorWeight: options.vectorWeight || HybridSearchService.DEFAULT_VECTOR_WEIGHT,
      keywordWeight: options.keywordWeight || HybridSearchService.DEFAULT_KEYWORD_WEIGHT,
      similarityThreshold: options.similarityThreshold || HybridSearchService.DEFAULT_SIMILARITY_THRESHOLD,
      limit: options.limit || HybridSearchService.DEFAULT_LIMIT,
      enableFuzzyMatch: options.enableFuzzyMatch !== false,
      stemming: options.stemming !== false,
      synonymExpansion: options.synonymExpansion !== false,
      includeExplanations: options.includeExplanations !== false,
      enableDebugging: options.enableDebugging !== false,
      enableCaching: options.enableCaching !== false,
      cacheTimeout: options.cacheTimeout || HybridSearchService.CACHE_TTL,
      ...options
    };
  }

  /**
   * Generate cache key for search
   */
  private getCacheKey(query: string, config: HybridSearchOptions): string {
    const keyData = {
      query,
      vectorWeight: config.vectorWeight,
      keywordWeight: config.keywordWeight,
      similarityThreshold: config.similarityThreshold,
      limit: config.limit,
      contentTypes: config.contentTypes?.sort(),
      documentIds: config.documentIds?.sort(),
      pageRange: config.pageRange,
      confidenceRange: config.confidenceRange,
      relevanceRange: config.relevanceRange
    };
    
    return Buffer.from(JSON.stringify(keyData)).toString('base64');
  }

  /**
   * Get cached search result
   */
  private getCachedResult(cacheKey: string): HybridSearchBatchResult | null {
    const entry = this.searchCache.get(cacheKey);
    
    if (!entry) {
      return null;
    }

    // Check if cache entry is expired
    if (Date.now() - entry.timestamp.getTime() > HybridSearchService.CACHE_TTL) {
      this.searchCache.delete(cacheKey);
      return null;
    }

    entry.accessCount++;
    return entry.result;
  }

  /**
   * Cache search result
   */
  private cacheResult(cacheKey: string, result: HybridSearchBatchResult): void {
    // Limit cache size
    if (this.searchCache.size >= 100) {
      const oldestKey = Array.from(this.searchCache.entries())
        .sort(([, a], [, b]) => a.timestamp.getTime() - b.timestamp.getTime())[0][0];
      this.searchCache.delete(oldestKey);
    }

    this.searchCache.set(cacheKey, {
      result,
      timestamp: new Date(),
      accessCount: 1
    });
  }

  /**
   * Get performance analytics
   */
  getPerformanceAnalytics(): {
    averageSearchTime: number;
    averageResultCount: number;
    queryComplexityDistribution: Record<string, number>;
    cacheHitRate: number;
    indexEfficiencyTrend: number[];
  } {
    if (this.performanceMetrics.length === 0) {
      return {
        averageSearchTime: 0,
        averageResultCount: 0,
        queryComplexityDistribution: {},
        cacheHitRate: 0,
        indexEfficiencyTrend: []
      };
    }

    const averageSearchTime = this.performanceMetrics.reduce(
      (sum, m) => sum + m.totalProcessingTime, 0
    ) / this.performanceMetrics.length;

    const averageResultCount = this.performanceMetrics.reduce(
      (sum, m) => sum + m.resultsAfterFiltering, 0
    ) / this.performanceMetrics.length;

    const complexityDistribution: Record<string, number> = {};
    this.performanceMetrics.forEach(m => {
      complexityDistribution[m.queryComplexity] = 
        (complexityDistribution[m.queryComplexity] || 0) + 1;
    });

    const cacheHitRate = this.performanceMetrics.reduce(
      (sum, m) => sum + m.cacheHitRate, 0
    ) / this.performanceMetrics.length;

    const indexEfficiencyTrend = this.performanceMetrics
      .slice(-10) // Last 10 searches
      .map(m => m.indexEfficiency);

    return {
      averageSearchTime,
      averageResultCount,
      queryComplexityDistribution: complexityDistribution,
      cacheHitRate,
      indexEfficiencyTrend
    };
  }

  /**
   * Clear search cache
   */
  clearCache(): void {
    this.searchCache.clear();
  }
}

// Export singleton instance
export const hybridSearchService = new HybridSearchService();