import { getAuthenticatedSupabaseClient } from '@/lib/supabaseClient';
import { embeddingService } from './embedding-service';
import type { DocumentChunk, ChunkMetadata } from '@/lib/types';

/**
 * Vector search configuration options
 */
export interface VectorSearchOptions {
  similarityThreshold?: number;
  limit?: number;
  pageRange?: { start: number; end: number };
  documentIds?: string[];
  contentTypes?: ('paragraph' | 'heading' | 'list' | 'table' | 'caption')[];
  minConfidence?: number;
  includeMetadata?: boolean;
  rankingMethod?: 'similarity' | 'hybrid' | 'rerank';
  diversityFactor?: number;
  boostRecent?: boolean;
}

/**
 * Vector search result with similarity score and metadata
 */
export interface VectorSearchResult {
  chunk: DocumentChunk;
  similarity: number;
  rank: number;
  relevanceScore: number;
  explanation?: string;
}

/**
 * Batch search result with performance metrics
 */
export interface BatchSearchResult {
  success: boolean;
  results: VectorSearchResult[];
  totalResults: number;
  searchTime: number;
  queryEmbeddingTime: number;
  retrievalTime: number;
  rankingTime: number;
  cacheHit: boolean;
  error?: string;
}

/**
 * Multi-document search coordination result
 */
export interface MultiDocumentSearchResult {
  success: boolean;
  results: VectorSearchResult[];
  documentBreakdown: Record<string, {
    documentId: string;
    documentTitle: string;
    resultCount: number;
    averageSimilarity: number;
    topResult?: VectorSearchResult;
  }>;
  totalResults: number;
  searchTime: number;
  error?: string;
}

/**
 * Search performance metrics
 */
export interface SearchPerformanceMetrics {
  queryId: string;
  userId: string;
  query: string;
  documentIds: string[];
  resultCount: number;
  totalSearchTime: number;
  embeddingTime: number;
  databaseTime: number;
  rankingTime: number;
  cacheHitRate: number;
  averageSimilarity: number;
  timestamp: Date;
}

/**
 * Search analytics data
 */
export interface SearchAnalytics {
  totalSearches: number;
  averageSearchTime: number;
  averageResultCount: number;
  cacheHitRate: number;
  popularQueries: Array<{
    query: string;
    count: number;
    averageSimilarity: number;
  }>;
  performanceTrends: Array<{
    date: string;
    averageSearchTime: number;
    searchCount: number;
  }>;
}

/**
 * Query optimization result
 */
interface QueryOptimizationResult {
  optimizedQuery: string;
  originalQuery: string;
  optimizations: string[];
  confidence: number;
}

/**
 * Ranking algorithm configuration
 */
interface RankingConfig {
  similarityWeight: number;
  recencyWeight: number;
  contentTypeWeight: number;
  confidenceWeight: number;
  diversityWeight: number;
}

export class VectorSearchService {
  private static readonly DEFAULT_SIMILARITY_THRESHOLD = 0.7;
  private static readonly DEFAULT_LIMIT = 10;
  private static readonly DEFAULT_RANKING_CONFIG: RankingConfig = {
    similarityWeight: 0.6,
    recencyWeight: 0.1,
    contentTypeWeight: 0.1,
    confidenceWeight: 0.1,
    diversityWeight: 0.1
  };
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private static readonly MAX_CACHE_SIZE = 1000;

  private searchCache = new Map<string, {
    result: BatchSearchResult;
    timestamp: Date;
    accessCount: number;
  }>();
  private performanceMetrics: SearchPerformanceMetrics[] = [];

  /**
   * Perform semantic similarity search for a single query
   */
  async searchSimilarChunks(
    query: string,
    options: VectorSearchOptions = {}
  ): Promise<BatchSearchResult> {
    const startTime = Date.now();
    const config = this.getSearchConfig(options);
    
    try {
      // Check cache first
      const cacheKey = this.getCacheKey(query, config);
      const cached = this.getCachedResult(cacheKey);
      if (cached) {
        return {
          ...cached,
          cacheHit: true,
          searchTime: Date.now() - startTime
        };
      }

      // Generate query embedding
      const embeddingStartTime = Date.now();
      const queryEmbedding = await embeddingService.generateEmbedding(query, {
        cacheEnabled: true,
        validateQuality: true
      });
      const queryEmbeddingTime = Date.now() - embeddingStartTime;

      // Perform vector search in database
      const retrievalStartTime = Date.now();
      const searchResults = await this.performVectorSearch(
        queryEmbedding.embedding,
        config
      );
      const retrievalTime = Date.now() - retrievalStartTime;

      // Apply ranking and optimization
      const rankingStartTime = Date.now();
      const rankedResults = await this.rankResults(searchResults, query, config);
      const rankingTime = Date.now() - rankingStartTime;

      const totalSearchTime = Date.now() - startTime;

      const result: BatchSearchResult = {
        success: true,
        results: rankedResults,
        totalResults: rankedResults.length,
        searchTime: totalSearchTime,
        queryEmbeddingTime,
        retrievalTime,
        rankingTime,
        cacheHit: false
      };

      // Cache the result
      this.cacheResult(cacheKey, result);

      // Record performance metrics
      await this.recordPerformanceMetrics({
        queryId: this.generateQueryId(),
        userId: await this.getCurrentUserId(),
        query,
        documentIds: config.documentIds || [],
        resultCount: rankedResults.length,
        totalSearchTime,
        embeddingTime: queryEmbeddingTime,
        databaseTime: retrievalTime,
        rankingTime,
        cacheHitRate: 0,
        averageSimilarity: this.calculateAverageSimilarity(rankedResults),
        timestamp: new Date()
      });

      return result;
    } catch (error) {
      return {
        success: false,
        results: [],
        totalResults: 0,
        searchTime: Date.now() - startTime,
        queryEmbeddingTime: 0,
        retrievalTime: 0,
        rankingTime: 0,
        cacheHit: false,
        error: error instanceof Error ? error.message : 'Unknown search error'
      };
    }
  }

  /**
   * Perform multi-document search with coordination
   */
  async searchMultipleDocuments(
    query: string,
    documentIds: string[],
    options: VectorSearchOptions = {}
  ): Promise<MultiDocumentSearchResult> {
    const startTime = Date.now();
    
    try {
      // Perform search across all specified documents
      const searchOptions: VectorSearchOptions = {
        ...options,
        documentIds
      };

      const searchResult = await this.searchSimilarChunks(query, searchOptions);
      
      if (!searchResult.success) {
        return {
          success: false,
          results: [],
          documentBreakdown: {},
          totalResults: 0,
          searchTime: Date.now() - startTime,
          error: searchResult.error
        };
      }

      // Group results by document and calculate breakdown
      const documentBreakdown = await this.calculateDocumentBreakdown(
        searchResult.results,
        documentIds
      );

      // Apply multi-document coordination (balance results across documents)
      const coordinatedResults = this.coordinateMultiDocumentResults(
        searchResult.results,
        documentBreakdown,
        options
      );

      return {
        success: true,
        results: coordinatedResults,
        documentBreakdown,
        totalResults: coordinatedResults.length,
        searchTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        results: [],
        documentBreakdown: {},
        totalResults: 0,
        searchTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Multi-document search error'
      };
    }
  }

  /**
   * Perform vector search in Supabase using pgvector
   */
  private async performVectorSearch(
    queryEmbedding: number[],
    config: VectorSearchOptions & {
      similarityThreshold: number;
      limit: number;
      includeMetadata: boolean;
      rankingMethod: 'similarity' | 'hybrid' | 'rerank';
      diversityFactor: number;
      boostRecent: boolean;
    }
  ): Promise<VectorSearchResult[]> {
    const client = await getAuthenticatedSupabaseClient();

    // Build the query with filters
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
        embedding <-> '[${queryEmbedding.join(',')}]' as similarity
      `)
      .lt('embedding <-> \'[' + queryEmbedding.join(',') + ']\'', 1 - config.similarityThreshold)
      .order('similarity', { ascending: true })
      .limit(config.limit);

    // Apply document ID filter
    if (config.documentIds && config.documentIds.length > 0) {
      query = query.in('document_id', config.documentIds);
    }

    // Apply page range filter
    if (config.pageRange) {
      query = query
        .gte('page_number', config.pageRange.start)
        .lte('page_number', config.pageRange.end);
    }

    // Apply content type filter
    if (config.contentTypes && config.contentTypes.length > 0) {
      query = query.in('metadata->contentType', config.contentTypes);
    }

    // Apply confidence filter
    if (config.minConfidence !== undefined) {
      query = query.gte('metadata->confidence', config.minConfidence);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Vector search failed: ${error.message}`);
    }

    if (!data) {
      return [];
    }

    // Convert database results to VectorSearchResult format
    return data.map((row, index) => ({
      chunk: {
        id: row.id,
        userId: row.user_id,
        documentId: row.document_id,
        chunkIndex: row.chunk_index,
        content: row.content,
        embedding: [], // Don't return embeddings in results for performance
        tokenCount: row.token_count,
        pageNumber: row.page_number,
        sectionTitle: row.section_title,
        metadata: row.metadata as ChunkMetadata,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      },
      similarity: 1 - (row as any).similarity, // Convert distance to similarity
      rank: index + 1,
      relevanceScore: 1 - (row as any).similarity // Initial relevance score
    }));
  }

  /**
   * Apply ranking algorithms to search results
   */
  private async rankResults(
    results: VectorSearchResult[],
    query: string,
    config: VectorSearchOptions & {
      similarityThreshold: number;
      limit: number;
      includeMetadata: boolean;
      rankingMethod: 'similarity' | 'hybrid' | 'rerank';
      diversityFactor: number;
      boostRecent: boolean;
    }
  ): Promise<VectorSearchResult[]> {
    if (results.length === 0) {
      return results;
    }

    const rankingConfig = VectorSearchService.DEFAULT_RANKING_CONFIG;

    // Apply different ranking methods
    switch (config.rankingMethod) {
      case 'similarity':
        return this.rankBySimilarity(results);
      
      case 'hybrid':
        return this.rankByHybridScore(results, query, rankingConfig);
      
      case 'rerank':
        return await this.rerankResults(results, query);
      
      default:
        return this.rankBySimilarity(results);
    }
  }

  /**
   * Rank results by similarity score only
   */
  private rankBySimilarity(results: VectorSearchResult[]): VectorSearchResult[] {
    return results
      .sort((a, b) => b.similarity - a.similarity)
      .map((result, index) => ({
        ...result,
        rank: index + 1,
        relevanceScore: result.similarity
      }));
  }

  /**
   * Rank results using hybrid scoring (similarity + other factors)
   */
  private rankByHybridScore(
    results: VectorSearchResult[],
    query: string,
    config: RankingConfig
  ): VectorSearchResult[] {
    const now = Date.now();

    return results
      .map(result => {
        // Calculate component scores
        const similarityScore = result.similarity;
        
        // Recency score (newer chunks get slight boost)
        const chunkAge = now - new Date(result.chunk.createdAt).getTime();
        const maxAge = 365 * 24 * 60 * 60 * 1000; // 1 year
        const recencyScore = Math.max(0, 1 - (chunkAge / maxAge));
        
        // Content type score (headings and structured content get boost)
        const contentTypeScore = this.getContentTypeScore(result.chunk.metadata.contentType);
        
        // Confidence score from metadata
        const confidenceScore = result.chunk.metadata.confidence || 0.5;
        
        // Calculate composite relevance score
        const relevanceScore = 
          (similarityScore * config.similarityWeight) +
          (recencyScore * config.recencyWeight) +
          (contentTypeScore * config.contentTypeWeight) +
          (confidenceScore * config.confidenceWeight);

        return {
          ...result,
          relevanceScore
        };
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .map((result, index) => ({
        ...result,
        rank: index + 1
      }));
  }

  /**
   * Advanced re-ranking using additional context
   */
  private async rerankResults(
    results: VectorSearchResult[],
    query: string
  ): Promise<VectorSearchResult[]> {
    // For now, use hybrid ranking as re-ranking placeholder
    // In a full implementation, this could use a separate re-ranking model
    return this.rankByHybridScore(results, query, VectorSearchService.DEFAULT_RANKING_CONFIG);
  }

  /**
   * Get content type scoring weights
   */
  private getContentTypeScore(contentType: string): number {
    const scores = {
      'heading': 0.9,
      'paragraph': 0.7,
      'list': 0.8,
      'table': 0.85,
      'caption': 0.6
    };
    return scores[contentType as keyof typeof scores] || 0.5;
  }

  /**
   * Calculate document breakdown for multi-document search
   */
  private async calculateDocumentBreakdown(
    results: VectorSearchResult[],
    documentIds: string[]
  ): Promise<Record<string, any>> {
    const client = await getAuthenticatedSupabaseClient();
    
    // Get document titles
    const { data: documents } = await client
      .from('pdfs')
      .select('id, filename')
      .in('id', documentIds);

    const documentMap = new Map(
      documents?.map(doc => [doc.id, doc.filename]) || []
    );

    const breakdown: Record<string, any> = {};

    for (const documentId of documentIds) {
      const documentResults = results.filter(r => r.chunk.documentId === documentId);
      
      if (documentResults.length > 0) {
        const averageSimilarity = documentResults.reduce((sum, r) => sum + r.similarity, 0) / documentResults.length;
        const topResult = documentResults.reduce((best, current) => 
          current.similarity > best.similarity ? current : best
        );

        breakdown[documentId] = {
          documentId,
          documentTitle: documentMap.get(documentId) || 'Unknown Document',
          resultCount: documentResults.length,
          averageSimilarity,
          topResult
        };
      } else {
        breakdown[documentId] = {
          documentId,
          documentTitle: documentMap.get(documentId) || 'Unknown Document',
          resultCount: 0,
          averageSimilarity: 0,
          topResult: undefined
        };
      }
    }

    return breakdown;
  }

  /**
   * Coordinate results across multiple documents for balanced representation
   */
  private coordinateMultiDocumentResults(
    results: VectorSearchResult[],
    documentBreakdown: Record<string, any>,
    options: VectorSearchOptions
  ): VectorSearchResult[] {
    const limit = options.limit || VectorSearchService.DEFAULT_LIMIT;
    const diversityFactor = options.diversityFactor || 0.3;

    if (diversityFactor === 0) {
      // No diversity requirement, return top results by relevance
      return results.slice(0, limit);
    }

    // Calculate target results per document for diversity
    const activeDocuments = Object.values(documentBreakdown).filter(
      (doc: any) => doc.resultCount > 0
    );
    
    if (activeDocuments.length <= 1) {
      return results.slice(0, limit);
    }

    // Enhanced multi-document coordination with relevance weighting
    const documentWeights = this.calculateDocumentRelevanceWeights(
      activeDocuments,
      results
    );

    const coordinatedResults: VectorSearchResult[] = [];
    const documentResultCounts = new Map<string, number>();

    // Initialize document result counts
    activeDocuments.forEach((doc: any) => {
      documentResultCounts.set(doc.documentId, 0);
    });

    // Calculate weighted target results per document
    const weightedTargets = this.calculateWeightedTargets(
      activeDocuments,
      documentWeights,
      limit,
      diversityFactor
    );

    // First pass: ensure minimum representation from each document based on weights
    for (const result of results) {
      const docId = result.chunk.documentId;
      const currentCount = documentResultCounts.get(docId) || 0;
      const targetCount = weightedTargets.get(docId) || 0;
      
      if (currentCount < targetCount) {
        coordinatedResults.push(result);
        documentResultCounts.set(docId, currentCount + 1);
      }
    }

    // Second pass: fill remaining slots with best results, considering document balance
    const remainingResults = results.filter(r => !coordinatedResults.includes(r));
    const remainingSlots = limit - coordinatedResults.length;
    
    // Apply document balancing to remaining results
    const balancedRemaining = this.balanceRemainingResults(
      remainingResults,
      documentResultCounts,
      activeDocuments.length,
      remainingSlots
    );
    
    coordinatedResults.push(...balancedRemaining);

    // Re-rank the coordinated results with multi-document boost
    return this.applyMultiDocumentRanking(coordinatedResults, documentBreakdown);
  }

  /**
   * Calculate relevance weights for each document based on search results
   */
  private calculateDocumentRelevanceWeights(
    activeDocuments: any[],
    results: VectorSearchResult[]
  ): Map<string, number> {
    const weights = new Map<string, number>();
    
    activeDocuments.forEach((doc: any) => {
      const docResults = results.filter(r => r.chunk.documentId === doc.documentId);
      
      if (docResults.length > 0) {
        // Weight based on average relevance and result count
        const avgRelevance = docResults.reduce((sum, r) => sum + r.relevanceScore, 0) / docResults.length;
        const countFactor = Math.min(docResults.length / 10, 1.0); // Normalize count factor
        const weight = (avgRelevance * 0.7) + (countFactor * 0.3);
        weights.set(doc.documentId, weight);
      } else {
        weights.set(doc.documentId, 0);
      }
    });
    
    return weights;
  }

  /**
   * Calculate weighted target results per document
   */
  private calculateWeightedTargets(
    activeDocuments: any[],
    documentWeights: Map<string, number>,
    totalLimit: number,
    diversityFactor: number
  ): Map<string, number> {
    const targets = new Map<string, number>();
    const totalWeight = Array.from(documentWeights.values()).reduce((sum, w) => sum + w, 0);
    
    if (totalWeight === 0) {
      // Fallback to equal distribution
      const baseTarget = Math.floor(totalLimit / activeDocuments.length);
      activeDocuments.forEach((doc: any) => {
        targets.set(doc.documentId, baseTarget);
      });
      return targets;
    }
    
    // Calculate base targets with diversity factor
    const minPerDocument = Math.max(1, Math.floor(totalLimit * diversityFactor / activeDocuments.length));
    let remainingSlots = totalLimit - (minPerDocument * activeDocuments.length);
    
    activeDocuments.forEach((doc: any) => {
      targets.set(doc.documentId, minPerDocument);
    });
    
    // Distribute remaining slots based on weights
    const sortedDocs = activeDocuments.sort((a, b) => 
      (documentWeights.get(b.documentId) || 0) - (documentWeights.get(a.documentId) || 0)
    );
    
    for (const doc of sortedDocs) {
      if (remainingSlots <= 0) break;
      
      const weight = documentWeights.get(doc.documentId) || 0;
      const additionalSlots = Math.min(
        remainingSlots,
        Math.floor((weight / totalWeight) * remainingSlots) + 1
      );
      
      targets.set(doc.documentId, (targets.get(doc.documentId) || 0) + additionalSlots);
      remainingSlots -= additionalSlots;
    }
    
    return targets;
  }

  /**
   * Balance remaining results across documents
   */
  private balanceRemainingResults(
    remainingResults: VectorSearchResult[],
    currentCounts: Map<string, number>,
    documentCount: number,
    remainingSlots: number
  ): VectorSearchResult[] {
    if (remainingSlots <= 0) return [];
    
    const balanced: VectorSearchResult[] = [];
    const sortedResults = [...remainingResults].sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    // Try to maintain balance while selecting best results
    for (const result of sortedResults) {
      if (balanced.length >= remainingSlots) break;
      
      const docId = result.chunk.documentId;
      const currentCount = currentCounts.get(docId) || 0;
      const avgCount = balanced.length / documentCount;
      
      // Prefer results from under-represented documents
      if (currentCount <= avgCount + 1) {
        balanced.push(result);
        currentCounts.set(docId, currentCount + 1);
      }
    }
    
    // Fill any remaining slots with best available results
    const stillRemaining = remainingSlots - balanced.length;
    if (stillRemaining > 0) {
      const unselected = sortedResults.filter(r => !balanced.includes(r));
      balanced.push(...unselected.slice(0, stillRemaining));
    }
    
    return balanced;
  }

  /**
   * Apply multi-document ranking boost
   */
  private applyMultiDocumentRanking(
    results: VectorSearchResult[],
    documentBreakdown: Record<string, any>
  ): VectorSearchResult[] {
    const documentCount = Object.keys(documentBreakdown).length;
    
    return results
      .map(result => {
        // Apply small boost for multi-document diversity
        const diversityBoost = documentCount > 1 ? 0.05 : 0;
        const adjustedScore = result.relevanceScore + diversityBoost;
        
        return {
          ...result,
          relevanceScore: Math.min(1.0, adjustedScore)
        };
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .map((result, index) => ({
        ...result,
        rank: index + 1
      }));
  }

  /**
   * Optimize query for better search results
   */
  async optimizeQuery(query: string): Promise<QueryOptimizationResult> {
    const optimizations: string[] = [];
    let optimizedQuery = query.trim();

    // Remove common stop words that don't add semantic value
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    const words = optimizedQuery.toLowerCase().split(/\s+/);
    const filteredWords = words.filter(word => !stopWords.includes(word));
    
    if (filteredWords.length < words.length) {
      optimizedQuery = filteredWords.join(' ');
      optimizations.push('Removed stop words');
    }

    // Expand abbreviations and acronyms
    const abbreviations = {
      'ai': 'artificial intelligence',
      'ml': 'machine learning',
      'nlp': 'natural language processing',
      'api': 'application programming interface',
      'ui': 'user interface',
      'ux': 'user experience'
    };

    for (const [abbrev, expansion] of Object.entries(abbreviations)) {
      const regex = new RegExp(`\\b${abbrev}\\b`, 'gi');
      if (regex.test(optimizedQuery)) {
        optimizedQuery = optimizedQuery.replace(regex, expansion);
        optimizations.push(`Expanded "${abbrev}" to "${expansion}"`);
      }
    }

    // Calculate confidence based on optimizations applied
    const confidence = optimizations.length > 0 ? 0.8 : 1.0;

    return {
      optimizedQuery,
      originalQuery: query,
      optimizations,
      confidence
    };
  }

  /**
   * Get search performance analytics
   */
  async getSearchAnalytics(
    userId: string,
    timeRange?: { start: Date; end: Date }
  ): Promise<SearchAnalytics> {
    let metrics = this.performanceMetrics.filter(m => m.userId === userId);

    if (timeRange) {
      metrics = metrics.filter(m => 
        m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
      );
    }

    if (metrics.length === 0) {
      return {
        totalSearches: 0,
        averageSearchTime: 0,
        averageResultCount: 0,
        cacheHitRate: 0,
        popularQueries: [],
        performanceTrends: []
      };
    }

    // Calculate basic statistics
    const totalSearches = metrics.length;
    const averageSearchTime = metrics.reduce((sum, m) => sum + m.totalSearchTime, 0) / totalSearches;
    const averageResultCount = metrics.reduce((sum, m) => sum + m.resultCount, 0) / totalSearches;
    const cacheHitRate = metrics.reduce((sum, m) => sum + m.cacheHitRate, 0) / totalSearches;

    // Calculate popular queries
    const queryFrequency = new Map<string, { count: number; totalSimilarity: number }>();
    metrics.forEach(m => {
      const existing = queryFrequency.get(m.query) || { count: 0, totalSimilarity: 0 };
      queryFrequency.set(m.query, {
        count: existing.count + 1,
        totalSimilarity: existing.totalSimilarity + m.averageSimilarity
      });
    });

    const popularQueries = Array.from(queryFrequency.entries())
      .map(([query, stats]) => ({
        query,
        count: stats.count,
        averageSimilarity: stats.totalSimilarity / stats.count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate performance trends (daily aggregation)
    const dailyMetrics = new Map<string, { searchTime: number; count: number }>();
    metrics.forEach(m => {
      const date = m.timestamp.toISOString().split('T')[0];
      const existing = dailyMetrics.get(date) || { searchTime: 0, count: 0 };
      dailyMetrics.set(date, {
        searchTime: existing.searchTime + m.totalSearchTime,
        count: existing.count + 1
      });
    });

    const performanceTrends = Array.from(dailyMetrics.entries())
      .map(([date, stats]) => ({
        date,
        averageSearchTime: stats.searchTime / stats.count,
        searchCount: stats.count
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalSearches,
      averageSearchTime,
      averageResultCount,
      cacheHitRate,
      popularQueries,
      performanceTrends
    };
  }

  /**
   * Clear search cache
   */
  clearCache(): void {
    this.searchCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    hitRate: number;
    totalAccesses: number;
    averageAge: number;
  } {
    const entries = Array.from(this.searchCache.values());
    const totalAccesses = entries.reduce((sum, entry) => sum + entry.accessCount, 0);
    const now = Date.now();
    const averageAge = entries.length > 0 
      ? entries.reduce((sum, entry) => sum + (now - entry.timestamp.getTime()), 0) / entries.length
      : 0;

    return {
      size: this.searchCache.size,
      hitRate: 0, // Would need to track this separately
      totalAccesses,
      averageAge: averageAge / (1000 * 60) // Convert to minutes
    };
  }

  /**
   * Helper methods
   */
  private getSearchConfig(options: VectorSearchOptions): VectorSearchOptions & {
    similarityThreshold: number;
    limit: number;
    includeMetadata: boolean;
    rankingMethod: 'similarity' | 'hybrid' | 'rerank';
    diversityFactor: number;
    boostRecent: boolean;
  } {
    return {
      similarityThreshold: options.similarityThreshold || VectorSearchService.DEFAULT_SIMILARITY_THRESHOLD,
      limit: options.limit || VectorSearchService.DEFAULT_LIMIT,
      pageRange: options.pageRange,
      documentIds: options.documentIds,
      contentTypes: options.contentTypes,
      minConfidence: options.minConfidence,
      includeMetadata: options.includeMetadata !== false,
      rankingMethod: options.rankingMethod || 'hybrid',
      diversityFactor: options.diversityFactor || 0.3,
      boostRecent: options.boostRecent !== false
    };
  }

  private getCacheKey(query: string, config: VectorSearchOptions & {
    similarityThreshold: number;
    limit: number;
    includeMetadata: boolean;
    rankingMethod: 'similarity' | 'hybrid' | 'rerank';
    diversityFactor: number;
    boostRecent: boolean;
  }): string {
    const keyData = {
      query,
      similarityThreshold: config.similarityThreshold,
      limit: config.limit,
      pageRange: config.pageRange,
      documentIds: config.documentIds?.sort(),
      contentTypes: config.contentTypes?.sort(),
      minConfidence: config.minConfidence,
      rankingMethod: config.rankingMethod
    };
    
    return Buffer.from(JSON.stringify(keyData)).toString('base64');
  }

  private getCachedResult(cacheKey: string): BatchSearchResult | null {
    const entry = this.searchCache.get(cacheKey);
    
    if (!entry) {
      return null;
    }

    // Check if cache entry is expired
    if (Date.now() - entry.timestamp.getTime() > VectorSearchService.CACHE_TTL) {
      this.searchCache.delete(cacheKey);
      return null;
    }

    entry.accessCount++;
    return entry.result;
  }

  private cacheResult(cacheKey: string, result: BatchSearchResult): void {
    // Check cache size limit
    if (this.searchCache.size >= VectorSearchService.MAX_CACHE_SIZE) {
      this.evictOldestCacheEntries();
    }

    this.searchCache.set(cacheKey, {
      result,
      timestamp: new Date(),
      accessCount: 1
    });
  }

  private evictOldestCacheEntries(): void {
    const entries = Array.from(this.searchCache.entries());
    
    // Sort by timestamp (oldest first)
    entries.sort(([, a], [, b]) => a.timestamp.getTime() - b.timestamp.getTime());
    
    // Remove oldest 20% of entries
    const toRemove = Math.floor(entries.length * 0.2);
    for (let i = 0; i < toRemove; i++) {
      this.searchCache.delete(entries[i][0]);
    }
  }

  private async getCurrentUserId(): Promise<string> {
    try {
      // For now, return a placeholder since we can't easily get userId from the client
      return 'current-user';
    } catch {
      return 'anonymous';
    }
  }

  private generateQueryId(): string {
    return `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateAverageSimilarity(results: VectorSearchResult[]): number {
    if (results.length === 0) return 0;
    return results.reduce((sum, r) => sum + r.similarity, 0) / results.length;
  }

  private async recordPerformanceMetrics(metrics: SearchPerformanceMetrics): Promise<void> {
    this.performanceMetrics.push(metrics);
    
    // Keep only recent metrics (last 1000 searches)
    if (this.performanceMetrics.length > 1000) {
      this.performanceMetrics = this.performanceMetrics.slice(-1000);
    }
  }
}

// Export singleton instance
export const vectorSearchService = new VectorSearchService();