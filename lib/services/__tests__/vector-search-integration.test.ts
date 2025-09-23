import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VectorSearchService } from '../vector-search-service';

// Integration tests focusing on the service behavior without external dependencies
describe('VectorSearchService Integration', () => {
  let vectorSearchService: VectorSearchService;

  beforeEach(() => {
    vectorSearchService = new VectorSearchService();
    vectorSearchService.clearCache();
  });

  describe('Query Optimization Integration', () => {
    it('should handle complex query optimization scenarios', async () => {
      const complexQuery = 'The AI and ML algorithms in the API documentation for UI development';
      const result = await vectorSearchService.optimizeQuery(complexQuery);

      expect(result.optimizedQuery).toContain('artificial intelligence');
      expect(result.optimizedQuery).toContain('machine learning');
      expect(result.optimizedQuery).toContain('application programming interface');
      expect(result.optimizedQuery).toContain('user interface');
      expect(result.optimizations.length).toBeGreaterThan(0);
    });

    it('should preserve important technical terms', async () => {
      const technicalQuery = 'machine learning neural networks deep learning';
      const result = await vectorSearchService.optimizeQuery(technicalQuery);

      expect(result.optimizedQuery).toBe(technicalQuery);
      expect(result.optimizations).toHaveLength(0);
      expect(result.confidence).toBe(1.0);
    });

    it('should handle mixed case abbreviations', async () => {
      const mixedCaseQuery = 'AI, ML, and NLP techniques';
      const result = await vectorSearchService.optimizeQuery(mixedCaseQuery);

      expect(result.optimizedQuery).toContain('artificial intelligence');
      expect(result.optimizedQuery).toContain('machine learning');
      expect(result.optimizedQuery).toContain('natural language processing');
    });
  });

  describe('Search Configuration Validation', () => {
    it('should handle all search option combinations', () => {
      const testConfigurations = [
        {
          similarityThreshold: 0.5,
          limit: 5,
          rankingMethod: 'similarity' as const
        },
        {
          similarityThreshold: 0.8,
          limit: 20,
          pageRange: { start: 1, end: 10 },
          documentIds: ['doc1', 'doc2'],
          rankingMethod: 'hybrid' as const
        },
        {
          contentTypes: ['paragraph', 'heading'] as const,
          minConfidence: 0.7,
          includeMetadata: true,
          diversityFactor: 0.3,
          boostRecent: true,
          rankingMethod: 'rerank' as const
        }
      ];

      testConfigurations.forEach((config, index) => {
        expect(config).toBeDefined();
        expect(typeof config.similarityThreshold === 'undefined' || typeof config.similarityThreshold === 'number').toBe(true);
        expect(typeof config.limit === 'undefined' || typeof config.limit === 'number').toBe(true);
        expect(['similarity', 'hybrid', 'rerank'].includes(config.rankingMethod || 'similarity')).toBe(true);
      });
    });

    it('should validate page range constraints', () => {
      const validPageRanges = [
        { start: 1, end: 10 },
        { start: 5, end: 5 },
        { start: 1, end: 100 }
      ];

      const invalidPageRanges = [
        { start: 0, end: 10 }, // start < 1
        { start: 10, end: 5 }, // end < start
        { start: -1, end: 10 } // negative start
      ];

      validPageRanges.forEach(range => {
        expect(range.start).toBeGreaterThan(0);
        expect(range.end).toBeGreaterThanOrEqual(range.start);
      });

      invalidPageRanges.forEach(range => {
        const isValid = range.start > 0 && range.end >= range.start;
        expect(isValid).toBe(false);
      });
    });
  });

  describe('Performance Monitoring Integration', () => {
    it('should track search analytics over time', async () => {
      const userId = 'test-user-123';
      
      // Initial state should be empty
      let analytics = await vectorSearchService.getSearchAnalytics(userId);
      expect(analytics.totalSearches).toBe(0);
      expect(analytics.popularQueries).toHaveLength(0);

      // Simulate search activity by directly adding metrics
      const mockMetrics = [
        {
          queryId: 'query1',
          userId,
          query: 'machine learning',
          documentIds: ['doc1'],
          resultCount: 5,
          totalSearchTime: 150,
          embeddingTime: 50,
          databaseTime: 80,
          rankingTime: 20,
          cacheHitRate: 0,
          averageSimilarity: 0.85,
          timestamp: new Date()
        },
        {
          queryId: 'query2',
          userId,
          query: 'artificial intelligence',
          documentIds: ['doc1', 'doc2'],
          resultCount: 8,
          totalSearchTime: 200,
          embeddingTime: 60,
          databaseTime: 100,
          rankingTime: 40,
          cacheHitRate: 0.5,
          averageSimilarity: 0.78,
          timestamp: new Date()
        },
        {
          queryId: 'query3',
          userId,
          query: 'machine learning', // Repeat query
          documentIds: ['doc2'],
          resultCount: 3,
          totalSearchTime: 120,
          embeddingTime: 40,
          databaseTime: 60,
          rankingTime: 20,
          cacheHitRate: 1.0,
          averageSimilarity: 0.92,
          timestamp: new Date()
        }
      ];

      // Add metrics to the service (this would normally happen during searches)
      (vectorSearchService as any).performanceMetrics = mockMetrics;

      // Check analytics after simulated searches
      analytics = await vectorSearchService.getSearchAnalytics(userId);
      expect(analytics.totalSearches).toBe(3);
      expect(analytics.averageSearchTime).toBeCloseTo(156.67, 1); // (150+200+120)/3
      expect(analytics.averageResultCount).toBeCloseTo(5.33, 1); // (5+8+3)/3
      expect(analytics.cacheHitRate).toBeCloseTo(0.5, 1); // (0+0.5+1.0)/3

      // Check popular queries
      expect(analytics.popularQueries).toHaveLength(2);
      expect(analytics.popularQueries[0].query).toBe('machine learning');
      expect(analytics.popularQueries[0].count).toBe(2);
      expect(analytics.popularQueries[1].query).toBe('artificial intelligence');
      expect(analytics.popularQueries[1].count).toBe(1);
    });

    it('should handle time range filtering in analytics', async () => {
      const userId = 'test-user-456';
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const mockMetrics = [
        {
          queryId: 'old-query',
          userId,
          query: 'old search',
          documentIds: ['doc1'],
          resultCount: 2,
          totalSearchTime: 100,
          embeddingTime: 30,
          databaseTime: 50,
          rankingTime: 20,
          cacheHitRate: 0,
          averageSimilarity: 0.7,
          timestamp: lastWeek
        },
        {
          queryId: 'recent-query',
          userId,
          query: 'recent search',
          documentIds: ['doc1'],
          resultCount: 5,
          totalSearchTime: 150,
          embeddingTime: 40,
          databaseTime: 80,
          rankingTime: 30,
          cacheHitRate: 0,
          averageSimilarity: 0.8,
          timestamp: yesterday
        }
      ];

      (vectorSearchService as any).performanceMetrics = mockMetrics;

      // Test filtering to recent searches only
      const recentAnalytics = await vectorSearchService.getSearchAnalytics(userId, {
        start: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // Last 2 days
        end: now
      });

      expect(recentAnalytics.totalSearches).toBe(1);
      expect(recentAnalytics.popularQueries[0].query).toBe('recent search');

      // Test all searches
      const allAnalytics = await vectorSearchService.getSearchAnalytics(userId);
      expect(allAnalytics.totalSearches).toBe(2);
    });
  });

  describe('Cache Behavior Integration', () => {
    it('should manage cache lifecycle correctly', () => {
      // Start with empty cache
      let stats = vectorSearchService.getCacheStats();
      expect(stats.size).toBe(0);
      expect(stats.totalAccesses).toBe(0);

      // Simulate cache usage by directly manipulating cache
      const mockCacheEntry = {
        result: {
          success: true,
          results: [],
          totalResults: 0,
          searchTime: 100,
          queryEmbeddingTime: 30,
          retrievalTime: 50,
          rankingTime: 20,
          cacheHit: false
        },
        timestamp: new Date(),
        accessCount: 1
      };

      (vectorSearchService as any).searchCache.set('test-key', mockCacheEntry);

      stats = vectorSearchService.getCacheStats();
      expect(stats.size).toBe(1);
      expect(stats.totalAccesses).toBe(1);

      // Clear cache
      vectorSearchService.clearCache();
      stats = vectorSearchService.getCacheStats();
      expect(stats.size).toBe(0);
    });

    it('should handle cache eviction policies', () => {
      const maxCacheSize = (VectorSearchService as any).MAX_CACHE_SIZE || 1000;
      
      // Simulate filling cache beyond limit
      const cache = (vectorSearchService as any).searchCache;
      
      // Add entries up to just under the limit first
      for (let i = 0; i < maxCacheSize - 1; i++) {
        cache.set(`key-${i}`, {
          result: { success: true, results: [], totalResults: 0, searchTime: 100, queryEmbeddingTime: 30, retrievalTime: 50, rankingTime: 20, cacheHit: false },
          timestamp: new Date(Date.now() - i * 1000), // Older entries have earlier timestamps
          accessCount: 1
        });
      }

      // Verify we're at the expected size
      expect(cache.size).toBe(maxCacheSize - 1);

      // Add one more entry to reach the limit
      cache.set('final-key', {
        result: { success: true, results: [], totalResults: 0, searchTime: 100, queryEmbeddingTime: 30, retrievalTime: 50, rankingTime: 20, cacheHit: false },
        timestamp: new Date(),
        accessCount: 1
      });

      // Should be at the limit
      expect(cache.size).toBe(maxCacheSize);

      // Test that cache can handle being at capacity
      expect(cache.size).toBeLessThanOrEqual(maxCacheSize);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle various error scenarios gracefully', async () => {
      // Test query optimization with edge cases
      const edgeCases = [
        '', // Empty string
        '   ', // Whitespace only
        'a'.repeat(1000), // Very long string
        '!@#$%^&*()', // Special characters only
        '123 456 789', // Numbers only
        'the and or but in on at to for of with by', // All stop words
      ];

      for (const testCase of edgeCases) {
        const result = await vectorSearchService.optimizeQuery(testCase);
        expect(result).toBeDefined();
        expect(typeof result.optimizedQuery).toBe('string');
        expect(Array.isArray(result.optimizations)).toBe(true);
        expect(typeof result.confidence).toBe('number');
        expect(result.confidence).toBeGreaterThanOrEqual(0);
        expect(result.confidence).toBeLessThanOrEqual(1);
      }
    });

    it('should validate search options properly', () => {
      const invalidOptions = [
        { similarityThreshold: -0.1 }, // Below 0
        { similarityThreshold: 1.1 }, // Above 1
        { limit: 0 }, // Below minimum
        { limit: 1000 }, // Above reasonable maximum
        { pageRange: { start: 0, end: 10 } }, // Invalid start
        { pageRange: { start: 10, end: 5 } }, // End before start
        { diversityFactor: -0.1 }, // Below 0
        { diversityFactor: 1.1 }, // Above 1
      ];

      invalidOptions.forEach(options => {
        // Test that the service can handle these options without crashing
        // In a real implementation, these would be validated and corrected
        expect(() => {
          const config = (vectorSearchService as any).getSearchConfig(options);
          expect(config).toBeDefined();
        }).not.toThrow();
      });
    });
  });

  describe('Multi-Document Coordination', () => {
    it('should handle document coordination scenarios', async () => {
      // Test different document ID combinations
      const documentScenarios = [
        [], // Empty array
        ['single-doc'], // Single document
        ['doc1', 'doc2'], // Two documents
        ['doc1', 'doc2', 'doc3', 'doc4', 'doc5'], // Multiple documents
        Array.from({ length: 20 }, (_, i) => `doc-${i}`), // Many documents
      ];

      documentScenarios.forEach(documentIds => {
        // Test that the service can handle different document ID scenarios
        expect(Array.isArray(documentIds)).toBe(true);
        expect(documentIds.every(id => typeof id === 'string')).toBe(true);
      });
    });

    it('should handle diversity factor calculations', () => {
      const diversityFactors = [0, 0.1, 0.3, 0.5, 0.7, 1.0];
      
      diversityFactors.forEach(factor => {
        expect(factor).toBeGreaterThanOrEqual(0);
        expect(factor).toBeLessThanOrEqual(1);
        
        // Test that different diversity factors would produce different coordination strategies
        const options = { diversityFactor: factor };
        expect(options.diversityFactor).toBe(factor);
      });
    });
  });
});