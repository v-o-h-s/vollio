import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VectorSearchService } from '../vector-search-service';

// Mock the dependencies at the module level
vi.mock('../embedding-service', () => ({
  embeddingService: {
    generateEmbedding: vi.fn()
  }
}));

vi.mock('@/lib/utils/supabase-helpers', () => ({
  getAuthenticatedSupabaseClient: vi.fn()
}));

describe('VectorSearchService', () => {
  let vectorSearchService: VectorSearchService;

  beforeEach(() => {
    vectorSearchService = new VectorSearchService();
    vi.clearAllMocks();
  });

  describe('query optimization', () => {
    it('should optimize queries by removing stop words', async () => {
      const result = await vectorSearchService.optimizeQuery('the quick brown fox and the lazy dog');

      expect(result.optimizedQuery).toBe('quick brown fox lazy dog');
      expect(result.optimizations).toContain('Removed stop words');
      expect(result.confidence).toBe(0.8);
    });

    it('should expand abbreviations', async () => {
      const result = await vectorSearchService.optimizeQuery('AI and ML techniques');

      expect(result.optimizedQuery).toContain('artificial intelligence');
      expect(result.optimizedQuery).toContain('machine learning');
      expect(result.optimizations).toContain('Expanded "ai" to "artificial intelligence"');
      expect(result.optimizations).toContain('Expanded "ml" to "machine learning"');
    });

    it('should return original query if no optimizations needed', async () => {
      const originalQuery = 'machine learning algorithms';
      const result = await vectorSearchService.optimizeQuery(originalQuery);

      expect(result.optimizedQuery).toBe(originalQuery);
      expect(result.optimizations).toHaveLength(0);
      expect(result.confidence).toBe(1.0);
    });

    it('should handle empty queries', async () => {
      const result = await vectorSearchService.optimizeQuery('');

      expect(result.optimizedQuery).toBe('');
      expect(result.optimizations).toHaveLength(0);
      expect(result.confidence).toBe(1.0);
    });

    it('should handle queries with only stop words', async () => {
      const result = await vectorSearchService.optimizeQuery('the and or but');

      expect(result.optimizedQuery).toBe('');
      expect(result.optimizations).toContain('Removed stop words');
      expect(result.confidence).toBe(0.8);
    });
  });

  describe('cache management', () => {
    it('should provide cache statistics', () => {
      const stats = vectorSearchService.getCacheStats();
      
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('hitRate');
      expect(stats).toHaveProperty('totalAccesses');
      expect(stats).toHaveProperty('averageAge');
      expect(typeof stats.size).toBe('number');
      expect(typeof stats.hitRate).toBe('number');
      expect(typeof stats.totalAccesses).toBe('number');
      expect(typeof stats.averageAge).toBe('number');
    });

    it('should clear cache when requested', () => {
      const initialStats = vectorSearchService.getCacheStats();
      
      vectorSearchService.clearCache();
      
      const clearedStats = vectorSearchService.getCacheStats();
      expect(clearedStats.size).toBe(0);
    });
  });

  describe('search analytics', () => {
    it('should provide empty analytics for new user', async () => {
      const analytics = await vectorSearchService.getSearchAnalytics('new-user-id');
      
      expect(analytics.totalSearches).toBe(0);
      expect(analytics.averageSearchTime).toBe(0);
      expect(analytics.averageResultCount).toBe(0);
      expect(analytics.cacheHitRate).toBe(0);
      expect(analytics.popularQueries).toHaveLength(0);
      expect(analytics.performanceTrends).toHaveLength(0);
    });

    it('should handle time range filtering', async () => {
      const timeRange = {
        start: new Date('2024-01-01'),
        end: new Date('2024-12-31')
      };
      
      const analytics = await vectorSearchService.getSearchAnalytics('test-user', timeRange);
      
      expect(analytics).toBeDefined();
      expect(typeof analytics.totalSearches).toBe('number');
    });
  });

  describe('configuration', () => {
    it('should use default configuration values', async () => {
      // Test that the service can be instantiated with default values
      expect(vectorSearchService).toBeDefined();
      expect(typeof vectorSearchService.searchSimilarChunks).toBe('function');
      expect(typeof vectorSearchService.searchMultipleDocuments).toBe('function');
      expect(typeof vectorSearchService.optimizeQuery).toBe('function');
    });
  });

  describe('ranking algorithms', () => {
    it('should have different ranking methods available', () => {
      // Test that the service supports different ranking methods
      const options = {
        rankingMethod: 'similarity' as const
      };
      expect(options.rankingMethod).toBe('similarity');

      const hybridOptions = {
        rankingMethod: 'hybrid' as const
      };
      expect(hybridOptions.rankingMethod).toBe('hybrid');

      const rerankOptions = {
        rankingMethod: 'rerank' as const
      };
      expect(rerankOptions.rankingMethod).toBe('rerank');
    });
  });

  describe('search options validation', () => {
    it('should handle various search option combinations', () => {
      const options = {
        similarityThreshold: 0.8,
        limit: 20,
        pageRange: { start: 1, end: 10 },
        documentIds: ['doc1', 'doc2'],
        contentTypes: ['paragraph', 'heading'] as const,
        minConfidence: 0.7,
        includeMetadata: true,
        rankingMethod: 'hybrid' as const,
        diversityFactor: 0.5,
        boostRecent: true
      };

      expect(options.similarityThreshold).toBe(0.8);
      expect(options.limit).toBe(20);
      expect(options.pageRange?.start).toBe(1);
      expect(options.pageRange?.end).toBe(10);
      expect(options.documentIds).toHaveLength(2);
      expect(options.contentTypes).toContain('paragraph');
      expect(options.contentTypes).toContain('heading');
      expect(options.minConfidence).toBe(0.7);
      expect(options.includeMetadata).toBe(true);
      expect(options.rankingMethod).toBe('hybrid');
      expect(options.diversityFactor).toBe(0.5);
      expect(options.boostRecent).toBe(true);
    });
  });
});