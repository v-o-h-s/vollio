import { describe, it, expect, beforeEach } from 'vitest';
import { ChunkingService } from '../chunking-service';

describe('ChunkingService', () => {
  let service: ChunkingService;
  
  beforeEach(() => {
    service = new ChunkingService();
  });

  describe('createChunks', () => {
    it('should create chunks from simple text', () => {
      const text = 'This is the first sentence. This is the second sentence. This is the third sentence.';
      
      const result = service.createChunks(text, {
        chunkSize: 20,
        chunkOverlap: 5
      });

      expect(result.chunks.length).toBeGreaterThan(0);
      expect(result.totalTokens).toBeGreaterThan(0);
      expect(result.chunks[0].content).toContain('This is the first sentence');
    });

    it('should respect sentence boundaries', () => {
      const text = 'First sentence here. Second sentence here. Third sentence here. Fourth sentence here.';
      
      const result = service.createChunks(text, {
        chunkSize: 15,
        respectSentenceBoundaries: true
      });

      // Each chunk should end with complete sentences
      result.chunks.forEach(chunk => {
        expect(chunk.content.trim()).toMatch(/[.!?]$/);
      });
    });

    it('should preserve paragraph structure', () => {
      const text = `First paragraph with multiple sentences. This is still the first paragraph.

Second paragraph starts here. This is also in the second paragraph.

Third paragraph is here.`;
      
      const result = service.createChunks(text, {
        chunkSize: 50,
        respectParagraphBoundaries: true,
        preserveStructure: true
      });

      expect(result.chunks.length).toBeGreaterThan(1);
      // Should have some structural preservation
      expect(result.chunks.some(chunk => 
        chunk.metadata.structuralElements.includes('paragraph')
      )).toBe(true);
    });

    it('should detect and handle headings', () => {
      const text = `INTRODUCTION

This is the introduction paragraph with detailed content about the topic.

METHODOLOGY

This section describes the methodology used in the research.`;
      
      const result = service.createChunks(text, {
        chunkSize: 30,
        preserveStructure: true
      });

      // Should detect headings
      expect(result.chunks.some(chunk => 
        chunk.metadata.contentType === 'heading'
      )).toBe(true);
    });

    it('should detect and handle lists', () => {
      const text = `Here are the main points:

1. First important point
2. Second important point  
3. Third important point

These points are crucial for understanding.`;
      
      const result = service.createChunks(text, {
        chunkSize: 25,
        preserveStructure: true
      });

      // Should detect list content
      expect(result.chunks.some(chunk => 
        chunk.metadata.contentType === 'list'
      )).toBe(true);
    });

    it('should create overlapping chunks', () => {
      const text = 'Sentence one. Sentence two. Sentence three. Sentence four. Sentence five.';
      
      const result = service.createChunks(text, {
        chunkSize: 15,
        chunkOverlap: 8
      });

      if (result.chunks.length > 1) {
        // Check that there's some overlap between consecutive chunks
        const firstChunkWords = result.chunks[0].content.split(' ');
        const secondChunkWords = result.chunks[1].content.split(' ');
        
        const hasOverlap = firstChunkWords.some(word => 
          secondChunkWords.includes(word)
        );
        
        expect(hasOverlap).toBe(true);
      }
    });

    it('should handle empty or whitespace-only text', () => {
      const result1 = service.createChunks('');
      expect(result1.chunks).toHaveLength(0);
      
      const result2 = service.createChunks('   \n\n   ');
      expect(result2.chunks).toHaveLength(0);
    });

    it('should calculate statistics correctly', () => {
      const text = 'This is a test sentence. This is another test sentence. And one more sentence.';
      
      const result = service.createChunks(text, {
        chunkSize: 20,
        chunkOverlap: 5
      });

      expect(result.totalTokens).toBeGreaterThan(0);
      expect(result.averageChunkSize).toBeGreaterThan(0);
      expect(result.overlapRatio).toBeGreaterThanOrEqual(0);
      
      if (result.chunks.length > 1) {
        expect(result.overlapRatio).toBeGreaterThan(0);
      }
    });

    it('should handle very long sentences', () => {
      const longSentence = 'This is a very long sentence that contains many words and should be handled properly even when it exceeds the normal chunk size limits because the chunking service should be robust enough to handle edge cases like this one.';
      
      const result = service.createChunks(longSentence, {
        chunkSize: 20,
        respectSentenceBoundaries: true
      });

      expect(result.chunks.length).toBeGreaterThan(0);
      expect(result.chunks[0].content).toBe(longSentence);
    });

    it('should detect table content', () => {
      const tableText = `Name    Age    City
John    25     New York
Jane    30     Los Angeles
Bob     35     Chicago`;
      
      const result = service.createChunks(tableText, {
        preserveStructure: true
      });

      expect(result.chunks.some(chunk => 
        chunk.metadata.contentType === 'table'
      )).toBe(true);
    });

    it('should detect captions', () => {
      const captionText = `Figure 1: This shows the relationship between variables.

The graph demonstrates clear correlation.

Table 2: Summary of experimental results.`;
      
      const result = service.createChunks(captionText, {
        preserveStructure: true
      });

      expect(result.chunks.some(chunk => 
        chunk.metadata.contentType === 'caption'
      )).toBe(true);
    });

    it('should use custom chunk size and overlap', () => {
      const text = 'Word '.repeat(100); // 100 words
      
      const result = service.createChunks(text, {
        chunkSize: 50, // 50 tokens
        chunkOverlap: 10 // 10 tokens
      });

      // Should create multiple chunks
      expect(result.chunks.length).toBeGreaterThan(1);
      
      // Each chunk should be roughly within size limits
      result.chunks.forEach(chunk => {
        expect(chunk.tokenCount).toBeLessThanOrEqual(60); // Some tolerance
      });
    });

    it('should assign unique IDs to chunks', () => {
      const text = 'First sentence. Second sentence. Third sentence. Fourth sentence.';
      
      const result = service.createChunks(text, {
        chunkSize: 10
      });

      const ids = result.chunks.map(chunk => chunk.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(ids.length); // All IDs should be unique
    });

    it('should handle mixed content types', () => {
      const mixedText = `CHAPTER 1: INTRODUCTION

This is the introduction paragraph.

Key points:
1. First point
2. Second point

Figure 1: Sample diagram

More paragraph content here.`;
      
      const result = service.createChunks(mixedText, {
        chunkSize: 30,
        preserveStructure: true
      });

      const contentTypes = result.chunks.map(chunk => chunk.metadata.contentType);
      const uniqueTypes = new Set(contentTypes);
      
      expect(uniqueTypes.size).toBeGreaterThan(1); // Should have multiple content types
    });
  });

  describe('token estimation', () => {
    it('should estimate tokens reasonably', () => {
      const text = 'This is a test sentence with exactly ten words here.';
      const service = new ChunkingService();
      
      const tokenCount = (service as any).estimateTokenCount(text);
      
      // Should be roughly 10-15 tokens for 10 words
      expect(tokenCount).toBeGreaterThan(8);
      expect(tokenCount).toBeLessThan(20);
    });

    it('should handle punctuation in token estimation', () => {
      const textWithPunctuation = 'Hello, world! How are you? I am fine.';
      const textWithoutPunctuation = 'Hello world How are you I am fine';
      
      const service = new ChunkingService();
      const tokensWithPunctuation = (service as any).estimateTokenCount(textWithPunctuation);
      const tokensWithoutPunctuation = (service as any).estimateTokenCount(textWithoutPunctuation);
      
      expect(tokensWithPunctuation).toBeGreaterThan(tokensWithoutPunctuation);
    });
  });
});