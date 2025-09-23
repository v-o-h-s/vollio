import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import { EmbeddingService, embeddingService } from '../embedding-service';

// Mock fetch globally
global.fetch = vi.fn();

describe('EmbeddingService', () => {
  let service: EmbeddingService;
  const mockFetch = fetch as Mock;

  beforeEach(() => {
    // Create a new instance for each test to avoid state pollution
    service = new (EmbeddingService as any)();
    mockFetch.mockClear();
    
    // Mock environment variable
    process.env.DEEPSEEK_AP_KEY = 'test-api-key';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with DeepSeek API key', () => {
      expect(() => new (EmbeddingService as any)()).not.toThrow();
    });

    it('should throw error if API key is missing', () => {
      delete process.env.DEEPSEEK_AP_KEY;
      expect(() => new (EmbeddingService as any)()).toThrow('DeepSeek API key not found');
    });
  });

  describe('generateEmbedding', () => {
    const mockEmbeddingResponse = {
      object: 'list',
      data: [{
        object: 'embedding',
        embedding: new Array(1536).fill(0).map(() => Math.random() - 0.5),
        index: 0
      }],
      model: 'deepseek-chat',
      usage: {
        prompt_tokens: 10,
        total_tokens: 10
      }
    };

    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockEmbeddingResponse)
      });
    });

    it('should generate embedding for single text', async () => {
      const text = 'This is a test document about machine learning.';
      const result = await service.generateEmbedding(text);

      expect(result).toMatchObject({
        text,
        model: 'deepseek-chat',
        cached: false
      });
      expect(result.embedding).toHaveLength(1536);
      expect(result.id).toBeDefined();
      expect(result.tokenCount).toBeGreaterThan(0);
      expect(result.processingTime).toBeGreaterThanOrEqual(0);
    });

    it('should use cached embedding when available', async () => {
      const text = 'Cached test text';
      
      // First call - should hit API
      const result1 = await service.generateEmbedding(text, { cacheEnabled: true });
      expect(result1.cached).toBe(false);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second call - should use cache
      const result2 = await service.generateEmbedding(text, { cacheEnabled: true });
      expect(result2.cached).toBe(true);
      expect(result2.processingTime).toBe(0);
      expect(mockFetch).toHaveBeenCalledTimes(1); // No additional API call
    });

    it('should validate embedding quality when enabled', async () => {
      // Mock a high-quality embedding (reasonable values)
      const highQualityEmbedding = new Array(1536).fill(0).map(() => (Math.random() - 0.5) * 0.1);
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          ...mockEmbeddingResponse,
          data: [{
            ...mockEmbeddingResponse.data[0],
            embedding: highQualityEmbedding
          }]
        })
      });

      const result = await service.generateEmbedding('test', { 
        validateQuality: true,
        qualityThreshold: 0.5
      });

      expect(result.qualityScore).toBeDefined();
      expect(result.qualityScore).toBeGreaterThan(0);
    });

    it('should throw error for low quality embeddings', async () => {
      // Mock a low-quality embedding (all zeros)
      const lowQualityEmbedding = new Array(1536).fill(0);
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          ...mockEmbeddingResponse,
          data: [{
            ...mockEmbeddingResponse.data[0],
            embedding: lowQualityEmbedding
          }]
        })
      });

      await expect(service.generateEmbedding('test', { 
        validateQuality: true,
        qualityThreshold: 0.5
      })).rejects.toThrow('Embedding quality score');
    });

    it('should handle API errors with retry logic', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockEmbeddingResponse)
        });

      const result = await service.generateEmbedding('test', { 
        retryAttempts: 3,
        retryDelay: 10 // Short delay for testing
      });

      expect(result).toBeDefined();
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('should fail after exhausting retry attempts', async () => {
      mockFetch.mockRejectedValue(new Error('Persistent network error'));

      await expect(service.generateEmbedding('test', { 
        retryAttempts: 2,
        retryDelay: 10
      })).rejects.toThrow('Failed to generate embedding');

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('generateBatchEmbeddings', () => {
    const mockBatchResponse = {
      object: 'list',
      data: [
        {
          object: 'embedding',
          embedding: new Array(1536).fill(0).map(() => Math.random() - 0.5),
          index: 0
        },
        {
          object: 'embedding',
          embedding: new Array(1536).fill(0).map(() => Math.random() - 0.5),
          index: 1
        }
      ],
      model: 'deepseek-chat',
      usage: {
        prompt_tokens: 20,
        total_tokens: 20
      }
    };

    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockBatchResponse)
      });
    });

    it('should generate embeddings for multiple texts', async () => {
      const texts = [
        'First document about AI',
        'Second document about machine learning'
      ];

      const result = await service.generateBatchEmbeddings(texts);

      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(2);
      expect(result.totalProcessed).toBe(2);
      expect(result.cacheHitRate).toBe(0);
      
      result.results.forEach((embedding, index) => {
        expect(embedding.text).toBe(texts[index]);
        expect(embedding.embedding).toHaveLength(1536);
        expect(embedding.cached).toBe(false);
      });
    });

    it('should process texts in batches', async () => {
      const texts = new Array(250).fill(0).map((_, i) => `Document ${i}`);
      
      await service.generateBatchEmbeddings(texts, { batchSize: 100 });

      // Should make 3 API calls (100, 100, 50)
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('should handle mixed cached and uncached results', async () => {
      const texts = ['cached text', 'new text'];
      
      // First call to cache one text
      await service.generateEmbedding(texts[0], { cacheEnabled: true });
      mockFetch.mockClear();

      // Mock response for only the uncached text
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          object: 'list',
          data: [{
            object: 'embedding',
            embedding: new Array(1536).fill(0).map(() => Math.random() - 0.5),
            index: 0
          }],
          model: 'deepseek-chat',
          usage: { prompt_tokens: 10, total_tokens: 10 }
        })
      });

      const result = await service.generateBatchEmbeddings(texts, { cacheEnabled: true });

      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(2);
      expect(result.cacheHitRate).toBe(0.5); // 1 out of 2 cached
      expect(mockFetch).toHaveBeenCalledTimes(1); // Only one API call for uncached text
    });

    it('should calculate quality metrics for batch', async () => {
      const texts = ['text1', 'text2'];
      
      const result = await service.generateBatchEmbeddings(texts, { 
        validateQuality: true 
      });

      expect(result.success).toBe(true);
      expect(result.averageQualityScore).toBeDefined();
      expect(result.averageQualityScore).toBeGreaterThan(0);
    });

    it('should handle batch processing errors gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('API error'));

      const result = await service.generateBatchEmbeddings(['test1', 'test2']);

      expect(result.success).toBe(false);
      expect(result.results).toHaveLength(0);
      expect(result.error).toContain('API error');
    });
  });

  describe('cache management', () => {
    it('should evict old entries when cache is full', async () => {
      const mockResponse = {
        object: 'list',
        data: [{
          object: 'embedding',
          embedding: new Array(1536).fill(0).map(() => Math.random() - 0.5),
          index: 0
        }],
        model: 'deepseek-chat',
        usage: { prompt_tokens: 10, total_tokens: 10 }
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      // Fill cache beyond limit (simulate by setting a small limit)
      const originalMaxSize = (EmbeddingService as any).MAX_CACHE_SIZE;
      (EmbeddingService as any).MAX_CACHE_SIZE = 5;

      try {
        // Generate embeddings to fill cache
        for (let i = 0; i < 10; i++) {
          await service.generateEmbedding(`text ${i}`, { cacheEnabled: true });
        }

        const stats = service.getCacheStats();
        expect(stats.size).toBeLessThanOrEqual(5);
      } finally {
        (EmbeddingService as any).MAX_CACHE_SIZE = originalMaxSize;
      }
    });

    it('should expire old cache entries', async () => {
      const text = 'expiring text';
      
      // Mock short TTL
      const originalTTL = (EmbeddingService as any).CACHE_TTL;
      (EmbeddingService as any).CACHE_TTL = 10; // 10ms

      try {
        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({
            object: 'list',
            data: [{
              object: 'embedding',
              embedding: new Array(1536).fill(0).map(() => Math.random() - 0.5),
              index: 0
            }],
            model: 'deepseek-chat',
            usage: { prompt_tokens: 10, total_tokens: 10 }
          })
        });

        // First call - cache the result
        await service.generateEmbedding(text, { cacheEnabled: true });
        expect(mockFetch).toHaveBeenCalledTimes(1);

        // Wait for cache to expire
        await new Promise(resolve => setTimeout(resolve, 20));

        // Second call - should hit API again due to expiration
        await service.generateEmbedding(text, { cacheEnabled: true });
        expect(mockFetch).toHaveBeenCalledTimes(2);
      } finally {
        (EmbeddingService as any).CACHE_TTL = originalTTL;
      }
    });

    it('should provide cache statistics', () => {
      const stats = service.getCacheStats();
      
      expect(stats).toMatchObject({
        size: expect.any(Number),
        hitRate: expect.any(Number),
        totalAccesses: expect.any(Number),
        averageAge: expect.any(Number)
      });
    });

    it('should clear cache', () => {
      service.clearCache();
      const stats = service.getCacheStats();
      expect(stats.size).toBe(0);
    });
  });

  describe('model version management', () => {
    it('should get active models', () => {
      const activeModels = service.getActiveModels();
      
      expect(activeModels).toBeInstanceOf(Array);
      expect(activeModels.length).toBeGreaterThan(0);
      expect(activeModels[0]).toMatchObject({
        name: expect.any(String),
        version: expect.any(String),
        dimensions: expect.any(Number),
        maxTokens: expect.any(Number),
        isActive: true
      });
    });

    it('should add new model version', () => {
      const newModel = {
        name: 'test-model',
        version: '2.0',
        dimensions: 768,
        maxTokens: 4096,
        isActive: true
      };

      service.addModelVersion(newModel);
      const activeModels = service.getActiveModels();
      
      expect(activeModels.some(model => model.name === 'test-model')).toBe(true);
    });

    it('should migrate embeddings between models', async () => {
      const texts = ['text1', 'text2'];
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          object: 'list',
          data: [{
            object: 'embedding',
            embedding: new Array(1536).fill(0).map(() => Math.random() - 0.5),
            index: 0
          }],
          model: 'new-model',
          usage: { prompt_tokens: 10, total_tokens: 10 }
        })
      });

      const result = await service.migrateEmbeddings('old-model', 'new-model', texts);
      
      expect(result.migrated).toBe(texts.length);
      expect(result.failed).toBe(0);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('quality validation', () => {
    it('should validate high-quality embeddings', () => {
      // Create a realistic embedding with good properties
      const goodEmbedding = new Array(1536).fill(0).map(() => (Math.random() - 0.5) * 0.1);
      
      // Access private method for testing
      const qualityScore = (service as any).validateEmbeddingQuality(goodEmbedding);
      
      expect(qualityScore).toBeGreaterThan(0);
      expect(qualityScore).toBeLessThanOrEqual(1);
    });

    it('should reject low-quality embeddings', () => {
      // Create a poor embedding (all zeros)
      const badEmbedding = new Array(1536).fill(0);
      
      const qualityScore = (service as any).validateEmbeddingQuality(badEmbedding);
      
      expect(qualityScore).toBe(0);
    });

    it('should calculate quality metrics correctly', () => {
      const embedding = [0.1, -0.2, 0.3, -0.1, 0.0];
      
      const metrics = (service as any).calculateQualityMetrics(embedding);
      
      expect(metrics).toMatchObject({
        magnitude: expect.any(Number),
        variance: expect.any(Number),
        sparsity: expect.any(Number),
        dimensionality: expect.any(Number),
        isValid: expect.any(Boolean)
      });
      
      expect(metrics.magnitude).toBeGreaterThan(0);
      expect(metrics.isValid).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle network timeouts', async () => {
      mockFetch.mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      );

      await expect(service.generateEmbedding('test', { 
        timeout: 50,
        retryAttempts: 1
      })).rejects.toThrow('Failed to generate embedding');
    });

    it('should handle malformed API responses', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ invalid: 'response' })
      });

      await expect(service.generateEmbedding('test')).rejects.toThrow('Invalid response structure');
    });

    it('should handle API error responses', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: () => Promise.resolve({ error: 'Rate limit exceeded' })
      });

      await expect(service.generateEmbedding('test', { 
        retryAttempts: 1 
      })).rejects.toThrow('DeepSeek API error: 429');
    });
  });

  describe('singleton instance', () => {
    it('should export a singleton instance', () => {
      expect(embeddingService).toBeInstanceOf(EmbeddingService);
    });
  });
});