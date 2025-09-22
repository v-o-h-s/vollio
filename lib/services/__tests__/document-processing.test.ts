import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DocumentProcessingService } from '../document-processing';
import { ocrService } from '../ocr-service';
import { chunkingService } from '../chunking-service';
import { syncfusionTextExtractor } from '../syncfusion-text-extractor';

// Mock dependencies
vi.mock('../ocr-service');
vi.mock('../chunking-service');
vi.mock('../syncfusion-text-extractor');

describe('DocumentProcessingService', () => {
  let service: DocumentProcessingService;
  
  beforeEach(() => {
    service = new DocumentProcessingService();
    vi.clearAllMocks();
  });

  describe('processDocument', () => {
    it('should successfully process a PDF with Syncfusion', async () => {
      // Mock Syncfusion text extractor
      vi.mocked(syncfusionTextExtractor.extractText).mockResolvedValue({
        success: true,
        pageTexts: [
          {
            pageNumber: 1,
            text: 'This is page 1 content from Syncfusion.',
            confidence: 95
          },
          {
            pageNumber: 2,
            text: 'This is page 2 content from Syncfusion.',
            confidence: 95
          }
        ],
        totalPages: 2,
        extractionMethod: 'syncfusion'
      });

      // Mock chunking service
      vi.mocked(chunkingService.createChunks).mockReturnValue({
        chunks: [
          {
            id: 'chunk-1',
            content: 'This is page 1 content from Syncfusion.',
            startIndex: 0,
            endIndex: 39,
            tokenCount: 10,
            metadata: {
              chunkIndex: 0,
              hasOverlap: false,
              contentType: 'paragraph',
              structuralElements: ['paragraph']
            }
          }
        ],
        totalTokens: 10,
        averageChunkSize: 10,
        overlapRatio: 0
      });

      const pdfBuffer = Buffer.from('%PDF-1.4 mock pdf content');
      const result = await service.processDocument(pdfBuffer, 'Test Document');

      expect(result.success).toBe(true);
      expect(result.extractionMethod).toBe('syncfusion');
      expect(result.chunks).toHaveLength(2); // One chunk per page
      expect(result.totalPages).toBe(2);
      expect(result.chunks[0].content).toContain('Syncfusion');
    });

    it('should fallback to OCR when Syncfusion fails', async () => {
      // Mock Syncfusion to fail
      vi.mocked(syncfusionTextExtractor.extractText).mockResolvedValue({
        success: false,
        pageTexts: [],
        totalPages: 0,
        extractionMethod: 'syncfusion',
        error: 'Syncfusion extraction failed'
      });

      // Mock OCR service
      vi.mocked(ocrService.processPDF).mockResolvedValue({
        success: true,
        results: [
          {
            pageNumber: 1,
            text: 'OCR extracted text from page 1',
            confidence: 85,
            processingTime: 1000
          }
        ],
        totalPages: 1,
        averageConfidence: 85
      });

      // Mock chunking service
      vi.mocked(chunkingService.createChunks).mockReturnValue({
        chunks: [
          {
            id: 'chunk-1',
            content: 'OCR extracted text from page 1',
            startIndex: 0,
            endIndex: 31,
            tokenCount: 8,
            metadata: {
              chunkIndex: 0,
              hasOverlap: false,
              contentType: 'paragraph',
              structuralElements: ['paragraph']
            }
          }
        ],
        totalTokens: 8,
        averageChunkSize: 8,
        overlapRatio: 0
      });

      const pdfBuffer = Buffer.from('mock pdf content');
      const pdfBuffer = Buffer.from('%PDF-1.4 mock pdf content');
      const result = await service.processDocument(pdfBuffer, 'Test Document');

      expect(result.success).toBe(true);
      expect(result.extractionMethod).toBe('ocr');
      expect(result.chunks).toHaveLength(1);
      expect(result.chunks[0].content).toBe('OCR extracted text from page 1');
      expect(result.chunks[0].metadata.extractionMethod).toBe('ocr');
    });

    it('should handle OCR failure gracefully', async () => {
      // Mock Syncfusion to fail
      vi.mocked(syncfusionTextExtractor.extractText).mockResolvedValue({
        success: false,
        pageTexts: [],
        totalPages: 0,
        extractionMethod: 'syncfusion',
        error: 'Syncfusion extraction failed'
      });

      // Mock OCR service to fail
      vi.mocked(ocrService.processPDF).mockResolvedValue({
        success: false,
        results: [],
        totalPages: 0,
        averageConfidence: 0,
        error: 'OCR processing failed'
      });

      const pdfBuffer = Buffer.from('%PDF-1.4 mock pdf content');
      const result = await service.processDocument(pdfBuffer, 'Test Document');

      expect(result.success).toBe(false);
      expect(result.error).toContain('OCR processing failed');
      expect(result.chunks).toHaveLength(0);
    });

    it('should use OCR when explicitly requested', async () => {
      // Mock OCR service
      vi.mocked(ocrService.processPDF).mockResolvedValue({
        success: true,
        results: [
          {
            pageNumber: 1,
            text: 'Forced OCR text',
            confidence: 90,
            processingTime: 1500
          }
        ],
        totalPages: 1,
        averageConfidence: 90
      });

      // Mock chunking service
      vi.mocked(chunkingService.createChunks).mockReturnValue({
        chunks: [
          {
            id: 'chunk-1',
            content: 'Forced OCR text',
            startIndex: 0,
            endIndex: 15,
            tokenCount: 4,
            metadata: {
              chunkIndex: 0,
              hasOverlap: false,
              contentType: 'paragraph',
              structuralElements: ['paragraph']
            }
          }
        ],
        totalTokens: 4,
        averageChunkSize: 4,
        overlapRatio: 0
      });

      const pdfBuffer = Buffer.from('%PDF-1.4 mock pdf content');
      const result = await service.processDocument(
        pdfBuffer, 
        'Test Document', 
        { useOCR: true }
      );

      expect(result.success).toBe(true);
      expect(result.extractionMethod).toBe('ocr');
      expect(vi.mocked(ocrService.processPDF)).toHaveBeenCalled();
    });

    it('should pass chunking options correctly', async () => {
      // Mock Syncfusion text extractor
      vi.mocked(syncfusionTextExtractor.extractText).mockResolvedValue({
        success: true,
        pageTexts: [
          {
            pageNumber: 1,
            text: 'Test content',
            confidence: 95
          }
        ],
        totalPages: 1,
        extractionMethod: 'syncfusion'
      });

      // Mock chunking service
      vi.mocked(chunkingService.createChunks).mockReturnValue({
        chunks: [],
        totalTokens: 0,
        averageChunkSize: 0,
        overlapRatio: 0
      });

      const pdfBuffer = Buffer.from('%PDF-1.4 mock pdf content');
      const options = {
        chunkSize: 500,
        chunkOverlap: 75,
        preserveStructure: true,
        respectSentenceBoundaries: false
      };

      await service.processDocument(pdfBuffer, 'Test Document', options);

      expect(vi.mocked(chunkingService.createChunks)).toHaveBeenCalledWith(
        'Test content',
        expect.objectContaining({
          chunkSize: 500,
          chunkOverlap: 75,
          preserveStructure: true,
          respectSentenceBoundaries: false
        })
      );
    });
  });

  describe('text preprocessing', () => {
    it('should preprocess text correctly', async () => {
      // Mock Syncfusion with text that needs preprocessing
      vi.mocked(syncfusionTextExtractor.extractText).mockResolvedValue({
        success: true,
        pageTexts: [
          {
            pageNumber: 1,
            text: 'Page 1    This is content with   extra   spaces   https://example.com should be removed email@example.com should be removed',
            confidence: 95
          }
        ],
        totalPages: 1,
        extractionMethod: 'syncfusion'
      });

      // Capture the text passed to chunking service
      let processedText = '';
      vi.mocked(chunkingService.createChunks).mockImplementation((text) => {
        processedText = text;
        return {
          chunks: [],
          totalTokens: 0,
          averageChunkSize: 0,
          overlapRatio: 0
        };
      });

      const pdfBuffer = Buffer.from('%PDF-1.4 mock pdf content');
      await service.processDocument(pdfBuffer, 'Test Document');

      // Check that text was preprocessed
      expect(processedText).not.toContain('https://example.com');
      expect(processedText).not.toContain('email@example.com');
      expect(processedText).not.toMatch(/\s{2,}/); // No excessive whitespace
    });
  });

  describe('Syncfusion integration', () => {
    it('should pass Syncfusion-specific options correctly', async () => {
      vi.mocked(syncfusionTextExtractor.extractText).mockResolvedValue({
        success: true,
        pageTexts: [
          {
            pageNumber: 1,
            text: 'Syncfusion options test',
            confidence: 95
          }
        ],
        totalPages: 1,
        extractionMethod: 'syncfusion'
      });

      vi.mocked(chunkingService.createChunks).mockReturnValue({
        chunks: [],
        totalTokens: 0,
        averageChunkSize: 0,
        overlapRatio: 0
      });

      const pdfBuffer = Buffer.from('%PDF-1.4 mock pdf content');
      const options = {
        enableTextSelection: true,
        enableTextSearch: false,
        extractImages: true,
        preserveFormatting: false,
        timeout: 15000
      };

      await service.processDocument(pdfBuffer, 'Test Document', options);

      expect(vi.mocked(syncfusionTextExtractor.extractText)).toHaveBeenCalledWith(
        pdfBuffer,
        expect.objectContaining({
          enableTextSelection: true,
          enableTextSearch: false,
          extractImages: true,
          preserveFormatting: false,
          timeout: 15000
        })
      );
    });

    it('should handle Syncfusion extraction errors gracefully', async () => {
      vi.mocked(syncfusionTextExtractor.extractText).mockRejectedValue(
        new Error('Syncfusion component not available')
      );

      // Mock OCR fallback
      vi.mocked(ocrService.processPDF).mockResolvedValue({
        success: true,
        results: [
          {
            pageNumber: 1,
            text: 'OCR fallback text',
            confidence: 80,
            processingTime: 1000
          }
        ],
        totalPages: 1,
        averageConfidence: 80
      });

      vi.mocked(chunkingService.createChunks).mockReturnValue({
        chunks: [
          {
            id: 'chunk-1',
            content: 'OCR fallback text',
            startIndex: 0,
            endIndex: 17,
            tokenCount: 4,
            metadata: {
              chunkIndex: 0,
              hasOverlap: false,
              contentType: 'paragraph',
              structuralElements: ['paragraph']
            }
          }
        ],
        totalTokens: 4,
        averageChunkSize: 4,
        overlapRatio: 0
      });

      const pdfBuffer = Buffer.from('%PDF-1.4 mock pdf content');
      const result = await service.processDocument(pdfBuffer, 'Test Document');

      expect(result.success).toBe(true);
      expect(result.extractionMethod).toBe('ocr');
      expect(result.chunks[0].content).toBe('OCR fallback text');
    });
  });
});