import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SyncfusionTextExtractor } from '../syncfusion-text-extractor';

// Mock Syncfusion components
const mockPdfViewer = {
  pageCount: 2,
  element: {
    querySelectorAll: vi.fn(),
    querySelector: vi.fn(),
    textContent: 'Mock PDF content',
    innerText: 'Mock PDF content'
  },
  navigation: {
    goToPage: vi.fn()
  },
  load: vi.fn(),
  destroy: vi.fn(),
  appendTo: vi.fn()
};

const mockCreateElement = vi.fn(() => ({
  id: 'test-container',
  style: {},
  parentNode: {
    removeChild: vi.fn()
  }
}));

// Mock DOM
Object.defineProperty(global, 'document', {
  value: {
    body: {
      appendChild: vi.fn(),
      removeChild: vi.fn()
    },
    createElement: mockCreateElement
  },
  writable: true
});

vi.mock('@syncfusion/ej2-pdfviewer', () => ({
  PdfViewer: vi.fn().mockImplementation((config) => {
    // Simulate document load after a short delay
    setTimeout(() => {
      if (config.documentLoad) {
        config.documentLoad({ pageCount: 2 });
      }
    }, 100);
    
    return mockPdfViewer;
  })
}));

vi.mock('@syncfusion/ej2-base', () => ({
  createElement: mockCreateElement
}));

describe('SyncfusionTextExtractor', () => {
  let extractor: SyncfusionTextExtractor;
  let mockPdfBuffer: Buffer;
  
  beforeEach(() => {
    extractor = new SyncfusionTextExtractor();
    mockPdfBuffer = Buffer.from('%PDF-1.4 mock pdf content');
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('extractText', () => {
    it('should successfully extract text from PDF', async () => {
      // Mock successful text extraction
      mockPdfViewer.element.querySelectorAll.mockReturnValue([
        { textContent: 'Page 1 content' },
        { textContent: 'More page 1 content' }
      ]);

      const result = await extractor.extractText(mockPdfBuffer);

      expect(result.success).toBe(true);
      expect(result.extractionMethod).toBe('syncfusion');
      expect(result.totalPages).toBe(2);
      expect(result.pageTexts.length).toBeGreaterThan(0);
    });

    it('should handle document load failure', async () => {
      // Mock the PdfViewer to trigger documentLoadFailed
      const { PdfViewer } = await import('@syncfusion/ej2-pdfviewer');
      vi.mocked(PdfViewer).mockImplementation((config: any) => {
        setTimeout(() => {
          if (config.documentLoadFailed) {
            config.documentLoadFailed({ errorDetails: 'Mock load error' });
          }
        }, 100);
        return mockPdfViewer;
      });

      const result = await extractor.extractText(mockPdfBuffer);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Document load failed');
    });

    it('should handle extraction timeout', async () => {
      const result = await extractor.extractText(mockPdfBuffer, { timeout: 50 });

      expect(result.success).toBe(false);
      expect(result.error).toContain('timeout');
    });

    it('should use custom options', async () => {
      const options = {
        enableTextSelection: false,
        enableTextSearch: false,
        timeout: 10000
      };

      mockPdfViewer.element.querySelectorAll.mockReturnValue([
        { textContent: 'Custom options test' }
      ]);

      const result = await extractor.extractText(mockPdfBuffer, options);

      expect(result.success).toBe(true);
      // Verify that PdfViewer was initialized with custom options
      expect(vi.mocked(mockPdfViewer.appendTo)).toHaveBeenCalled();
    });

    it('should clean up resources on completion', async () => {
      mockPdfViewer.element.querySelectorAll.mockReturnValue([
        { textContent: 'Cleanup test' }
      ]);

      await extractor.extractText(mockPdfBuffer);

      expect(mockPdfViewer.destroy).toHaveBeenCalled();
    });

    it('should handle empty text extraction', async () => {
      // Mock empty text extraction
      mockPdfViewer.element.querySelectorAll.mockReturnValue([]);
      mockPdfViewer.element.querySelector.mockReturnValue(null);
      mockPdfViewer.element.textContent = '';

      const result = await extractor.extractText(mockPdfBuffer);

      expect(result.success).toBe(true);
      expect(result.pageTexts.length).toBe(0); // No pages with text
    });
  });

  describe('extractTextWithBounds', () => {
    it('should extract text with bounds information', async () => {
      mockPdfViewer.element.querySelectorAll.mockReturnValue([
        { textContent: 'Bounds test content' }
      ]);

      const result = await extractor.extractTextWithBounds(mockPdfBuffer);

      expect(result.success).toBe(true);
      expect(result.extractionMethod).toBe('syncfusion');
    });
  });

  describe('static methods', () => {
    it('should check if Syncfusion is available', () => {
      const isAvailable = SyncfusionTextExtractor.isAvailable();
      expect(typeof isAvailable).toBe('boolean');
    });

    it('should return supported file types', () => {
      const types = SyncfusionTextExtractor.getSupportedTypes();
      expect(types).toContain('application/pdf');
      expect(types).toContain('.pdf');
    });

    it('should validate PDF buffer correctly', () => {
      const validBuffer = Buffer.from('%PDF-1.4 content');
      const invalidBuffer = Buffer.from('not a pdf');
      const emptyBuffer = Buffer.alloc(0);

      expect(SyncfusionTextExtractor.validatePdfBuffer(validBuffer)).toBe(true);
      expect(SyncfusionTextExtractor.validatePdfBuffer(invalidBuffer)).toBe(false);
      expect(SyncfusionTextExtractor.validatePdfBuffer(emptyBuffer)).toBe(false);
    });

    it('should estimate extraction time based on file size', () => {
      const smallFile = 1024; // 1KB
      const largeFile = 10 * 1024 * 1024; // 10MB

      const smallTime = SyncfusionTextExtractor.estimateExtractionTime(smallFile);
      const largeTime = SyncfusionTextExtractor.estimateExtractionTime(largeFile);

      expect(smallTime).toBeGreaterThan(0);
      expect(largeTime).toBeGreaterThan(smallTime);
      expect(largeTime).toBeLessThanOrEqual(60000); // Max 60 seconds
    });
  });

  describe('error handling', () => {
    it('should handle Syncfusion initialization errors', async () => {
      // Mock createElement to throw an error
      vi.mocked(mockCreateElement).mockImplementation(() => {
        throw new Error('DOM error');
      });

      const result = await extractor.extractText(mockPdfBuffer);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Syncfusion initialization failed');
    });

    it('should handle page extraction errors gracefully', async () => {
      // Mock page extraction to fail for some pages
      mockPdfViewer.navigation.goToPage.mockImplementation((pageNum: number) => {
        if (pageNum === 2) {
          throw new Error('Page navigation failed');
        }
      });

      mockPdfViewer.element.querySelectorAll.mockReturnValue([
        { textContent: 'Page 1 content' }
      ]);

      const result = await extractor.extractText(mockPdfBuffer);

      // Should still succeed with partial extraction
      expect(result.success).toBe(true);
      expect(result.pageTexts.length).toBeGreaterThan(0);
    });
  });

  describe('text extraction methods', () => {
    it('should try multiple extraction methods', async () => {
      // Mock different extraction scenarios
      const mockElement = {
        textContent: 'Method 1 content',
        innerText: 'Method 2 content'
      };

      mockPdfViewer.element.querySelectorAll
        .mockReturnValueOnce([]) // First method fails
        .mockReturnValueOnce([mockElement]); // Second method succeeds

      mockPdfViewer.element.querySelector.mockReturnValue(mockElement);

      const result = await extractor.extractText(mockPdfBuffer);

      expect(result.success).toBe(true);
      expect(mockPdfViewer.element.querySelectorAll).toHaveBeenCalled();
    });

    it('should handle mixed content extraction', async () => {
      // Mock extraction with mixed content types
      mockPdfViewer.element.querySelectorAll.mockReturnValue([
        { textContent: 'Heading content' },
        { textContent: 'Paragraph content with more text' },
        { textContent: '1. List item' },
        { textContent: 'Table data' }
      ]);

      const result = await extractor.extractText(mockPdfBuffer);

      expect(result.success).toBe(true);
      expect(result.pageTexts.some(page => page.text.includes('Heading'))).toBe(true);
      expect(result.pageTexts.some(page => page.text.includes('Paragraph'))).toBe(true);
    });
  });
});