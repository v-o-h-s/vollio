import { describe, it, expect } from 'vitest';
import { OCRService } from '../ocr-service';

describe('OCRService - Basic Functionality', () => {
  let service: OCRService;
  
  beforeEach(() => {
    service = new OCRService();
  });

  describe('calculateQualityMetrics', () => {
    it('should calculate quality metrics for good text', () => {
      const goodText = 'This is a well-formed sentence with proper capitalization and punctuation.';
      const metrics = (service as any).calculateQualityMetrics(goodText);
      
      expect(metrics.textLength).toBe(goodText.length);
      expect(metrics.wordCount).toBeGreaterThan(0);
      expect(metrics.overallQualityScore).toBeGreaterThan(0.5);
    });

    it('should calculate quality metrics for poor text', () => {
      const poorText = 'abc123!@#$%^&*()_+{}|:"<>?[]\\;\',./ aaaaaaa';
      const metrics = (service as any).calculateQualityMetrics(poorText);
      
      expect(metrics.specialCharacterRatio).toBeGreaterThan(0.1);
      expect(metrics.overallQualityScore).toBeLessThan(0.5);
    });

    it('should return zero metrics for empty text', () => {
      const metrics = (service as any).calculateQualityMetrics('');
      expect(metrics.textLength).toBe(0);
      expect(metrics.wordCount).toBe(0);
      expect(metrics.overallQualityScore).toBe(0);
    });
  });

  describe('document type configurations', () => {
    it('should provide settings for different document types', () => {
      const settings = service.getDocumentTypeSettings('scientific_paper');
      expect(settings).toBeDefined();
      expect(settings.psmMode).toBeDefined();
      expect(settings.dpi).toBeDefined();
    });

    it('should list available document types', () => {
      const types = service.getAvailableDocumentTypes();
      expect(types).toContain('text_document');
      expect(types).toContain('scientific_paper');
      expect(types).toContain('newspaper');
    });

    it('should list available fallback strategies', () => {
      const strategies = service.getAvailableFallbackStrategies();
      expect(strategies).toContain('retry_with_preprocessing');
      expect(strategies).toContain('retry_with_different_psm');
      expect(strategies).toContain('retry_with_different_language');
    });
  });

  describe('options validation', () => {
    it('should validate correct options', () => {
      const validation = service.validateOptions({
        confidenceThreshold: 50,
        dpi: 300,
        psmMode: 6,
        oem: 3
      });
      
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should reject invalid confidence threshold', () => {
      const validation = service.validateOptions({
        confidenceThreshold: 150
      });
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Confidence threshold must be between 0 and 100');
    });

    it('should reject invalid DPI', () => {
      const validation = service.validateOptions({
        dpi: 50
      });
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('DPI must be between 72 and 1200');
    });

    it('should reject invalid PSM mode', () => {
      const validation = service.validateOptions({
        psmMode: 20
      });
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('PSM mode must be between 0 and 13');
    });
  });

  describe('caching functionality', () => {
    it('should provide cache statistics', () => {
      const stats = service.getCacheStats();
      expect(stats.size).toBeDefined();
      expect(stats.maxSize).toBeDefined();
    });

    it('should clear cache', () => {
      service.clearCache();
      const stats = service.getCacheStats();
      expect(stats.size).toBe(0);
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