import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ChunkManagementService, ChunkQualityMetrics } from '../chunk-management-service';
import { ChunkMetadata } from '@/lib/types';

// Mock Supabase client with proper chaining
const mockSupabaseClient = {
  from: vi.fn(() => {
    const mockQuery = {
      select: vi.fn(() => mockQuery),
      eq: vi.fn(() => mockQuery),
      single: vi.fn(),
      order: vi.fn(() => mockQuery),
      limit: vi.fn(() => mockQuery),
      range: vi.fn(() => mockQuery),
      in: vi.fn(() => mockQuery),
      insert: vi.fn(() => mockQuery),
      update: vi.fn(() => mockQuery),
      delete: vi.fn(() => mockQuery),
      upsert: vi.fn(),
      gte: vi.fn(() => mockQuery),
      lt: vi.fn(() => mockQuery),
      or: vi.fn(() => mockQuery),
      not: vi.fn(() => mockQuery),
      filter: vi.fn(() => mockQuery)
    };
    return mockQuery;
  })
};

// Mock the supabase helpers
vi.mock('@/lib/utils/supabase-helpers', () => ({
  getAuthenticatedSupabaseClient: vi.fn(() => Promise.resolve({
    client: mockSupabaseClient,
    userId: 'test-user-id'
  }))
}));

describe('ChunkManagementService', () => {
  let service: ChunkManagementService;
  const mockUserId = 'test-user-id';
  const mockDocumentId = 'test-document-id';
  const mockChunkId = 'test-chunk-id';

  beforeEach(() => {
    service = new ChunkManagementService({
      enableVersioning: true,
      enableAnalytics: true,
      enableQualityScoring: true,
      qualityThreshold: 0.6,
      deduplicationThreshold: 0.95,
      maxVersionsPerChunk: 10
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('createChunk', () => {
    it('should create a new chunk with quality scoring', async () => {
      const mockChunkData = {
        content: 'This is a test chunk with meaningful content for quality assessment.',
        tokenCount: 12,
        pageNumber: 1,
        chunkIndex: 0,
        metadata: {
          documentTitle: 'Test Document',
          extractionMethod: 'syncfusion' as const,
          processingVersion: '1.0',
          contentType: 'paragraph' as const
        }
      };

      const mockCreatedChunk = {
        id: mockChunkId,
        user_id: mockUserId,
        document_id: mockDocumentId,
        chunk_index: 0,
        content: mockChunkData.content,
        token_count: mockChunkData.tokenCount,
        page_number: mockChunkData.pageNumber,
        metadata: mockChunkData.metadata,
        quality_score: 0.75,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      const mockQuery = mockSupabaseClient.from();
      mockQuery.single.mockResolvedValue({
        data: mockCreatedChunk,
        error: null
      });

      // Mock version creation
      mockQuery.single.mockResolvedValue({
        data: null,
        error: null
      });

      mockQuery.insert.mockResolvedValue({ error: null });
      mockQuery.upsert.mockResolvedValue({ error: null });

      const result = await service.createChunk(mockUserId, mockDocumentId, mockChunkData);

      expect(result).toEqual({
        id: mockChunkId,
        userId: mockUserId,
        documentId: mockDocumentId,
        chunkIndex: 0,
        content: mockChunkData.content,
        tokenCount: mockChunkData.tokenCount,
        pageNumber: mockChunkData.pageNumber,
        sectionTitle: undefined,
        metadata: mockChunkData.metadata,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        embedding: undefined
      });

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('document_chunks');
      expect(mockSupabaseClient.from().insert).toHaveBeenCalled();
    });

    it('should handle chunk creation errors', async () => {
      const mockChunkData = {
        content: 'Test content',
        tokenCount: 2,
        pageNumber: 1,
        chunkIndex: 0,
        metadata: {
          documentTitle: 'Test Document',
          extractionMethod: 'syncfusion' as const,
          processingVersion: '1.0',
          contentType: 'paragraph' as const
        }
      };

      const mockQuery = mockSupabaseClient.from();
      mockQuery.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });

      await expect(service.createChunk(mockUserId, mockDocumentId, mockChunkData))
        .rejects.toThrow('Failed to create chunk: Database error');
    });
  });

  describe('updateChunk', () => {
    it('should update chunk with versioning', async () => {
      const mockCurrentChunk = {
        id: mockChunkId,
        user_id: mockUserId,
        content: 'Original content',
        metadata: { contentType: 'paragraph' },
        token_count: 2
      };

      const mockUpdatedChunk = {
        ...mockCurrentChunk,
        content: 'Updated content',
        token_count: 3,
        updated_at: '2024-01-01T01:00:00Z'
      };

      const updateData = {
        content: 'Updated content',
        changeReason: 'Content improvement'
      };

      mockSupabaseClient.from().select().eq().single.mockResolvedValue({
        data: mockCurrentChunk,
        error: null
      });

      mockSupabaseClient.from().update().eq().select().single.mockResolvedValue({
        data: mockUpdatedChunk,
        error: null
      });

      // Mock version creation
      mockSupabaseClient.from().select().eq().order().limit().single.mockResolvedValue({
        data: { version: 1 },
        error: null
      });

      mockSupabaseClient.from().insert.mockResolvedValue({ error: null });
      mockSupabaseClient.from().upsert.mockResolvedValue({ error: null });

      const result = await service.updateChunk(mockChunkId, updateData);

      expect(result.content).toBe('Updated content');
      expect(mockSupabaseClient.from().update).toHaveBeenCalled();
    });

    it('should handle update errors', async () => {
      mockSupabaseClient.from().select().eq().single.mockResolvedValue({
        data: null,
        error: { message: 'Chunk not found' }
      });

      const updateData = {
        content: 'Updated content',
        changeReason: 'Test update'
      };

      await expect(service.updateChunk(mockChunkId, updateData))
        .rejects.toThrow('Failed to fetch chunk: Chunk not found');
    });
  });

  describe('getChunkWithVersions', () => {
    it('should retrieve chunk with versions and analytics', async () => {
      const mockChunk = {
        id: mockChunkId,
        user_id: mockUserId,
        content: 'Test content',
        metadata: { contentType: 'paragraph' }
      };

      const mockVersions = [
        {
          id: 'version-1',
          chunk_id: mockChunkId,
          version: 2,
          content: 'Updated content',
          change_reason: 'Content update'
        },
        {
          id: 'version-2',
          chunk_id: mockChunkId,
          version: 1,
          content: 'Original content',
          change_reason: 'Initial creation'
        }
      ];

      const mockAnalytics = {
        id: 'analytics-1',
        chunk_id: mockChunkId,
        user_id: mockUserId,
        usage_count: 5,
        total_relevance_score: 4.2
      };

      mockSupabaseClient.from().select().eq().single.mockResolvedValueOnce({
        data: mockChunk,
        error: null
      });

      mockSupabaseClient.from().select().eq().order.mockResolvedValueOnce({
        data: mockVersions,
        error: null
      });

      mockSupabaseClient.from().select().eq().single.mockResolvedValueOnce({
        data: mockAnalytics,
        error: null
      });

      mockSupabaseClient.from().select().eq().single.mockResolvedValueOnce({
        data: null,
        error: null
      });

      const result = await service.getChunkWithVersions(mockChunkId);

      expect(result.chunk.id).toBe(mockChunkId);
      expect(result.versions).toHaveLength(2);
      expect(result.versions[0].version).toBe(2);
      expect(result.analytics?.usageCount).toBe(5);
    });
  });

  describe('recordUsage', () => {
    it('should record chunk usage for analytics', async () => {
      mockSupabaseClient.from().upsert.mockResolvedValue({ error: null });

      await service.recordUsage(mockChunkId, 'quiz_generation', 0.85, true);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('chunk_analytics');
      expect(mockSupabaseClient.from().upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          chunk_id: mockChunkId,
          usage_count: 1,
          total_relevance_score: 0.85,
          usage_type: 'quiz_generation',
          success_count: 1
        }),
        expect.any(Object)
      );
    });

    it('should handle analytics disabled', async () => {
      const serviceWithoutAnalytics = new ChunkManagementService({
        enableAnalytics: false
      });

      await serviceWithoutAnalytics.recordUsage(mockChunkId, 'quiz_generation', 0.85);

      expect(mockSupabaseClient.from).not.toHaveBeenCalled();
    });
  });

  describe('calculateQualityMetrics', () => {
    it('should calculate quality metrics for content', async () => {
      const content = 'This is a well-structured paragraph with meaningful content. It contains multiple sentences and demonstrates good readability. The information density is appropriate for educational content.';
      const metadata: ChunkMetadata = {
        documentTitle: 'Test Document',
        extractionMethod: 'syncfusion',
        processingVersion: '1.0',
        contentType: 'paragraph'
      };

      const metrics = await service.calculateQualityMetrics(content, metadata);

      expect(metrics).toHaveProperty('contentLength');
      expect(metrics).toHaveProperty('tokenDensity');
      expect(metrics).toHaveProperty('structuralCoherence');
      expect(metrics).toHaveProperty('semanticCoherence');
      expect(metrics).toHaveProperty('informationDensity');
      expect(metrics).toHaveProperty('readability');
      expect(metrics).toHaveProperty('duplicateScore');
      expect(metrics).toHaveProperty('overallQuality');

      expect(metrics.contentLength).toBe(content.length);
      expect(metrics.overallQuality).toBeGreaterThan(0);
      expect(metrics.overallQuality).toBeLessThanOrEqual(1);
    });

    it('should give higher scores to structured content', async () => {
      const headingContent = 'INTRODUCTION TO MACHINE LEARNING';
      const headingMetadata: ChunkMetadata = {
        documentTitle: 'Test Document',
        extractionMethod: 'syncfusion',
        processingVersion: '1.0',
        contentType: 'heading'
      };

      const paragraphContent = 'This is regular paragraph text without special structure.';
      const paragraphMetadata: ChunkMetadata = {
        documentTitle: 'Test Document',
        extractionMethod: 'syncfusion',
        processingVersion: '1.0',
        contentType: 'paragraph'
      };

      const headingMetrics = await service.calculateQualityMetrics(headingContent, headingMetadata);
      const paragraphMetrics = await service.calculateQualityMetrics(paragraphContent, paragraphMetadata);

      expect(headingMetrics.structuralCoherence).toBeGreaterThan(paragraphMetrics.structuralCoherence);
    });
  });

  describe('deduplicateChunks', () => {
    it('should identify and remove duplicate chunks', async () => {
      const mockChunks = [
        {
          id: 'chunk-1',
          content: 'This is the original content that appears multiple times.',
          document_id: 'doc-1'
        },
        {
          id: 'chunk-2',
          content: 'This is the original content that appears multiple times.',
          document_id: 'doc-2'
        },
        {
          id: 'chunk-3',
          content: 'This is completely different content.',
          document_id: 'doc-1'
        }
      ];

      mockSupabaseClient.from().select().eq.mockResolvedValue({
        data: mockChunks,
        error: null
      });

      mockSupabaseClient.from().delete().in.mockResolvedValue({ error: null });

      const result = await service.deduplicateChunks(mockUserId);

      expect(result.duplicatesFound).toBeGreaterThan(0);
      expect(result.duplicateGroups).toHaveLength(1);
      expect(result.duplicateGroups[0].duplicates).toContain('chunk-2');
    });

    it('should handle deduplication errors', async () => {
      mockSupabaseClient.from().select().eq.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });

      await expect(service.deduplicateChunks(mockUserId))
        .rejects.toThrow('Failed to fetch chunks for deduplication: Database error');
    });
  });

  describe('performCleanup', () => {
    it('should perform comprehensive cleanup operations', async () => {
      // Mock orphaned chunks
      mockSupabaseClient.from().select().eq().not.mockResolvedValue({
        data: [
          { id: 'orphan-1', content: 'Orphaned content 1' },
          { id: 'orphan-2', content: 'Orphaned content 2' }
        ],
        error: null
      });

      // Mock chunks for version cleanup
      mockSupabaseClient.from().select().eq.mockResolvedValue({
        data: [{ id: 'chunk-1' }],
        error: null
      });

      // Mock old versions
      mockSupabaseClient.from().select().eq().order().range.mockResolvedValue({
        data: [{ id: 'old-version-1' }],
        error: null
      });

      // Mock chunks needing quality updates
      mockSupabaseClient.from().select().eq().or.mockResolvedValue({
        data: [
          {
            id: 'chunk-1',
            content: 'Content needing quality update',
            metadata: { contentType: 'paragraph' }
          }
        ],
        error: null
      });

      // Mock unused chunks
      mockSupabaseClient.from().select().eq().lt().filter.mockResolvedValue({
        data: [
          { id: 'unused-1', content: 'Unused content' }
        ],
        error: null
      });

      mockSupabaseClient.from().delete().in.mockResolvedValue({ error: null });
      mockSupabaseClient.from().update().eq.mockResolvedValue({ error: null });
      mockSupabaseClient.from().upsert.mockResolvedValue({ error: null });

      const result = await service.performCleanup(mockUserId, {
        removeOrphanedChunks: true,
        removeOldVersions: true,
        updateQualityScores: true,
        removeUnusedChunks: true,
        maxAge: 30
      });

      expect(result.chunksProcessed).toBeGreaterThan(0);
      expect(result.chunksRemoved).toBeGreaterThan(0);
      expect(result.spaceFreed).toBeGreaterThan(0);
    });
  });

  describe('getPerformanceMetrics', () => {
    it('should calculate comprehensive performance metrics', async () => {
      const mockChunks = [
        {
          id: 'chunk-1',
          quality_score: 0.8,
          chunk_analytics: [{ usage_count: 10, total_relevance_score: 8.5 }]
        },
        {
          id: 'chunk-2',
          quality_score: 0.6,
          chunk_analytics: [{ usage_count: 5, total_relevance_score: 3.0 }]
        },
        {
          id: 'chunk-3',
          quality_score: 0.9,
          chunk_analytics: []
        }
      ];

      mockSupabaseClient.from().select().eq.mockResolvedValue({
        data: mockChunks,
        error: null
      });

      const result = await service.getPerformanceMetrics(mockUserId);

      expect(result.totalChunks).toBe(3);
      expect(result.averageQuality).toBeCloseTo(0.77, 1);
      expect(result.highQualityChunks).toBe(2); // chunks with quality >= 0.8
      expect(result.lowQualityChunks).toBe(0); // chunks with quality < 0.4
      expect(result.mostUsedChunks).toHaveLength(2);
      expect(result.qualityDistribution.excellent).toBe(1); // quality >= 0.9
      expect(result.qualityDistribution.good).toBe(1); // quality >= 0.7 && < 0.9
    });
  });

  describe('filterChunksByQuality', () => {
    it('should filter chunks by minimum quality threshold', async () => {
      const mockHighQualityChunks = [
        {
          id: 'chunk-1',
          quality_score: 0.8,
          content: 'High quality content'
        },
        {
          id: 'chunk-2',
          quality_score: 0.9,
          content: 'Excellent quality content'
        }
      ];

      mockSupabaseClient.from().select().eq().gte().order.mockResolvedValue({
        data: mockHighQualityChunks,
        error: null
      });

      const result = await service.filterChunksByQuality(mockUserId, 0.7);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('chunk-1');
      expect(result[1].id).toBe('chunk-2');
      expect(mockSupabaseClient.from().gte).toHaveBeenCalledWith('quality_score', 0.7);
    });

    it('should handle filtering errors', async () => {
      mockSupabaseClient.from().select().eq().gte().order.mockResolvedValue({
        data: null,
        error: { message: 'Filter error' }
      });

      await expect(service.filterChunksByQuality(mockUserId, 0.7))
        .rejects.toThrow('Failed to filter chunks by quality: Filter error');
    });
  });
});