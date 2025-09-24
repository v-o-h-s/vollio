import { describe, it, expect } from 'vitest';
import { ChunkManagementService } from '../chunk-management-service';
import type { DocumentChunk, ChunkMetadata } from '@/lib/types';

describe('ChunkManagementService Integration', () => {
  const service = new ChunkManagementService();

  const mockChunk: DocumentChunk = {
    id: 'chunk-1',
    userId: 'user-1',
    documentId: 'doc-1',
    chunkIndex: 0,
    content: 'This is a well-structured paragraph with multiple sentences. It contains meaningful information about the topic and demonstrates good readability.',
    embedding: [0.1, 0.2, 0.3],
    tokenCount: 25,
    pageNumber: 1,
    sectionTitle: 'Introduction',
    metadata: {
      documentTitle: 'Test Document',
      extractionMethod: 'syncfusion',
      processingVersion: '1.0',
      contentType: 'paragraph',
      confidence: 0.95,
    } as ChunkMetadata,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  it('should calculate quality metrics correctly', async () => {
    const metrics = await service.calculateQualityMetrics(mockChunk);

    expect(metrics).toHaveProperty('contentLength');
    expect(metrics).toHaveProperty('tokenDensity');
    expect(metrics).toHaveProperty('structuralCoherence');
    expect(metrics).toHaveProperty('semanticCoherence');
    expect(metrics).toHaveProperty('informationDensity');
    expect(metrics).toHaveProperty('readability');
    expect(metrics).toHaveProperty('duplicateScore');
    expect(metrics).toHaveProperty('overallQuality');

    // Verify metrics are within expected ranges
    expect(metrics.contentLength).toBe(mockChunk.content.length);
    expect(metrics.tokenDensity).toBeGreaterThan(0);
    expect(metrics.structuralCoherence).toBeGreaterThanOrEqual(0);
    expect(metrics.structuralCoherence).toBeLessThanOrEqual(1);
    expect(metrics.semanticCoherence).toBeGreaterThanOrEqual(0);
    expect(metrics.semanticCoherence).toBeLessThanOrEqual(1);
    expect(metrics.informationDensity).toBeGreaterThanOrEqual(0);
    expect(metrics.informationDensity).toBeLessThanOrEqual(1);
    expect(metrics.readability).toBeGreaterThanOrEqual(0);
    expect(metrics.readability).toBeLessThanOrEqual(1);
    expect(metrics.duplicateScore).toBeGreaterThanOrEqual(0);
    expect(metrics.duplicateScore).toBeLessThanOrEqual(1);
    expect(metrics.overallQuality).toBeGreaterThanOrEqual(0);
    expect(metrics.overallQuality).toBeLessThanOrEqual(1);
  });

  it('should handle different content types correctly', async () => {
    const headingChunk: DocumentChunk = {
      ...mockChunk,
      content: 'Chapter 1: Introduction',
      metadata: { ...mockChunk.metadata, contentType: 'heading' },
    };

    const listChunk: DocumentChunk = {
      ...mockChunk,
      content: '1. First item\n2. Second item\n3. Third item',
      metadata: { ...mockChunk.metadata, contentType: 'list' },
    };

    const headingMetrics = await service.calculateQualityMetrics(headingChunk);
    const listMetrics = await service.calculateQualityMetrics(listChunk);

    // Heading should have high structural coherence
    expect(headingMetrics.structuralCoherence).toBeGreaterThan(0.8);
    
    // List should have good structural coherence
    expect(listMetrics.structuralCoherence).toBeGreaterThan(0.7);
  });

  it('should calculate text similarity correctly', async () => {
    // Test the private method through the deduplication functionality
    const service = new ChunkManagementService();
    
    // Access private method for testing (TypeScript will complain but it works at runtime)
    const calculateTextSimilarity = (service as any).calculateTextSimilarity;
    
    const text1 = 'This is a sample text for testing similarity.';
    const text2 = 'This is a sample text for testing similarity.'; // Identical
    const text3 = 'This is completely different content altogether.';
    
    const similarity1 = calculateTextSimilarity(text1, text2);
    const similarity2 = calculateTextSimilarity(text1, text3);
    
    expect(similarity1).toBe(1); // Identical texts
    expect(similarity2).toBeLessThan(0.5); // Different texts
  });

  it('should estimate token count reasonably', async () => {
    const service = new ChunkManagementService();
    
    // Access private method for testing
    const estimateTokenCount = (service as any).estimateTokenCount;
    
    const shortText = 'Hello world';
    const longText = 'This is a much longer text with multiple sentences. It contains various punctuation marks, numbers like 123, and should result in a higher token count.';
    
    const shortTokens = estimateTokenCount(shortText);
    const longTokens = estimateTokenCount(longText);
    
    expect(shortTokens).toBeGreaterThan(0);
    expect(longTokens).toBeGreaterThan(shortTokens);
    expect(shortTokens).toBeLessThan(10);
    expect(longTokens).toBeGreaterThan(20);
  });

  it('should create service with custom configuration', () => {
    const customService = new ChunkManagementService({
      qualityThreshold: 0.8,
      duplicateThreshold: 0.9,
      enableAnalytics: false,
    });

    expect(customService).toBeInstanceOf(ChunkManagementService);
    
    // Verify configuration is applied (accessing private property)
    const config = (customService as any).config;
    expect(config.qualityThreshold).toBe(0.8);
    expect(config.duplicateThreshold).toBe(0.9);
    expect(config.enableAnalytics).toBe(false);
  });

  it('should handle empty or invalid content gracefully', async () => {
    const emptyChunk: DocumentChunk = {
      ...mockChunk,
      content: '',
      tokenCount: 0,
    };

    const metrics = await service.calculateQualityMetrics(emptyChunk);
    
    expect(metrics.contentLength).toBe(0);
    expect(metrics.tokenDensity).toBe(0);
    expect(metrics.overallQuality).toBeGreaterThanOrEqual(0);
    expect(metrics.overallQuality).toBeLessThanOrEqual(1);
  });
});