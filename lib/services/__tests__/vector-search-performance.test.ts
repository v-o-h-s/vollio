import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VectorSearchService } from '../vector-search-service';

describe('VectorSearchService Performance', () => {
  let vectorSearchService: VectorSearchService;

  beforeEach(() => {
    vectorSearchService = new VectorSearchService();
    vectorSearchService.clearCache();
  });

  describe('Query Optimization Performance', () => {
    it('should optimize queries efficiently', async () => {
      const queries = [
        'machine learning algorithms',
        'the quick brown fox jumps over the lazy dog',
        'AI and ML in modern applications',
        'natural language processing techniques',
        'deep learning neural networks'
      ];

      const startTime = Date.now();
      
      for (const query of queries) {
        const result = await vectorSearchService.optimizeQuery(query);
        expect(result).toBeDefined();
        expect(typeof result.optimizedQuery).toBe('string');
        expect(Array.isArray(result.optimizations)).toBe(true);
        expect(typeof result.confidence).toBe('number');
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // Should complete all optimizations in reasonable time
      expect(totalTime).toBeLessThan(1000); // Less than 1 second
    });

    it('should handle batch query optimization', async () => {
      const batchQueries = Array.from({ length: 100 }, (_, i) => 
        `test query ${i} with AI and ML content`
      );

      const startTime = Date.now();
      
      const results = await Promise.all(
        batchQueries.map(query => vectorSearchService.optimizeQuery(query))
      );

      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      expect(results).toHaveLength(100);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.optimizedQuery).toContain('artificial intelligence');
        expect(result.optimizedQuery).toContain('machine learning');
      });

      // Should handle batch processing efficiently
      expect(totalTime).toBeLessThan(5000); // Less than 5 seconds for 100 queries
    });
  });

  describe('Cache Performance', () => {
    it('should provide fast cache operations', () => {
      const iterations = 1000;
      
      // Test cache write performance
      const writeStartTime = Date.now();
      const cache = (vectorSearchService as any).searchCache;
      
      for (let i = 0; i < iterations; i++) {
        cache.set(`key-${i}`, {
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
        });
      }
      
      const writeEndTime = Date.now();
      const writeTime = writeEndTime - writeStartTime;
      
      // Test cache read performance
      const readStartTime = Date.now();
      
      for (let i = 0; i < iterations; i++) {
        const entry = cache.get(`key-${i}`);
        expect(entry).toBeDefined();
      }
      
      const readEndTime = Date.now();
      const readTime = readEndTime - readStartTime;
      
      // Cache operations should be fast
      expect(writeTime).toBeLessThan(1000); // Less than 1 second for 1000 writes
      expect(readTime).toBeLessThan(500); // Less than 0.5 seconds for 1000 reads
      
      // Verify cache size
      expect(cache.size).toBe(iterations);
    });

    it('should handle cache statistics efficiently', () => {
      // Add some entries to cache
      const cache = (vectorSearchService as any).searchCache;
      for (let i = 0; i < 100; i++) {
        cache.set(`key-${i}`, {
          result: { success: true, results: [], totalResults: 0, searchTime: 100, queryEmbeddingTime: 30, retrievalTime: 50, rankingTime: 20, cacheHit: false },
          timestamp: new Date(),
          accessCount: Math.floor(Math.random() * 10) + 1
        });
      }

      const startTime = Date.now();
      const stats = vectorSearchService.getCacheStats();
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(100); // Should be very fast
      expect(stats.size).toBe(100);
      expect(stats.totalAccesses).toBeGreaterThan(0);
      expect(stats.averageAge).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Analytics Performance', () => {
    it('should handle analytics calculation efficiently', async () => {
      const userId = 'performance-test-user';
      const metricsCount = 1000;
      
      // Generate mock metrics
      const mockMetrics = Array.from({ length: metricsCount }, (_, i) => ({
        queryId: `query-${i}`,
        userId,
        query: `test query ${i % 10}`, // Create some repeated queries
        documentIds: [`doc-${i % 5}`], // Distribute across 5 documents
        resultCount: Math.floor(Math.random() * 20) + 1,
        totalSearchTime: Math.floor(Math.random() * 500) + 50,
        embeddingTime: Math.floor(Math.random() * 100) + 10,
        databaseTime: Math.floor(Math.random() * 200) + 20,
        rankingTime: Math.floor(Math.random() * 50) + 5,
        cacheHitRate: Math.random(),
        averageSimilarity: Math.random() * 0.5 + 0.5, // 0.5 to 1.0
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Last 30 days
      }));

      // Set mock metrics
      (vectorSearchService as any).performanceMetrics = mockMetrics;

      const startTime = Date.now();
      const analytics = await vectorSearchService.getSearchAnalytics(userId);
      const endTime = Date.now();
      
      const calculationTime = endTime - startTime;
      
      // Analytics calculation should be fast even with many metrics
      expect(calculationTime).toBeLessThan(1000); // Less than 1 second
      
      // Verify analytics results
      expect(analytics.totalSearches).toBe(metricsCount);
      expect(analytics.averageSearchTime).toBeGreaterThan(0);
      expect(analytics.averageResultCount).toBeGreaterThan(0);
      expect(analytics.popularQueries.length).toBeGreaterThan(0);
      expect(analytics.performanceTrends.length).toBeGreaterThan(0);
    });

    it('should handle time range filtering efficiently', async () => {
      const userId = 'time-filter-test-user';
      const metricsCount = 5000;
      
      // Generate metrics over a longer time period
      const mockMetrics = Array.from({ length: metricsCount }, (_, i) => ({
        queryId: `query-${i}`,
        userId,
        query: `query ${i}`,
        documentIds: ['doc1'],
        resultCount: 5,
        totalSearchTime: 100,
        embeddingTime: 30,
        databaseTime: 50,
        rankingTime: 20,
        cacheHitRate: 0,
        averageSimilarity: 0.8,
        timestamp: new Date(Date.now() - i * 60 * 60 * 1000) // Spread over hours
      }));

      (vectorSearchService as any).performanceMetrics = mockMetrics;

      const timeRange = {
        start: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        end: new Date()
      };

      const startTime = Date.now();
      const analytics = await vectorSearchService.getSearchAnalytics(userId, timeRange);
      const endTime = Date.now();
      
      const filterTime = endTime - startTime;
      
      // Time range filtering should be efficient
      expect(filterTime).toBeLessThan(500); // Less than 0.5 seconds
      expect(analytics.totalSearches).toBeLessThan(metricsCount); // Should be filtered
      expect(analytics.totalSearches).toBeGreaterThan(0); // Should have some results
    });
  });

  describe('Memory Usage', () => {
    it('should manage memory efficiently with large datasets', () => {
      const initialMemory = process.memoryUsage();
      
      // Simulate large cache usage
      const cache = (vectorSearchService as any).searchCache;
      const largeDataSize = 10000;
      
      for (let i = 0; i < largeDataSize; i++) {
        cache.set(`large-key-${i}`, {
          result: {
            success: true,
            results: Array.from({ length: 10 }, (_, j) => ({
              chunk: {
                id: `chunk-${j}`,
                userId: 'test-user',
                documentId: 'test-doc',
                chunkIndex: j,
                content: `Large content chunk ${j} with lots of text data to simulate real usage patterns`,
                embedding: [],
                tokenCount: 50,
                pageNumber: 1,
                metadata: {
                  documentTitle: 'Test Document',
                  extractionMethod: 'syncfusion' as const,
                  processingVersion: '1.0',
                  contentType: 'paragraph' as const
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              similarity: 0.8,
              rank: j + 1,
              relevanceScore: 0.8
            })),
            totalResults: 10,
            searchTime: 100,
            queryEmbeddingTime: 30,
            retrievalTime: 50,
            rankingTime: 20,
            cacheHit: false
          },
          timestamp: new Date(),
          accessCount: 1
        });
      }

      const afterCacheMemory = process.memoryUsage();
      
      // Clear cache
      vectorSearchService.clearCache();
      
      const afterClearMemory = process.memoryUsage();
      
      // Memory should be managed reasonably
      const memoryIncrease = afterCacheMemory.heapUsed - initialMemory.heapUsed;
      const memoryDecrease = afterCacheMemory.heapUsed - afterClearMemory.heapUsed;
      
      // Should use memory for cache but not excessively
      expect(memoryIncrease).toBeGreaterThan(0);
      expect(memoryIncrease).toBeLessThan(500 * 1024 * 1024); // Less than 500MB
      
      // Should free some memory after clearing (though GC might not run immediately)
      expect(memoryDecrease).toBeGreaterThanOrEqual(0);
    });
  });
});