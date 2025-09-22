import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OCRService } from '../ocr-service';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import tesseract from 'node-tesseract-ocr';

// Mock dependencies
vi.mock('child_process');
vi.mock('fs', () => ({
  promises: {
    mkdir: vi.fn(),
    readdir: vi.fn(),
    unlink: vi.fn(),
    rmdir: vi.fn()
  }
}));
vi.mock('node-tesseract-ocr');

describe('OCRService', () => {
  let service: OCRService;
  
  beforeEach(() => {
    service = new OCRService();
    vi.clearAllMocks();
  });

  describe('processPDF', () => {
    it('should successfully process PDF with OCR', async () => {
      // Mock file system operations
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.readdir).mockResolvedValue(['page-001.png', 'page-002.png'] as any);
      vi.mocked(fs.unlink).mockResolvedValue(undefined);
      vi.mocked(fs.rmdir).mockResolvedValue(undefined);

      // Mock ImageMagick convert process for PDF to images
      const mockConvertProcess = {
        stderr: { on: vi.fn() },
        on: vi.fn((event, callback) => {
          if (event === 'close') {
            callback(0); // Success
          }
        })
      };
      vi.mocked(spawn).mockReturnValue(mockConvertProcess as any);

      // Mock Tesseract OCR
      vi.mocked(tesseract.recognize)
        .mockResolvedValueOnce('This is text from page 1')
        .mockResolvedValueOnce('This is text from page 2');

      const result = await service.processPDF('/path/to/test.pdf');

      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(2);
      expect(result.results[0].pageNumber).toBe(1);
      expect(result.results[0].text).toBe('This is text from page 1');
      expect(result.results[1].pageNumber).toBe(2);
      expect(result.results[1].text).toBe('This is text from page 2');
      expect(result.totalPages).toBe(2);
    });

    it('should handle ImageMagick conversion failure', async () => {
      // Mock file system operations
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);

      // Mock ImageMagick convert process failure
      const mockConvertProcess = {
        stderr: { 
          on: vi.fn((event, callback) => {
            if (event === 'data') {
              callback(Buffer.from('ImageMagick error'));
            }
          })
        },
        on: vi.fn((event, callback) => {
          if (event === 'close') {
            callback(1); // Failure
          }
        })
      };
      vi.mocked(spawn).mockReturnValue(mockConvertProcess as any);

      const result = await service.processPDF('/path/to/test.pdf');

      expect(result.success).toBe(false);
      expect(result.error).toContain('ImageMagick convert failed');
      expect(result.results).toHaveLength(0);
    });

    it('should handle Tesseract OCR failure gracefully', async () => {
      // Mock file system operations
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.readdir).mockResolvedValue(['page-001.png'] as any);
      vi.mocked(fs.unlink).mockResolvedValue(undefined);
      vi.mocked(fs.rmdir).mockResolvedValue(undefined);

      // Mock ImageMagick convert process
      const mockConvertProcess = {
        stderr: { on: vi.fn() },
        on: vi.fn((event, callback) => {
          if (event === 'close') {
            callback(0); // Success
          }
        })
      };
      vi.mocked(spawn).mockReturnValue(mockConvertProcess as any);

      // Mock Tesseract OCR failure
      vi.mocked(tesseract.recognize).mockRejectedValue(new Error('Tesseract failed'));

      const result = await service.processPDF('/path/to/test.pdf');

      expect(result.success).toBe(true); // Should still succeed with 0 results
      expect(result.results).toHaveLength(0);
      expect(result.totalPages).toBe(1);
    });

    it('should apply confidence threshold correctly', async () => {
      // Mock file system operations
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.readdir).mockResolvedValue(['page-001.png', 'page-002.png'] as any);
      vi.mocked(fs.unlink).mockResolvedValue(undefined);
      vi.mocked(fs.rmdir).mockResolvedValue(undefined);

      // Mock ImageMagick convert process
      const mockConvertProcess = {
        stderr: { on: vi.fn() },
        on: vi.fn((event, callback) => {
          if (event === 'close') {
            callback(0);
          }
        })
      };
      vi.mocked(spawn).mockReturnValue(mockConvertProcess as any);

      // Mock Tesseract OCR - one good result, one poor result
      vi.mocked(tesseract.recognize)
        .mockResolvedValueOnce('This is clear text with proper sentences.')
        .mockResolvedValueOnce('abc123!@#$%^&*()'); // Low quality text

      const result = await service.processPDF('/path/to/test.pdf', {
        confidenceThreshold: 60
      });

      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(1); // Only high-confidence result
      expect(result.results[0].text).toBe('This is clear text with proper sentences.');
    });

    it('should use custom OCR options', async () => {
      // Mock file system operations
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.readdir).mockResolvedValue(['page-001.png'] as any);
      vi.mocked(fs.unlink).mockResolvedValue(undefined);
      vi.mocked(fs.rmdir).mockResolvedValue(undefined);

      // Mock ImageMagick convert process
      const mockConvertProcess = {
        stderr: { on: vi.fn() },
        on: vi.fn((event, callback) => {
          if (event === 'close') {
            callback(0);
          }
        })
      };
      vi.mocked(spawn).mockReturnValue(mockConvertProcess as any);

      // Mock Tesseract OCR
      vi.mocked(tesseract.recognize).mockResolvedValue('French text');

      const options = {
        language: 'fra',
        psmMode: 6,
        oem: 1,
        dpi: 600
      };

      await service.processPDF('/path/to/test.pdf', options);

      expect(vi.mocked(tesseract.recognize)).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          lang: 'fra',
          oem: 1,
          psm: 6
        })
      );
    });
  });

  describe('estimateConfidence', () => {
    it('should estimate confidence correctly for good text', () => {
      const goodText = 'This is a well-formed sentence with proper capitalization and punctuation.';
      const confidence = (service as any).estimateConfidence(goodText);
      
      expect(confidence).toBeGreaterThan(70);
    });

    it('should estimate low confidence for poor text', () => {
      const poorText = 'abc123!@#$%^&*()_+{}|:"<>?[]\\;\',./ aaaaaaa';
      const confidence = (service as any).estimateConfidence(poorText);
      
      expect(confidence).toBeLessThan(50);
    });

    it('should return 0 confidence for empty text', () => {
      const confidence = (service as any).estimateConfidence('');
      expect(confidence).toBe(0);
    });
  });

  describe('detectLanguage', () => {
    it('should detect French text', () => {
      const frenchText = 'Bonjour, comment allez-vous? Très bien, merci.';
      const language = service.detectLanguage(frenchText);
      expect(language).toBe('fra');
    });

    it('should detect German text', () => {
      const germanText = 'Guten Tag, wie geht es Ihnen? Sehr gut, danke schön.';
      const language = service.detectLanguage(germanText);
      expect(language).toBe('deu');
    });

    it('should detect Spanish text', () => {
      const spanishText = '¡Hola! ¿Cómo está usted? Muy bien, gracias.';
      const language = service.detectLanguage(spanishText);
      expect(language).toBe('spa');
    });

    it('should default to English for unknown text', () => {
      const englishText = 'Hello, how are you? Very well, thank you.';
      const language = service.detectLanguage(englishText);
      expect(language).toBe('eng');
    });
  });

  describe('getOptimalPSM', () => {
    it('should return PSM 13 for very wide images', () => {
      const psm = service.getOptimalPSM(1200, 300, false);
      expect(psm).toBe(13); // Single line
    });

    it('should return PSM 4 for tall narrow images', () => {
      const psm = service.getOptimalPSM(400, 1200, false);
      expect(psm).toBe(4); // Single column
    });

    it('should return PSM 3 for multi-column layouts', () => {
      const psm = service.getOptimalPSM(800, 600, true);
      expect(psm).toBe(3); // Fully automatic
    });

    it('should return PSM 6 for normal documents', () => {
      const psm = service.getOptimalPSM(800, 600, false);
      expect(psm).toBe(6); // Single block
    });
  });
});