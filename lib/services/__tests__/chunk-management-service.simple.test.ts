import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ChunkManagementService } from '../chunk-management-service';
import { ChunkMetadata } from '@/lib/types';

// Mock the supabase helpers
vi.mock('@/lib/utils/supabase-helpers', () => ({
  getAuthenticatedSupabaseClient: vi.fn(() => Promise.resolve({
    client: {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: null }))
          }))
        })),
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: { id: 'test-id' }, error: null }))
          }))
        })),
        upsert: vi.fn(() => Promise.resolve({ error: null }))
      }))
    },
    userId: 'test-user-id'
  }))
}));

describe('ChunkManagementService - Core Functionality', () => {
  let service: ChunkManagementService;

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
      expect(metrics.tokenDensity).toBeGreaterThan(0);
      expect(metrics.structuralCoherence).toBeGreaterThanOrEqual(0);
      expect(metrics.structuralCoherence).toBeLessThanOrEqual(1);
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

    it('should handle empty content gracefully', async () => {
      const content = '';
      const metadata: ChunkMetadata = {
        documentTitle: 'Test Document',
        extractionMethod: 'syncfusion',
        processingVersion: '1.0',
        contentType: 'paragraph'
      };

      const metrics = await service.calculateQualityMetrics(content, metadata);

      expect(metrics.contentLength).toBe(0);
      expect(metrics.overallQuality).toBeGreaterThanOrEqual(0);
      expect(metrics.overallQuality).toBeLessThanOrEqual(1);
    });

    it('should calculate different scores for different content types', async () => {
      const testCases = [
        { contentType: 'heading' as const, content: 'CHAPTER 1: INTRODUCTION' },
        { contentType: 'table' as const, content: 'Name\tAge\tCity\nJohn\t25\tNew York\nJane\t30\tLos Angeles' },
        { contentType: 'list' as const, content: '• First item\n• Second item\n• Third item' },
        { contentType: 'paragraph' as const, content: 'This is a regular paragraph with normal text content.' }
      ];

      const results = [];
      for (const testCase of testCases) {
        const metadata: ChunkMetadata = {
          documentTitle: 'Test Document',
          extractionMethod: 'syncfusion',
          processingVersion: '1.0',
          contentType: testCase.contentType
        };

        const metrics = await service.calculateQualityMetrics(testCase.content, metadata);
        results.push({ type: testCase.contentType, quality: metrics.overallQuality });
      }

      // Verify that different content types produce different quality scores
      const uniqueScores = new Set(results.map(r => r.quality));
      expect(uniqueScores.size).toBeGreaterThan(1);
    });
  });

  describe('content similarity calculation', () => {
    it('should calculate high similarity for identical content', () => {
      const content1 = 'This is identical content for testing similarity calculation.';
      const content2 = 'This is identical content for testing similarity calculation.';
      
      // Access private method through service instance
      const similarity = (service as any).calculateContentSimilarity(content1, content2);
      
      expect(similarity).toBe(1.0);
    });

    it('should calculate low similarity for different content', () => {
      const content1 = 'This is completely different content about machine learning algorithms.';
      const content2 = 'The weather today is sunny with a chance of rain in the afternoon.';
      
      const similarity = (service as any).calculateContentSimilarity(content1, content2);
      
      expect(similarity).toBeLessThan(0.5);
    });

    it('should calculate moderate similarity for related content', () => {
      const content1 = 'Machine learning algorithms are used for data analysis and prediction.';
      const content2 = 'Data analysis and prediction can be performed using machine learning techniques.';
      
      const similarity = (service as any).calculateContentSimilarity(content1, content2);
      
      expect(similarity).toBeGreaterThan(0.3);
      expect(similarity).toBeLessThan(1.0);
    });
  });

  describe('token estimation', () => {
    it('should estimate tokens correctly for simple text', () => {
      const text = 'This is a simple sentence with five words.';
      const tokenCount = (service as any).estimateTokenCount(text);
      
      expect(tokenCount).toBeGreaterThan(0);
      expect(tokenCount).toBeLessThan(20); // Should be reasonable for this text
    });

    it('should handle empty text', () => {
      const text = '';
      const tokenCount = (service as any).estimateTokenCount(text);
      
      expect(tokenCount).toBe(0);
    });

    it('should account for punctuation and numbers', () => {
      const textWithPunctuation = 'Hello, world! This has 123 numbers and punctuation.';
      const simpleText = 'Hello world This has numbers and punctuation';
      
      const tokensWithPunctuation = (service as any).estimateTokenCount(textWithPunctuation);
      const tokensSimple = (service as any).estimateTokenCount(simpleText);
      
      expect(tokensWithPunctuation).toBeGreaterThan(tokensSimple);
    });
  });

  describe('quality scoring components', () => {
    it('should calculate structural coherence based on content type', () => {
      const headingMetadata: ChunkMetadata = {
        documentTitle: 'Test',
        extractionMethod: 'syncfusion',
        processingVersion: '1.0',
        contentType: 'heading'
      };

      const paragraphMetadata: ChunkMetadata = {
        documentTitle: 'Test',
        extractionMethod: 'syncfusion',
        processingVersion: '1.0',
        contentType: 'paragraph'
      };

      const headingScore = (service as any).calculateStructuralCoherence('TEST HEADING', headingMetadata);
      const paragraphScore = (service as any).calculateStructuralCoherence('Regular paragraph text', paragraphMetadata);

      expect(headingScore).toBeGreaterThan(paragraphScore);
      expect(headingScore).toBeLessThanOrEqual(1);
      expect(paragraphScore).toBeGreaterThanOrEqual(0);
    });

    it('should calculate semantic coherence based on sentence structure', () => {
      const wellStructuredText = 'This is a well-structured paragraph. However, it contains multiple sentences. Furthermore, it demonstrates good coherence with transition words. Therefore, the overall quality should be higher.';
      const poorlyStructuredText = 'Text bad structure no punctuation very long sentence without proper formatting or transitions and no coherent flow';

      const goodScore = (service as any).calculateSemanticCoherence(wellStructuredText);
      const poorScore = (service as any).calculateSemanticCoherence(poorlyStructuredText);

      // Both scores should be valid ranges
      expect(goodScore).toBeLessThanOrEqual(1);
      expect(poorScore).toBeGreaterThanOrEqual(0);
      expect(goodScore).toBeGreaterThanOrEqual(0);
      expect(poorScore).toBeLessThanOrEqual(1);
    });

    it('should calculate information density based on unique concepts', () => {
      const denseText = 'Machine learning algorithms utilize neural networks, decision trees, and support vector machines for classification tasks.';
      const sparseText = 'The the the same word repeated many times the same word the same word.';

      const denseScore = (service as any).calculateInformationDensity(denseText);
      const sparseScore = (service as any).calculateInformationDensity(sparseText);

      expect(denseScore).toBeGreaterThan(sparseScore);
      expect(denseScore).toBeLessThanOrEqual(1);
      expect(sparseScore).toBeGreaterThanOrEqual(0);
    });

    it('should calculate readability based on sentence and word complexity', () => {
      const readableText = 'This text is easy to read. It has short sentences. The words are simple and clear.';
      const complexText = 'This extraordinarily convoluted and unnecessarily complicated textual composition demonstrates significantly challenging comprehension characteristics through utilization of excessively verbose terminology and extremely lengthy sentence constructions that substantially impede readability.';

      const readableScore = (service as any).calculateReadability(readableText);
      const complexScore = (service as any).calculateReadability(complexText);

      expect(readableScore).toBeGreaterThan(complexScore);
      expect(readableScore).toBeLessThanOrEqual(1);
      expect(complexScore).toBeGreaterThanOrEqual(0);
    });
  });

  describe('service configuration', () => {
    it('should use default options when none provided', () => {
      const defaultService = new ChunkManagementService();
      expect(defaultService).toBeDefined();
    });

    it('should merge custom options with defaults', () => {
      const customService = new ChunkManagementService({
        qualityThreshold: 0.8,
        enableVersioning: false
      });
      expect(customService).toBeDefined();
    });
  });
});