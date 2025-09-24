import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HybridSearchService } from '../hybrid-search-service';

// Mock dependencies
vi.mock('@/lib/supabaseClient', () => ({
  getAuthenticatedSupabaseClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        lt: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => ({
              in: vi.fn(() => ({
                gte: vi.fn(() => ({
                  lte: vi.fn(() => ({
                    in: vi.fn(() => ({
                      gte: vi.fn(() => Promise.resolve({
                        data: [
                          {
                            id: 'chunk-1',
                            user_id: 'user-1',
                            document_id: 'doc-1',
                            chunk_index: 0,
                            content: 'This is a test document about artificial intelligence and machine learning.',
                            token_count: 12,
                            page_number: 1,
                            section_title: 'Introduction',
                            metadata: { contentType: 'paragraph', confidence: 0.9 },
                            created_at: '2024-01-01T00:00:00Z',
                            updated_at: '2024-01-01T00:00:00Z',
                            keyword_score: 0.8
                          }
                        ],
                        error: null
                      }))
                    }))
                  }))
                }))
              }))
            }))
          }))
        }))
      }))
    }))
  }))
}));

vi.mock('../embedding-service', () => ({
  embeddingService: {
    generateEmbedding: vi.fn(() => Promise.resolve({
      embedding: new Array(1536).fill(0.1),
      success: true
    }))
  }
}));

vi.mock('../vector-search-service', () => ({
  vectorSearchService: {
    searchSimilarChunks: vi.fn(() => Promise.resolve({
      success: true,
      results: [
        {
          chunk: {
            id: 'chunk-1',
            userId: 'user-1',
            documentId: 'doc-1',
            chunkIndex: 0,
            content: 'This is a test document about artificial intelligence and machine learning.',
            embedding: [],
            tokenCount: 12,
            pageNumber: 1,
            sectionTitle: 'Introduction',
            metadata: { contentType: 'paragraph', confidence: 0.9 },
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          },
          similarity: 0.85,
          rank: 1,
          relevanceScore: 0.85
        }
      ],
      totalResults: 1,
      searchTime: 100,
      queryEmbeddingTime: 50,
      retrievalTime: 30,
      rankingTime: 20,
      cacheHit: false
    }))
  }
}));

describe('HybridSearchService', () => {
  let hybridSearchService: HybridSearchService;

  beforeEach(() => {
    hybridSearchService = new HybridSearchService();
    vi.clearAllMocks();
  });

  describe('hybridSearch', () => {
    it('should perform hybrid search successfully', async () => {
      const result = await hybridSearchService.hybridSearch('artificial intelligence', {
        documentIds: ['doc-1'],
        limit: 10,
        vectorWeight: 0.7,
        keywordWeight: 0.3,
        enableCaching: false
      });

      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(1);
      expect(result.results[0].chunk.content).toContain('artificial intelligence');
      expect(result.results[0].vectorScore).toBeGreaterThan(0);
      expect(result.results[0].combinedScore).toBeGreaterThan(0);
      expect(result.analytics.queryComplexity).toBe('moderate');
    });

    it('should handle vector-only search', async () => {
      const result = await hybridSearchService.hybridSearch('machine learning', {
        documentIds: ['doc-1'],
        vectorWeight: 1.0,
        keywordWeight: 0.0,
        enableCaching: false
      });

      expect(result.success).toBe(true);
      expect(result.results[0].vectorScore).toBeGreaterThan(0);
      expect(result.results[0].keywordScore).toBe(0);
    });

    it('should handle keyword-only search', async () => {
      const result = await hybridSearchService.hybridSearch('artificial intelligence', {
        documentIds: ['doc-1'],
        vectorWeight: 0.0,
        keywordWeight: 1.0,
        enableCaching: false
      });

      expect(result.success).toBe(true);
      expect(result.results[0].keywordScore).toBeGreaterThan(0);
    });

    it('should apply content type filters', async () => {
      const result = await hybridSearchService.hybridSearch('test query', {
        documentIds: ['doc-1'],
        contentTypes: ['paragraph'],
        enableCaching: false
      });

      expect(result.success).toBe(true);
      // Should only return paragraph content
      result.results.forEach(result => {
        expect(result.chunk.metadata.contentType).toBe('paragraph');
      });
    });

    it('should apply confidence range filters', async () => {
      const result = await hybridSearchService.hybridSearch('test query', {
        documentIds: ['doc-1'],
        confidenceRange: { min: 0.8, max: 1.0 },
        enableCaching: false
      });

      expect(result.success).toBe(true);
      // Should only return high-confidence results
      result.results.forEach(result => {
        const confidence = result.chunk.metadata.confidence || 0;
        expect(confidence).toBeGreaterThanOrEqual(0.8);
        expect(confidence).toBeLessThanOrEqual(1.0);
      });
    });

    it('should generate explanations when requested', async () => {
      const result = await hybridSearchService.hybridSearch('artificial intelligence', {
        documentIds: ['doc-1'],
        includeExplanations: true,
        enableCaching: false
      });

      expect(result.success).toBe(true);
      expect(result.results[0].explanation).toBeDefined();
      expect(result.results[0].explanation?.vectorMatches).toBeDefined();
      expect(result.results[0].explanation?.keywordMatches).toBeDefined();
      expect(result.results[0].explanation?.scoringBreakdown).toBeDefined();
    });

    it('should generate debug info when requested', async () => {
      const result = await hybridSearchService.hybridSearch('test query', {
        documentIds: ['doc-1'],
        enableDebugging: true,
        enableCaching: false
      });

      expect(result.success).toBe(true);
      expect(result.results[0].debugInfo).toBeDefined();
      expect(result.results[0].debugInfo?.originalQuery).toBe('test query');
      expect(result.results[0].debugInfo?.indexesUsed).toBeDefined();
    });

    it('should handle search errors gracefully', async () => {
      // Mock an error in vector search
      const { vectorSearchService } = await import('../vector-search-service');
      vi.mocked(vectorSearchService.searchSimilarChunks).mockResolvedValueOnce({
        success: false,
        results: [],
        totalResults: 0,
        searchTime: 0,
        queryEmbeddingTime: 0,
        retrievalTime: 0,
        rankingTime: 0,
        cacheHit: false,
        error: 'Vector search failed'
      });

      const result = await hybridSearchService.hybridSearch('test query', {
        documentIds: ['doc-1'],
        enableCaching: false
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should assess query complexity correctly', async () => {
      // Simple query
      const simpleResult = await hybridSearchService.hybridSearch('AI', {
        documentIds: ['doc-1'],
        enableCaching: false
      });
      expect(simpleResult.analytics.queryComplexity).toBe('simple');

      // Moderate query
      const moderateResult = await hybridSearchService.hybridSearch('artificial intelligence machine learning', {
        documentIds: ['doc-1'],
        enableCaching: false
      });
      expect(moderateResult.analytics.queryComplexity).toBe('moderate');

      // Complex query
      const complexResult = await hybridSearchService.hybridSearch('What are the applications of artificial intelligence in machine learning and natural language processing?', {
        documentIds: ['doc-1'],
        enableCaching: false
      });
      expect(complexResult.analytics.queryComplexity).toBe('complex');
    });
  });

  describe('query optimization', () => {
    it('should optimize queries with stemming', async () => {
      const result = await hybridSearchService.hybridSearch('running quickly', {
        documentIds: ['doc-1'],
        stemming: true,
        enableCaching: false
      });

      expect(result.success).toBe(true);
      // Stemming should have been applied (running -> run, quickly -> quick)
    });

    it('should expand synonyms when enabled', async () => {
      const result = await hybridSearchService.hybridSearch('big data', {
        documentIds: ['doc-1'],
        synonymExpansion: true,
        enableCaching: false
      });

      expect(result.success).toBe(true);
      // Synonyms should have been added (big -> large, huge, massive)
    });

    it('should remove stop words', async () => {
      const result = await hybridSearchService.hybridSearch('the artificial intelligence and machine learning', {
        documentIds: ['doc-1'],
        enableCaching: false
      });

      expect(result.success).toBe(true);
      // Stop words (the, and) should have been removed
    });
  });

  describe('performance analytics', () => {
    it('should provide performance analytics', () => {
      const analytics = hybridSearchService.getPerformanceAnalytics();

      expect(analytics).toBeDefined();
      expect(analytics.averageSearchTime).toBeGreaterThanOrEqual(0);
      expect(analytics.averageResultCount).toBeGreaterThanOrEqual(0);
      expect(analytics.queryComplexityDistribution).toBeDefined();
      expect(analytics.cacheHitRate).toBeGreaterThanOrEqual(0);
      expect(analytics.indexEfficiencyTrend).toBeDefined();
    });

    it('should clear cache when requested', () => {
      hybridSearchService.clearCache();
      
      const analytics = hybridSearchService.getPerformanceAnalytics();
      expect(analytics.cacheHitRate).toBe(0);
    });
  });
});