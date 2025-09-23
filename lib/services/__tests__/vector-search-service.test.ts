import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VectorSearchService, type VectorSearchOptions } from '../vector-search-service';
import { embeddingService } from '../embedding-service';
import * as supabaseHelpers from '@/lib/utils/supabase-helpers';

// Mock dependencies
vi.mock('../embedding-service');
vi.mock('@/lib/utils/supabase-helpers');
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {}
}));

const mockEmbeddingService = embeddingService as any;
const mockGetAuthenticatedSupabaseClient = supabaseHelpers.getAuthenticatedSupabaseClient as any;

// Mock Supabase client
const mockSupabaseClient = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      lt: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() => ({
            in: vi.fn(() => ({
              gte: vi.fn(() => ({
                lte: vi.fn(() => ({
                  in: vi.fn(() => ({
                    gte: vi.fn(() => Promise.resolve({ data: [], error: null }))
                  }))
                }))
              }))
            }))
          }))
        }))
      }))
    }))
  }))
};

describe('VectorSearchService', () => {
  let vectorSearchService: VectorSearchService;

  beforeEach(() => {
    vectorSearchService = new VectorSearchService();
    vi.clearAllMocks();
    
    // Setup default mocks
    vi.mocked(mockGetAuthenticatedSupabaseClient).mockResolvedValue({
      client: mockSupabaseClient,
      userId: 'test-user-id'
    } as any);

    vi.mocked(mockEmbeddingService.generateEmbedding).mockResolvedValue({
      id: 'test-embedding-id',
      text: 'test query',
      embedding: new Array(1536).fill(0.1),
      model: 'deepseek-chat',
      tokenCount: 10,
      processingTime: 100,
      cached: false
    });
  });

  afterEach(() => {
    vectorSearchService.clearCache();
  });

  describe('searchSimilarChunks', () => {
    it('should perform basic vector search successfully', async () => {
      // Mock database response
      const mockChunks = [
        {
          id: 'chunk-1',
          user_id: 'test-user-id',
          document_id: 'doc-1',
          chunk_index: 0,
          content: 'This is a test chunk about artificial intelligence.',
          token_count: 10,
          page_number: 1,
          section_title: 'Introduction',
          metadata: {
            documentTitle: 'Test Document',
            extractionMethod: 'syncfusion',
            processingVersion: '1.0',
            contentType: 'paragraph',
            confidence: 0.9
          },
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          similarity: 0.1 // Distance, will be converted to similarity
        }
      ];

      // Setup mock chain
      const mockQuery = {
        select: vi.fn(() => ({
          lt: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => Promise.resolve({ data: mockChunks, error: null }))
            }))
          }))
        }))
      };
      mockSupabaseClient.from.mockReturnValue(mockQuery as any);

      const result = await vectorSearchService.searchSimilarChunks('artificial intelligence');

      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(1);
      expect(result.results[0].chunk.content).toBe('This is a test chunk about artificial intelligence.');
      expect(result.results[0].similarity).toBe(0.9); // 1 - 0.1
      expect(result.results[0].rank).toBe(1);
      expect(result.cacheHit).toBe(false);
      expect(result.searchTime).toBeGreaterThan(0);
    });

    it('should apply similarity threshold filter', async () => {
      const options: VectorSearchOptions = {
        similarityThreshold: 0.8,
        limit: 5
      };

      const mockQuery = {
        select: vi.fn(() => ({
          lt: vi.fn((column, value) => {
            expect(value).toBe(1 - 0.8); // Should convert similarity to distance
            return {
              order: vi.fn(() => ({
                limit: vi.fn((limitValue) => {
                  expect(limitValue).toBe(5);
                  return Promise.resolve({ data: [], error: null });
                })
              }))
            };
          })
        }))
      };
      mockSupabaseClient.from.mockReturnValue(mockQuery as any);

      await vectorSearchService.searchSimilarChunks('test query', options);

      expect(mockQuery.select).toHaveBeenCalled();
    });

    it('should apply document ID filter', async () => {
      const options: VectorSearchOptions = {
        documentIds: ['doc-1', 'doc-2']
      };

      const mockQuery = {
        select: vi.fn(() => ({
          lt: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => ({
                in: vi.fn((column, values) => {
                  expect(column).toBe('document_id');
                  expect(values).toEqual(['doc-1', 'doc-2']);
                  return Promise.resolve({ data: [], error: null });
                })
              }))
            }))
          }))
        }))
      };
      mockSupabaseClient.from.mockReturnValue(mockQuery as any);

      await vectorSearchService.searchSimilarChunks('test query', options);

      expect(mockQuery.select).toHaveBeenCalled();
    });

    it('should apply page range filter', async () => {
      const options: VectorSearchOptions = {
        pageRange: { start: 5, end: 10 }
      };

      const mockQuery = {
        select: vi.fn(() => ({
          lt: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => ({
                gte: vi.fn((column, value) => {
                  expect(column).toBe('page_number');
                  expect(value).toBe(5);
                  return {
                    lte: vi.fn((column2, value2) => {
                      expect(column2).toBe('page_number');
                      expect(value2).toBe(10);
                      return Promise.resolve({ data: [], error: null });
                    })
                  };
                })
              }))
            }))
          }))
        }))
      };
      mockSupabaseClient.from.mockReturnValue(mockQuery as any);

      await vectorSearchService.searchSimilarChunks('test query', options);

      expect(mockQuery.select).toHaveBeenCalled();
    });

    it('should handle search errors gracefully', async () => {
      const mockQuery = {
        select: vi.fn(() => ({
          lt: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => Promise.resolve({ 
                data: null, 
                error: { message: 'Database connection failed' } 
              }))
            }))
          }))
        }))
      };
      mockSupabaseClient.from.mockReturnValue(mockQuery as any);

      const result = await vectorSearchService.searchSimilarChunks('test query');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Database connection failed');
      expect(result.results).toHaveLength(0);
    });

    it('should use cache for repeated queries', async () => {
      const mockChunks = [{
        id: 'chunk-1',
        user_id: 'test-user-id',
        document_id: 'doc-1',
        chunk_index: 0,
        content: 'Cached content',
        token_count: 10,
        page_number: 1,
        section_title: null,
        metadata: {
          documentTitle: 'Test Document',
          extractionMethod: 'syncfusion',
          processingVersion: '1.0',
          contentType: 'paragraph'
        },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        similarity: 0.2
      }];

      const mockQuery = {
        select: vi.fn(() => ({
          lt: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => Promise.resolve({ data: mockChunks, error: null }))
            }))
          }))
        }))
      };
      mockSupabaseClient.from.mockReturnValue(mockQuery as any);

      // First search
      const result1 = await vectorSearchService.searchSimilarChunks('cached query');
      expect(result1.cacheHit).toBe(false);

      // Second search should use cache
      const result2 = await vectorSearchService.searchSimilarChunks('cached query');
      expect(result2.cacheHit).toBe(true);
      expect(result2.results).toHaveLength(1);
    });
  });

  describe('searchMultipleDocuments', () => {
    it('should coordinate search across multiple documents', async () => {
      const mockChunks = [
        {
          id: 'chunk-1',
          user_id: 'test-user-id',
          document_id: 'doc-1',
          chunk_index: 0,
          content: 'Content from document 1',
          token_count: 10,
          page_number: 1,
          section_title: null,
          metadata: {
            documentTitle: 'Document 1',
            extractionMethod: 'syncfusion',
            processingVersion: '1.0',
            contentType: 'paragraph'
          },
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          similarity: 0.1
        },
        {
          id: 'chunk-2',
          user_id: 'test-user-id',
          document_id: 'doc-2',
          chunk_index: 0,
          content: 'Content from document 2',
          token_count: 10,
          page_number: 1,
          section_title: null,
          metadata: {
            documentTitle: 'Document 2',
            extractionMethod: 'syncfusion',
            processingVersion: '1.0',
            contentType: 'paragraph'
          },
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          similarity: 0.2
        }
      ];

      // Mock document titles query
      const mockDocQuery = {
        select: vi.fn(() => ({
          in: vi.fn(() => Promise.resolve({
            data: [
              { id: 'doc-1', filename: 'Document 1.pdf' },
              { id: 'doc-2', filename: 'Document 2.pdf' }
            ],
            error: null
          }))
        }))
      };

      // Mock chunks query
      const mockChunkQuery = {
        select: vi.fn(() => ({
          lt: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => ({
                in: vi.fn(() => Promise.resolve({ data: mockChunks, error: null }))
              }))
            }))
          }))
        }))
      };

      mockSupabaseClient.from
        .mockReturnValueOnce(mockChunkQuery as any) // First call for chunks
        .mockReturnValueOnce(mockDocQuery as any); // Second call for document titles

      const result = await vectorSearchService.searchMultipleDocuments(
        'test query',
        ['doc-1', 'doc-2']
      );

      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(2);
      expect(result.documentBreakdown).toHaveProperty('doc-1');
      expect(result.documentBreakdown).toHaveProperty('doc-2');
      expect(result.documentBreakdown['doc-1'].resultCount).toBe(1);
      expect(result.documentBreakdown['doc-2'].resultCount).toBe(1);
    });

    it('should handle empty results for some documents', async () => {
      const mockChunks = [
        {
          id: 'chunk-1',
          user_id: 'test-user-id',
          document_id: 'doc-1',
          chunk_index: 0,
          content: 'Only content from document 1',
          token_count: 10,
          page_number: 1,
          section_title: null,
          metadata: {
            documentTitle: 'Document 1',
            extractionMethod: 'syncfusion',
            processingVersion: '1.0',
            contentType: 'paragraph'
          },
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          similarity: 0.1
        }
      ];

      const mockDocQuery = {
        select: vi.fn(() => ({
          in: vi.fn(() => Promise.resolve({
            data: [
              { id: 'doc-1', filename: 'Document 1.pdf' },
              { id: 'doc-2', filename: 'Document 2.pdf' }
            ],
            error: null
          }))
        }))
      };

      const mockChunkQuery = {
        select: vi.fn(() => ({
          lt: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => ({
                in: vi.fn(() => Promise.resolve({ data: mockChunks, error: null }))
              }))
            }))
          }))
        }))
      };

      mockSupabaseClient.from
        .mockReturnValueOnce(mockChunkQuery as any)
        .mockReturnValueOnce(mockDocQuery as any);

      const result = await vectorSearchService.searchMultipleDocuments(
        'test query',
        ['doc-1', 'doc-2']
      );

      expect(result.success).toBe(true);
      expect(result.documentBreakdown['doc-1'].resultCount).toBe(1);
      expect(result.documentBreakdown['doc-2'].resultCount).toBe(0);
      expect(result.documentBreakdown['doc-2'].topResult).toBeUndefined();
    });
  });

  describe('ranking algorithms', () => {
    it('should rank results by similarity', async () => {
      const mockChunks = [
        {
          id: 'chunk-1',
          user_id: 'test-user-id',
          document_id: 'doc-1',
          chunk_index: 0,
          content: 'Lower similarity content',
          token_count: 10,
          page_number: 1,
          section_title: null,
          metadata: {
            documentTitle: 'Test Document',
            extractionMethod: 'syncfusion',
            processingVersion: '1.0',
            contentType: 'paragraph'
          },
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          similarity: 0.3 // Lower similarity (higher distance)
        },
        {
          id: 'chunk-2',
          user_id: 'test-user-id',
          document_id: 'doc-1',
          chunk_index: 1,
          content: 'Higher similarity content',
          token_count: 10,
          page_number: 1,
          section_title: null,
          metadata: {
            documentTitle: 'Test Document',
            extractionMethod: 'syncfusion',
            processingVersion: '1.0',
            contentType: 'paragraph'
          },
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          similarity: 0.1 // Higher similarity (lower distance)
        }
      ];

      const mockQuery = {
        select: vi.fn(() => ({
          lt: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => Promise.resolve({ data: mockChunks, error: null }))
            }))
          }))
        }))
      };
      mockSupabaseClient.from.mockReturnValue(mockQuery as any);

      const result = await vectorSearchService.searchSimilarChunks('test query', {
        rankingMethod: 'similarity'
      });

      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(2);
      // Higher similarity should be ranked first
      expect(result.results[0].chunk.id).toBe('chunk-2');
      expect(result.results[0].rank).toBe(1);
      expect(result.results[1].chunk.id).toBe('chunk-1');
      expect(result.results[1].rank).toBe(2);
    });

    it('should apply hybrid ranking with multiple factors', async () => {
      const mockChunks = [
        {
          id: 'chunk-1',
          user_id: 'test-user-id',
          document_id: 'doc-1',
          chunk_index: 0,
          content: 'Paragraph content',
          token_count: 10,
          page_number: 1,
          section_title: null,
          metadata: {
            documentTitle: 'Test Document',
            extractionMethod: 'syncfusion',
            processingVersion: '1.0',
            contentType: 'paragraph',
            confidence: 0.8
          },
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          similarity: 0.2
        },
        {
          id: 'chunk-2',
          user_id: 'test-user-id',
          document_id: 'doc-1',
          chunk_index: 1,
          content: 'Heading content',
          token_count: 10,
          page_number: 1,
          section_title: 'Important Section',
          metadata: {
            documentTitle: 'Test Document',
            extractionMethod: 'syncfusion',
            processingVersion: '1.0',
            contentType: 'heading', // Higher content type score
            confidence: 0.9
          },
          created_at: new Date().toISOString(), // More recent
          updated_at: new Date().toISOString(),
          similarity: 0.25 // Slightly lower similarity
        }
      ];

      const mockQuery = {
        select: vi.fn(() => ({
          lt: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => Promise.resolve({ data: mockChunks, error: null }))
            }))
          }))
        }))
      };
      mockSupabaseClient.from.mockReturnValue(mockQuery as any);

      const result = await vectorSearchService.searchSimilarChunks('test query', {
        rankingMethod: 'hybrid'
      });

      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(2);
      // Hybrid ranking should consider content type and other factors
      expect(result.results[0].relevanceScore).toBeGreaterThan(0);
      expect(result.results[1].relevanceScore).toBeGreaterThan(0);
    });
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
      expect(result.optimizations).toContain('Expanded "AI" to "artificial intelligence"');
      expect(result.optimizations).toContain('Expanded "ML" to "machine learning"');
    });

    it('should return original query if no optimizations needed', async () => {
      const originalQuery = 'machine learning algorithms';
      const result = await vectorSearchService.optimizeQuery(originalQuery);

      expect(result.optimizedQuery).toBe(originalQuery);
      expect(result.optimizations).toHaveLength(0);
      expect(result.confidence).toBe(1.0);
    });
  });

  describe('performance monitoring', () => {
    it('should record performance metrics', async () => {
      const mockQuery = {
        select: vi.fn(() => ({
          lt: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
            }))
          }))
        }))
      };
      mockSupabaseClient.from.mockReturnValue(mockQuery as any);

      await vectorSearchService.searchSimilarChunks('performance test');

      const analytics = await vectorSearchService.getSearchAnalytics('test-user-id');
      expect(analytics.totalSearches).toBe(1);
      expect(analytics.averageSearchTime).toBeGreaterThan(0);
    });

    it('should provide search analytics', async () => {
      // Perform multiple searches to generate analytics data
      const mockQuery = {
        select: vi.fn(() => ({
          lt: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
            }))
          }))
        }))
      };
      mockSupabaseClient.from.mockReturnValue(mockQuery as any);

      await vectorSearchService.searchSimilarChunks('query 1');
      await vectorSearchService.searchSimilarChunks('query 2');
      await vectorSearchService.searchSimilarChunks('query 1'); // Repeat query

      const analytics = await vectorSearchService.getSearchAnalytics('test-user-id');
      
      expect(analytics.totalSearches).toBe(3);
      expect(analytics.popularQueries).toHaveLength(2);
      expect(analytics.popularQueries[0].query).toBe('query 1');
      expect(analytics.popularQueries[0].count).toBe(2);
    });
  });

  describe('cache management', () => {
    it('should provide cache statistics', () => {
      const stats = vectorSearchService.getCacheStats();
      
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('hitRate');
      expect(stats).toHaveProperty('totalAccesses');
      expect(stats).toHaveProperty('averageAge');
    });

    it('should clear cache when requested', async () => {
      // Add something to cache first
      const mockQuery = {
        select: vi.fn(() => ({
          lt: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
            }))
          }))
        }))
      };
      mockSupabaseClient.from.mockReturnValue(mockQuery as any);

      await vectorSearchService.searchSimilarChunks('cache test');
      
      let stats = vectorSearchService.getCacheStats();
      expect(stats.size).toBeGreaterThan(0);

      vectorSearchService.clearCache();
      
      stats = vectorSearchService.getCacheStats();
      expect(stats.size).toBe(0);
    });
  });

  describe('error handling', () => {
    it('should handle embedding generation errors', async () => {
      vi.mocked(mockEmbeddingService.generateEmbedding).mockRejectedValue(
        new Error('Embedding service unavailable')
      );

      const result = await vectorSearchService.searchSimilarChunks('test query');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Embedding service unavailable');
    });

    it('should handle database connection errors', async () => {
      vi.mocked(mockGetAuthenticatedSupabaseClient).mockRejectedValue(
        new Error('Database connection failed')
      );

      const result = await vectorSearchService.searchSimilarChunks('test query');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Database connection failed');
    });

    it('should handle malformed database responses', async () => {
      const mockQuery = {
        select: vi.fn(() => ({
          lt: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => Promise.resolve({ data: null, error: null }))
            }))
          }))
        }))
      };
      mockSupabaseClient.from.mockReturnValue(mockQuery as any);

      const result = await vectorSearchService.searchSimilarChunks('test query');

      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(0);
    });
  });

  describe('content type filtering', () => {
    it('should filter by content types', async () => {
      const options: VectorSearchOptions = {
        contentTypes: ['heading', 'paragraph']
      };

      const mockQuery = {
        select: vi.fn(() => ({
          lt: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => ({
                in: vi.fn((column, values) => {
                  expect(column).toBe('metadata->contentType');
                  expect(values).toEqual(['heading', 'paragraph']);
                  return Promise.resolve({ data: [], error: null });
                })
              }))
            }))
          }))
        }))
      };
      mockSupabaseClient.from.mockReturnValue(mockQuery as any);

      await vectorSearchService.searchSimilarChunks('test query', options);

      expect(mockQuery.select).toHaveBeenCalled();
    });

    it('should filter by minimum confidence', async () => {
      const options: VectorSearchOptions = {
        minConfidence: 0.8
      };

      const mockQuery = {
        select: vi.fn(() => ({
          lt: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => ({
                gte: vi.fn((column, value) => {
                  expect(column).toBe('metadata->confidence');
                  expect(value).toBe(0.8);
                  return Promise.resolve({ data: [], error: null });
                })
              }))
            }))
          }))
        }))
      };
      mockSupabaseClient.from.mockReturnValue(mockQuery as any);

      await vectorSearchService.searchSimilarChunks('test query', options);

      expect(mockQuery.select).toHaveBeenCalled();
    });
  });
});