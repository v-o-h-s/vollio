import tesseract from 'node-tesseract-ocr';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export interface OCROptions {
  language?: string;
  psmMode?: number;
  oem?: number;
  confidenceThreshold?: number;
  dpi?: number;
  preprocessImage?: boolean;
  documentType?: DocumentType;
  enableCaching?: boolean;
  fallbackStrategies?: FallbackStrategy[];
  autoDetectLanguage?: boolean;
  multiLanguageSupport?: string[];
}

export type DocumentType = 
  | 'text_document'     // Regular text documents
  | 'scientific_paper'  // Academic papers with formulas
  | 'newspaper'         // Multi-column newspaper layout
  | 'magazine'          // Magazine with mixed layouts
  | 'invoice'           // Structured business documents
  | 'handwritten'       // Handwritten documents
  | 'mixed_content'     // Documents with text and images
  | 'table_heavy'       // Documents with many tables
  | 'single_column'     // Simple single-column layout
  | 'presentation'      // Slide presentations
  | 'form'              // Forms with fields
  | 'receipt'           // Receipts and small documents
  | 'book'              // Book pages
  | 'technical_manual'; // Technical documentation

export type FallbackStrategy = 
  | 'retry_with_preprocessing'
  | 'retry_with_different_psm'
  | 'retry_with_different_language'
  | 'retry_with_higher_dpi'
  | 'segment_and_process'
  | 'manual_review_required';

export interface LanguageDetectionResult {
  detectedLanguage: string;
  confidence: number;
  alternativeLanguages: Array<{ language: string; confidence: number }>;
}

export interface OCRResult {
  pageNumber: number;
  text: string;
  confidence: number;
  processingTime: number;
  extractionMethod: 'primary' | 'fallback';
  languageUsed: string;
  psmUsed: number;
  preprocessingApplied: string[];
  qualityMetrics: QualityMetrics;
}

export interface QualityMetrics {
  textLength: number;
  wordCount: number;
  averageWordLength: number;
  specialCharacterRatio: number;
  capitalizationScore: number;
  sentenceStructureScore: number;
  overallQualityScore: number;
}

export interface OCRPageResult {
  success: boolean;
  results: OCRResult[];
  totalPages: number;
  averageConfidence: number;
  cacheHitRate: number;
  languageDetection?: LanguageDetectionResult;
  processingStrategy: string;
  fallbacksUsed: FallbackStrategy[];
  error?: string;
}

export interface OCRCacheEntry {
  hash: string;
  result: OCRResult;
  timestamp: number;
  options: OCROptions;
}

export class OCRService {
  private static readonly DEFAULT_OPTIONS: Required<Omit<OCROptions, 'documentType' | 'fallbackStrategies' | 'multiLanguageSupport'>> = {
    language: 'eng',
    psmMode: 3, // Fully automatic page segmentation
    oem: 3, // Use LSTM OCR Engine Mode
    confidenceThreshold: 30,
    dpi: 300,
    preprocessImage: true,
    enableCaching: true,
    autoDetectLanguage: false
  };

  private static readonly DOCUMENT_TYPE_CONFIGS: Record<DocumentType, Partial<OCROptions>> = {
    text_document: { psmMode: 6, dpi: 300, preprocessImage: true },
    scientific_paper: { psmMode: 3, dpi: 400, preprocessImage: true, oem: 1 },
    newspaper: { psmMode: 3, dpi: 300, preprocessImage: true },
    magazine: { psmMode: 3, dpi: 350, preprocessImage: true },
    invoice: { psmMode: 6, dpi: 300, preprocessImage: true },
    handwritten: { psmMode: 8, dpi: 400, preprocessImage: true, oem: 2 },
    mixed_content: { psmMode: 3, dpi: 350, preprocessImage: true },
    table_heavy: { psmMode: 6, dpi: 400, preprocessImage: true },
    single_column: { psmMode: 4, dpi: 300, preprocessImage: true },
    presentation: { psmMode: 6, dpi: 300, preprocessImage: true },
    form: { psmMode: 6, dpi: 350, preprocessImage: true },
    receipt: { psmMode: 8, dpi: 400, preprocessImage: true },
    book: { psmMode: 4, dpi: 300, preprocessImage: true },
    technical_manual: { psmMode: 3, dpi: 400, preprocessImage: true }
  };

  private static readonly LANGUAGE_PATTERNS: Record<string, { pattern: RegExp; weight: number }> = {
    deu: { pattern: /[äöüß]/i, weight: 3 }, // German-specific characters get higher weight
    fra: { pattern: /[àâæçèéêëîïôùûüÿ]/i, weight: 2 }, // French-specific characters
    spa: { pattern: /[áéíóúüñ¿¡]/i, weight: 2 }, // Spanish-specific characters
    ita: { pattern: /[àèéìíîòóùú]/i, weight: 2 }, // Italian-specific characters
    por: { pattern: /[àáâãçéêíóôõú]/i, weight: 2 }, // Portuguese-specific characters
    rus: { pattern: /[абвгдеёжзийклмнопрстуфхцчшщъыьэюя]/i, weight: 3 },
    chi_sim: { pattern: /[\u4e00-\u9fff]/, weight: 4 },
    jpn: { pattern: /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff]/, weight: 4 },
    kor: { pattern: /[\uac00-\ud7af]/, weight: 4 },
    ara: { pattern: /[\u0600-\u06ff]/, weight: 4 },
    hin: { pattern: /[\u0900-\u097f]/, weight: 4 }
  };

  private cache = new Map<string, OCRCacheEntry>();
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
  private readonly MAX_CACHE_SIZE = 1000;

  /**
   * Process PDF with OCR, converting to images first for better page-by-page processing
   */
  async processPDF(pdfPath: string, options: OCROptions = {}): Promise<OCRPageResult> {
    const config = this.mergeOptionsWithDocumentType(options);
    const tempDir = join(tmpdir(), `ocr-${uuidv4()}`);
    let cacheHits = 0;
    let totalProcessed = 0;
    const fallbacksUsed: FallbackStrategy[] = [];
    
    try {
      // Create temporary directory
      await fs.mkdir(tempDir, { recursive: true });
      
      // Convert PDF to images
      const imageFiles = await this.convertPDFToImages(pdfPath, tempDir, config.dpi);
      
      // Detect language if auto-detection is enabled
      let languageDetection: LanguageDetectionResult | undefined;
      if (config.autoDetectLanguage) {
        languageDetection = await this.detectLanguageFromImages(imageFiles.slice(0, 3), config);
        if (languageDetection.confidence > 0.7) {
          config.language = languageDetection.detectedLanguage;
        }
      }
      
      // Process each image with OCR
      const results: OCRResult[] = [];
      
      for (let i = 0; i < imageFiles.length; i++) {
        totalProcessed++;
        const imagePath = imageFiles[i];
        
        // Check cache first
        if (config.enableCaching) {
          const cachedResult = await this.getCachedResult(imagePath, config);
          if (cachedResult) {
            cacheHits++;
            results.push({
              ...cachedResult,
              pageNumber: i + 1
            });
            continue;
          }
        }
        
        // Process with primary strategy
        let result = await this.processImageWithStrategy(imagePath, i + 1, config, tempDir, 'primary');
        
        // Apply fallback strategies if result is poor
        if (result && result.confidence < config.confidenceThreshold && config.fallbackStrategies) {
          const fallbackResult = await this.applyFallbackStrategies(
            imagePath, 
            i + 1, 
            config, 
            tempDir, 
            config.fallbackStrategies,
            result
          );
          
          if (fallbackResult.result) {
            result = fallbackResult.result;
            fallbacksUsed.push(...fallbackResult.strategiesUsed);
          }
        }
        
        if (result && result.confidence >= config.confidenceThreshold) {
          results.push(result);
          
          // Cache the result
          if (config.enableCaching) {
            await this.cacheResult(imagePath, result, config);
          }
        }
      }
      
      const averageConfidence = results.length > 0 
        ? results.reduce((sum, r) => sum + r.confidence, 0) / results.length 
        : 0;
      
      const cacheHitRate = totalProcessed > 0 ? cacheHits / totalProcessed : 0;
      
      return {
        success: true,
        results,
        totalPages: imageFiles.length,
        averageConfidence,
        cacheHitRate,
        languageDetection,
        processingStrategy: this.getProcessingStrategyDescription(config),
        fallbacksUsed
      };
      
    } catch (error) {
      return {
        success: false,
        results: [],
        totalPages: 0,
        averageConfidence: 0,
        cacheHitRate: 0,
        processingStrategy: 'failed',
        fallbacksUsed,
        error: error instanceof Error ? error.message : 'Unknown OCR error'
      };
    } finally {
      // Clean up temporary directory
      try {
        await this.cleanupDirectory(tempDir);
      } catch (error) {
        console.warn('Failed to cleanup OCR temp directory:', error);
      }
    }
  }

  /**
   * Merge options with document type-specific configurations
   */
  private mergeOptionsWithDocumentType(options: OCROptions): Required<Omit<OCROptions, 'documentType' | 'fallbackStrategies' | 'multiLanguageSupport'>> & Pick<OCROptions, 'documentType' | 'fallbackStrategies' | 'multiLanguageSupport'> {
    const baseConfig = { ...OCRService.DEFAULT_OPTIONS };
    
    // Apply document type specific settings
    if (options.documentType) {
      const typeConfig = OCRService.DOCUMENT_TYPE_CONFIGS[options.documentType];
      Object.assign(baseConfig, typeConfig);
    }
    
    // Apply user-provided options (highest priority)
    return { ...baseConfig, ...options };
  }

  /**
   * Process image with a specific strategy
   */
  private async processImageWithStrategy(
    imagePath: string,
    pageNumber: number,
    config: OCROptions,
    tempDir: string,
    strategy: 'primary' | 'fallback'
  ): Promise<OCRResult | null> {
    const startTime = Date.now();
    
    try {
      let processedImagePath = imagePath;
      const preprocessingApplied: string[] = [];
      
      // Apply preprocessing based on strategy
      if (config.preprocessImage) {
        const preprocessingType = strategy === 'primary' ? 'standard' : 'aggressive';
        processedImagePath = await this.preprocessImageAdvanced(imagePath, tempDir, preprocessingType);
        preprocessingApplied.push(preprocessingType);
      }
      
      // Determine optimal PSM if not explicitly set
      let psmMode = config.psmMode;
      if (!psmMode || psmMode === 3) {
        const imageInfo = await this.analyzeImageLayout(processedImagePath);
        psmMode = this.getOptimalPSMFromAnalysis(imageInfo);
      }
      
      // Run OCR with optimized settings
      const ocrConfig = {
        lang: config.language || 'eng',
        oem: config.oem || 3,
        psm: psmMode,
      };
      
      const text = await tesseract.recognize(processedImagePath, ocrConfig);
      
      // Calculate comprehensive quality metrics
      const qualityMetrics = this.calculateQualityMetrics(text);
      const confidence = this.calculateAdvancedConfidence(text, qualityMetrics);
      
      return {
        pageNumber,
        text: text.trim(),
        confidence,
        processingTime: Date.now() - startTime,
        extractionMethod: strategy,
        languageUsed: ocrConfig.lang,
        psmUsed: psmMode,
        preprocessingApplied,
        qualityMetrics
      };
      
    } catch (error) {
      console.warn(`OCR failed for page ${pageNumber} with ${strategy} strategy:`, error);
      return null;
    }
  }

  /**
   * Apply fallback strategies for low-confidence results
   */
  private async applyFallbackStrategies(
    imagePath: string,
    pageNumber: number,
    config: OCROptions,
    tempDir: string,
    strategies: FallbackStrategy[],
    originalResult: OCRResult
  ): Promise<{ result: OCRResult | null; strategiesUsed: FallbackStrategy[] }> {
    const strategiesUsed: FallbackStrategy[] = [];
    let bestResult = originalResult;
    
    for (const strategy of strategies) {
      try {
        let result: OCRResult | null = null;
        
        switch (strategy) {
          case 'retry_with_preprocessing':
            result = await this.retryWithAggressivePreprocessing(imagePath, pageNumber, config, tempDir);
            break;
            
          case 'retry_with_different_psm':
            result = await this.retryWithDifferentPSM(imagePath, pageNumber, config, tempDir);
            break;
            
          case 'retry_with_different_language':
            result = await this.retryWithDifferentLanguage(imagePath, pageNumber, config, tempDir);
            break;
            
          case 'retry_with_higher_dpi':
            result = await this.retryWithHigherDPI(imagePath, pageNumber, config, tempDir);
            break;
            
          case 'segment_and_process':
            result = await this.segmentAndProcess(imagePath, pageNumber, config, tempDir);
            break;
            
          default:
            continue;
        }
        
        if (result && result.confidence > bestResult.confidence) {
          bestResult = result;
          strategiesUsed.push(strategy);
          
          // If we achieve good confidence, stop trying more strategies
          if (result.confidence >= (config.confidenceThreshold || 30) + 20) {
            break;
          }
        }
        
      } catch (error) {
        console.warn(`Fallback strategy ${strategy} failed:`, error);
      }
    }
    
    return {
      result: bestResult.confidence > originalResult.confidence ? bestResult : null,
      strategiesUsed
    };
  }

  /**
   * Detect language from sample images
   */
  private async detectLanguageFromImages(
    imageFiles: string[],
    config: OCROptions
  ): Promise<LanguageDetectionResult> {
    const sampleTexts: string[] = [];
    
    // Extract small samples from first few pages
    for (const imagePath of imageFiles) {
      try {
        const sampleText = await tesseract.recognize(imagePath, {
          lang: 'eng+fra+deu+spa+ita+por', // Multi-language detection
          oem: 3,
          psm: 3
        });
        
        if (sampleText.trim().length > 50) {
          sampleTexts.push(sampleText.substring(0, 200)); // First 200 chars
        }
      } catch (error) {
        console.warn('Language detection sample failed:', error);
      }
    }
    
    if (sampleTexts.length === 0) {
      return {
        detectedLanguage: 'eng',
        confidence: 0.5,
        alternativeLanguages: []
      };
    }
    
    const combinedText = sampleTexts.join(' ');
    return this.analyzeLanguagePatterns(combinedText);
  }

  /**
   * Analyze language patterns in text
   */
  private analyzeLanguagePatterns(text: string): LanguageDetectionResult {
    const scores: Record<string, number> = {};
    
    // Score each language based on character patterns with weights
    for (const [language, { pattern, weight }] of Object.entries(OCRService.LANGUAGE_PATTERNS)) {
      const matches = text.match(new RegExp(pattern.source, pattern.flags + 'g'));
      const matchCount = matches ? matches.length : 0;
      scores[language] = matchCount * weight;
    }
    
    // Find the language with highest weighted score
    const sortedLanguages = Object.entries(scores)
      .filter(([, score]) => score > 0) // Only consider languages with matches
      .sort(([, a], [, b]) => b - a)
      .map(([lang, score]) => ({ 
        language: lang, 
        confidence: Math.min(score / Math.max(text.length / 5, 1), 1) 
      }));
    
    // If no specific language patterns found, default to English
    const detectedLanguage = sortedLanguages[0]?.language || 'eng';
    const confidence = sortedLanguages[0]?.confidence || 0.5;
    
    return {
      detectedLanguage,
      confidence,
      alternativeLanguages: sortedLanguages.slice(1, 4)
    };
  }

  /**
   * Convert PDF to images using ImageMagick or similar tool
   */
  private async convertPDFToImages(
    pdfPath: string, 
    outputDir: string, 
    dpi: number
  ): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const outputPattern = join(outputDir, 'page-%03d.png');
      
      // Use ImageMagick convert command
      const args = [
        '-density', dpi.toString(),
        '-quality', '100',
        '-alpha', 'remove',
        pdfPath,
        outputPattern
      ];
      
      const convertProcess = spawn('convert', args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 300000 // 5 minute timeout
      });
      
      let stderr = '';
      
      convertProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      convertProcess.on('close', async (code) => {
        if (code === 0) {
          try {
            // Find all generated image files
            const files = await fs.readdir(outputDir);
            const imageFiles = files
              .filter(f => f.startsWith('page-') && f.endsWith('.png'))
              .sort()
              .map(f => join(outputDir, f));
            
            resolve(imageFiles);
          } catch (error) {
            reject(new Error(`Failed to read generated images: ${error}`));
          }
        } else {
          reject(new Error(`ImageMagick convert failed with code ${code}: ${stderr}`));
        }
      });
      
      convertProcess.on('error', (error) => {
        reject(new Error(`Failed to spawn convert process: ${error.message}`));
      });
    });
  }

  /**
   * Advanced image preprocessing with different strategies
   */
  private async preprocessImageAdvanced(
    imagePath: string, 
    tempDir: string, 
    type: 'standard' | 'aggressive' | 'handwritten' | 'low_quality'
  ): Promise<string> {
    const outputPath = join(tempDir, `processed-${type}-${uuidv4()}.png`);
    
    return new Promise((resolve) => {
      let args: string[];
      
      switch (type) {
        case 'standard':
          args = [
            imagePath,
            '-colorspace', 'Gray',
            '-normalize',
            '-despeckle',
            '-enhance',
            '-sharpen', '0x1',
            outputPath
          ];
          break;
          
        case 'aggressive':
          args = [
            imagePath,
            '-colorspace', 'Gray',
            '-normalize',
            '-contrast-stretch', '2%x1%',
            '-despeckle',
            '-despeckle', // Apply twice for noisy images
            '-enhance',
            '-sharpen', '0x2',
            '-morphology', 'close', 'rectangle:1x1',
            outputPath
          ];
          break;
          
        case 'handwritten':
          args = [
            imagePath,
            '-colorspace', 'Gray',
            '-normalize',
            '-contrast-stretch', '1%x1%',
            '-median', '1',
            '-enhance',
            '-sharpen', '0x0.5',
            outputPath
          ];
          break;
          
        case 'low_quality':
          args = [
            imagePath,
            '-colorspace', 'Gray',
            '-normalize',
            '-contrast-stretch', '3%x2%',
            '-despeckle',
            '-despeckle',
            '-despeckle', // Triple despeckle for very noisy images
            '-enhance',
            '-enhance', // Double enhance
            '-sharpen', '0x3',
            '-morphology', 'close', 'rectangle:2x2',
            outputPath
          ];
          break;
          
        default:
          args = [imagePath, outputPath]; // No processing
      }
      
      const convertProcess = spawn('convert', args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 120000 // 2 minute timeout for aggressive processing
      });
      
      let stderr = '';
      
      convertProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      convertProcess.on('close', (code) => {
        if (code === 0) {
          resolve(outputPath);
        } else {
          console.warn(`Advanced preprocessing (${type}) failed: ${stderr}`);
          resolve(imagePath);
        }
      });
      
      convertProcess.on('error', (error) => {
        console.warn(`Advanced preprocessing error: ${error.message}`);
        resolve(imagePath);
      });
    });
  }

  /**
   * Analyze image layout to determine optimal processing strategy
   */
  private async analyzeImageLayout(imagePath: string): Promise<{
    width: number;
    height: number;
    aspectRatio: number;
    hasMultipleColumns: boolean;
    textDensity: 'low' | 'medium' | 'high';
    imageQuality: 'poor' | 'fair' | 'good' | 'excellent';
  }> {
    return new Promise((resolve) => {
      // Use ImageMagick identify to get image properties
      const identifyProcess = spawn('identify', ['-format', '%w %h %[mean]', imagePath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 30000
      });
      
      let stdout = '';
      let stderr = '';
      
      identifyProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      identifyProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      identifyProcess.on('close', (code) => {
        if (code === 0 && stdout.trim()) {
          const [widthStr, heightStr, meanStr] = stdout.trim().split(' ');
          const width = parseInt(widthStr, 10);
          const height = parseInt(heightStr, 10);
          const mean = parseFloat(meanStr);
          
          const aspectRatio = width / height;
          
          // Heuristics for layout analysis
          const hasMultipleColumns = aspectRatio > 1.2 && width > 1000;
          
          let textDensity: 'low' | 'medium' | 'high' = 'medium';
          if (mean > 200) textDensity = 'low';   // Mostly white (sparse text)
          else if (mean < 100) textDensity = 'high'; // Mostly dark (dense text)
          
          let imageQuality: 'poor' | 'fair' | 'good' | 'excellent' = 'good';
          if (width < 800 || height < 600) imageQuality = 'poor';
          else if (width < 1200 || height < 900) imageQuality = 'fair';
          else if (width > 2000 && height > 1500) imageQuality = 'excellent';
          
          resolve({
            width,
            height,
            aspectRatio,
            hasMultipleColumns,
            textDensity,
            imageQuality
          });
        } else {
          console.warn(`Image analysis failed: ${stderr}`);
          // Return default values
          resolve({
            width: 800,
            height: 600,
            aspectRatio: 4/3,
            hasMultipleColumns: false,
            textDensity: 'medium',
            imageQuality: 'fair'
          });
        }
      });
      
      identifyProcess.on('error', (error) => {
        console.warn(`Image analysis error: ${error.message}`);
        resolve({
          width: 800,
          height: 600,
          aspectRatio: 4/3,
          hasMultipleColumns: false,
          textDensity: 'medium',
          imageQuality: 'fair'
        });
      });
    });
  }

  /**
   * Get optimal PSM based on image analysis
   */
  private getOptimalPSMFromAnalysis(imageInfo: {
    width: number;
    height: number;
    aspectRatio: number;
    hasMultipleColumns: boolean;
    textDensity: 'low' | 'medium' | 'high';
    imageQuality: 'poor' | 'fair' | 'good' | 'excellent';
  }): number {
    const { aspectRatio, hasMultipleColumns, textDensity, imageQuality } = imageInfo;
    
    // Multi-column documents
    if (hasMultipleColumns) {
      return 3; // Fully automatic page segmentation
    }
    
    // Very wide images (likely single lines)
    if (aspectRatio > 4) {
      return 13; // Raw line
    }
    
    // Very tall, narrow images (single column)
    if (aspectRatio < 0.4) {
      return 4; // Single column
    }
    
    // Low text density (sparse text)
    if (textDensity === 'low') {
      return 6; // Single uniform block
    }
    
    // High text density with poor quality
    if (textDensity === 'high' && imageQuality === 'poor') {
      return 8; // Single word (more conservative)
    }
    
    // Default for most documents
    return 6; // Single uniform block
  }

  /**
   * Calculate comprehensive quality metrics for OCR text
   */
  private calculateQualityMetrics(text: string): QualityMetrics {
    if (!text || text.trim().length === 0) {
      return {
        textLength: 0,
        wordCount: 0,
        averageWordLength: 0,
        specialCharacterRatio: 0,
        capitalizationScore: 0,
        sentenceStructureScore: 0,
        overallQualityScore: 0
      };
    }
    
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Basic metrics
    const textLength = text.length;
    const wordCount = words.length;
    const averageWordLength = wordCount > 0 ? words.reduce((sum, w) => sum + w.length, 0) / wordCount : 0;
    
    // Special character ratio
    const specialChars = text.match(/[^a-zA-Z0-9\s.,!?;:'"()-]/g) || [];
    const specialCharacterRatio = specialChars.length / textLength;
    
    // Capitalization score
    const capitalizedWords = words.filter(w => /^[A-Z]/.test(w)).length;
    const capitalizationScore = wordCount > 0 ? capitalizedWords / wordCount : 0;
    
    // Sentence structure score
    const averageSentenceLength = sentences.length > 0 ? wordCount / sentences.length : 0;
    const sentenceStructureScore = Math.min(averageSentenceLength / 15, 1); // Normalize to 0-1
    
    // Overall quality score (0-1)
    let overallQualityScore = 0.5; // Base score
    
    // Positive factors
    if (textLength > 50) overallQualityScore += 0.1;
    if (averageWordLength > 3 && averageWordLength < 8) overallQualityScore += 0.1;
    if (capitalizationScore > 0.05 && capitalizationScore < 0.5) overallQualityScore += 0.1;
    if (sentences.length > 1) overallQualityScore += 0.1;
    if (sentenceStructureScore > 0.3) overallQualityScore += 0.1;
    
    // Negative factors
    if (specialCharacterRatio > 0.1) overallQualityScore -= 0.2;
    if (/(.)\1{4,}/.test(text)) overallQualityScore -= 0.1; // Repeated characters
    if (averageWordLength < 2) overallQualityScore -= 0.2; // Very short words
    
    overallQualityScore = Math.max(0, Math.min(1, overallQualityScore));
    
    return {
      textLength,
      wordCount,
      averageWordLength,
      specialCharacterRatio,
      capitalizationScore,
      sentenceStructureScore,
      overallQualityScore
    };
  }

  /**
   * Calculate advanced confidence score based on quality metrics
   */
  private calculateAdvancedConfidence(text: string, metrics: QualityMetrics): number {
    if (!text || text.trim().length === 0) return 0;
    
    // Base confidence from overall quality score
    let confidence = metrics.overallQualityScore * 100;
    
    // Additional adjustments
    if (metrics.textLength > 200) confidence += 5;
    if (metrics.wordCount > 50) confidence += 5;
    if (metrics.sentenceStructureScore > 0.5) confidence += 10;
    
    // Penalties
    if (metrics.specialCharacterRatio > 0.15) confidence -= 15;
    if (metrics.averageWordLength < 2.5) confidence -= 10;
    
    return Math.max(0, Math.min(100, confidence));
  }

  /**
   * Fallback strategy: Retry with aggressive preprocessing
   */
  private async retryWithAggressivePreprocessing(
    imagePath: string,
    pageNumber: number,
    config: OCROptions,
    tempDir: string
  ): Promise<OCRResult | null> {
    const processedPath = await this.preprocessImageAdvanced(imagePath, tempDir, 'aggressive');
    return this.processImageWithStrategy(processedPath, pageNumber, config, tempDir, 'fallback');
  }

  /**
   * Fallback strategy: Retry with different PSM modes
   */
  private async retryWithDifferentPSM(
    imagePath: string,
    pageNumber: number,
    config: OCROptions,
    tempDir: string
  ): Promise<OCRResult | null> {
    const psmModes = [6, 4, 8, 13]; // Try different PSM modes
    let bestResult: OCRResult | null = null;
    
    for (const psm of psmModes) {
      if (psm === config.psmMode) continue; // Skip the already tried PSM
      
      const modifiedConfig = { ...config, psmMode: psm };
      const result = await this.processImageWithStrategy(imagePath, pageNumber, modifiedConfig, tempDir, 'fallback');
      
      if (result && (!bestResult || result.confidence > bestResult.confidence)) {
        bestResult = result;
      }
    }
    
    return bestResult;
  }

  /**
   * Fallback strategy: Retry with different languages
   */
  private async retryWithDifferentLanguage(
    imagePath: string,
    pageNumber: number,
    config: OCROptions,
    tempDir: string
  ): Promise<OCRResult | null> {
    // Quick language detection on this specific image
    const sampleText = await tesseract.recognize(imagePath, {
      lang: 'eng+fra+deu+spa',
      oem: 3,
      psm: 3
    });
    
    const languageAnalysis = this.analyzeLanguagePatterns(sampleText);
    
    if (languageAnalysis.detectedLanguage !== config.language) {
      const modifiedConfig = { ...config, language: languageAnalysis.detectedLanguage };
      return this.processImageWithStrategy(imagePath, pageNumber, modifiedConfig, tempDir, 'fallback');
    }
    
    return null;
  }

  /**
   * Fallback strategy: Retry with higher DPI
   */
  private async retryWithHigherDPI(
    imagePath: string,
    pageNumber: number,
    config: OCROptions,
    tempDir: string
  ): Promise<OCRResult | null> {
    // Upscale the image to simulate higher DPI
    const upscaledPath = join(tempDir, `upscaled-${uuidv4()}.png`);
    
    return new Promise((resolve) => {
      const args = [
        imagePath,
        '-resize', '150%', // Increase size by 50%
        '-unsharp', '0x0.5+0.5+0.05', // Sharpen after resize
        upscaledPath
      ];
      
      const convertProcess = spawn('convert', args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 60000
      });
      
      convertProcess.on('close', async (code) => {
        if (code === 0) {
          const result = await this.processImageWithStrategy(upscaledPath, pageNumber, config, tempDir, 'fallback');
          resolve(result);
        } else {
          resolve(null);
        }
      });
      
      convertProcess.on('error', () => {
        resolve(null);
      });
    });
  }

  /**
   * Fallback strategy: Segment image and process parts separately
   */
  private async segmentAndProcess(
    imagePath: string,
    pageNumber: number,
    config: OCROptions,
    tempDir: string
  ): Promise<OCRResult | null> {
    // This is a simplified version - in production you might use more sophisticated segmentation
    const segments = await this.createImageSegments(imagePath, tempDir);
    
    if (segments.length === 0) return null;
    
    const segmentResults: string[] = [];
    
    for (const segmentPath of segments) {
      try {
        const text = await tesseract.recognize(segmentPath, {
          lang: config.language || 'eng',
          oem: config.oem || 3,
          psm: 6 // Single block for segments
        });
        
        if (text.trim()) {
          segmentResults.push(text.trim());
        }
      } catch (error) {
        console.warn('Segment processing failed:', error);
      }
    }
    
    if (segmentResults.length === 0) return null;
    
    const combinedText = segmentResults.join('\n');
    const qualityMetrics = this.calculateQualityMetrics(combinedText);
    const confidence = this.calculateAdvancedConfidence(combinedText, qualityMetrics);
    
    return {
      pageNumber,
      text: combinedText,
      confidence,
      processingTime: 0, // Would need to track actual time
      extractionMethod: 'fallback',
      languageUsed: config.language || 'eng',
      psmUsed: 6,
      preprocessingApplied: ['segmentation'],
      qualityMetrics
    };
  }

  /**
   * Create image segments for separate processing
   */
  private async createImageSegments(imagePath: string, tempDir: string): Promise<string[]> {
    // Simple horizontal segmentation - split image into top and bottom halves
    const segments: string[] = [];
    
    for (let i = 0; i < 2; i++) {
      const segmentPath = join(tempDir, `segment-${i}-${uuidv4()}.png`);
      const cropGeometry = i === 0 ? '100%x50%+0+0' : '100%x50%+0+50%';
      
      await new Promise<void>((resolve) => {
        const args = [imagePath, '-crop', cropGeometry, segmentPath];
        
        const convertProcess = spawn('convert', args, {
          stdio: ['pipe', 'pipe', 'pipe'],
          timeout: 30000
        });
        
        convertProcess.on('close', (code) => {
          if (code === 0) {
            segments.push(segmentPath);
          }
          resolve();
        });
        
        convertProcess.on('error', () => {
          resolve();
        });
      });
    }
    
    return segments;
  }

  /**
   * Generate cache key for image and options
   */
  private async generateCacheKey(imagePath: string, options: OCROptions): Promise<string> {
    try {
      const imageBuffer = await fs.readFile(imagePath);
      const imageHash = crypto.createHash('md5').update(imageBuffer).digest('hex');
      const optionsHash = crypto.createHash('md5').update(JSON.stringify(options)).digest('hex');
      return `${imageHash}-${optionsHash}`;
    } catch (error) {
      // Fallback to path-based key
      return crypto.createHash('md5').update(`${imagePath}-${JSON.stringify(options)}`).digest('hex');
    }
  }

  /**
   * Get cached OCR result
   */
  private async getCachedResult(imagePath: string, options: OCROptions): Promise<OCRResult | null> {
    if (!options.enableCaching) return null;
    
    try {
      const cacheKey = await this.generateCacheKey(imagePath, options);
      const cached = this.cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        return cached.result;
      }
      
      // Remove expired entry
      if (cached) {
        this.cache.delete(cacheKey);
      }
      
      return null;
    } catch (error) {
      console.warn('Cache retrieval failed:', error);
      return null;
    }
  }

  /**
   * Cache OCR result
   */
  private async cacheResult(imagePath: string, result: OCRResult, options: OCROptions): Promise<void> {
    if (!options.enableCaching) return;
    
    try {
      // Clean up cache if it's getting too large
      if (this.cache.size >= this.MAX_CACHE_SIZE) {
        this.cleanupCache();
      }
      
      const cacheKey = await this.generateCacheKey(imagePath, options);
      
      this.cache.set(cacheKey, {
        hash: cacheKey,
        result,
        timestamp: Date.now(),
        options
      });
    } catch (error) {
      console.warn('Cache storage failed:', error);
    }
  }

  /**
   * Clean up old cache entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    const entriesToDelete: string[] = [];
    
    // Find expired entries
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.CACHE_TTL) {
        entriesToDelete.push(key);
      }
    }
    
    // Delete expired entries
    entriesToDelete.forEach(key => this.cache.delete(key));
    
    // If still too large, delete oldest entries
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const sortedEntries = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp);
      
      const toDelete = sortedEntries.slice(0, Math.floor(this.MAX_CACHE_SIZE * 0.2));
      toDelete.forEach(([key]) => this.cache.delete(key));
    }
  }

  /**
   * Get processing strategy description
   */
  private getProcessingStrategyDescription(config: OCROptions): string {
    const parts: string[] = [];
    
    if (config.documentType) {
      parts.push(`document_type:${config.documentType}`);
    }
    
    parts.push(`lang:${config.language || 'eng'}`);
    parts.push(`psm:${config.psmMode || 3}`);
    parts.push(`dpi:${config.dpi || 300}`);
    
    if (config.preprocessImage) {
      parts.push('preprocessed');
    }
    
    if (config.autoDetectLanguage) {
      parts.push('auto_lang');
    }
    
    return parts.join(',');
  }

  /**
   * Clear OCR cache
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): { size: number; maxSize: number; hitRate?: number } {
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE
    };
  }

  /**
   * Clean up temporary directory
   */
  private async cleanupDirectory(dirPath: string): Promise<void> {
    try {
      const files = await fs.readdir(dirPath);
      await Promise.all(files.map(file => fs.unlink(join(dirPath, file))));
      await fs.rmdir(dirPath);
    } catch (error) {
      // Ignore cleanup errors
    }
  }

  /**
   * Detect language of text for automatic language selection (public method)
   */
  detectLanguage(text: string): string {
    const analysis = this.analyzeLanguagePatterns(text);
    return analysis.detectedLanguage;
  }

  /**
   * Get optimal PSM mode based on document characteristics (public method)
   */
  getOptimalPSM(imageWidth: number, imageHeight: number, hasMultipleColumns: boolean = false): number {
    const aspectRatio = imageWidth / imageHeight;
    
    if (hasMultipleColumns) {
      return 3; // Fully automatic for complex layouts
    }
    
    if (aspectRatio > 3) {
      return 13; // Single line for very wide images
    }
    
    if (aspectRatio < 0.5) {
      return 4; // Single column for tall, narrow images
    }
    
    return 6; // Single block for most documents
  }

  /**
   * Get recommended settings for document type
   */
  public getDocumentTypeSettings(documentType: DocumentType): Partial<OCROptions> {
    return OCRService.DOCUMENT_TYPE_CONFIGS[documentType] || {};
  }

  /**
   * Get available document types
   */
  public getAvailableDocumentTypes(): DocumentType[] {
    return Object.keys(OCRService.DOCUMENT_TYPE_CONFIGS) as DocumentType[];
  }

  /**
   * Get available fallback strategies
   */
  public getAvailableFallbackStrategies(): FallbackStrategy[] {
    return [
      'retry_with_preprocessing',
      'retry_with_different_psm',
      'retry_with_different_language',
      'retry_with_higher_dpi',
      'segment_and_process'
    ];
  }

  /**
   * Validate OCR options
   */
  public validateOptions(options: OCROptions): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (options.confidenceThreshold !== undefined) {
      if (options.confidenceThreshold < 0 || options.confidenceThreshold > 100) {
        errors.push('Confidence threshold must be between 0 and 100');
      }
    }
    
    if (options.dpi !== undefined) {
      if (options.dpi < 72 || options.dpi > 1200) {
        errors.push('DPI must be between 72 and 1200');
      }
    }
    
    if (options.psmMode !== undefined) {
      if (options.psmMode < 0 || options.psmMode > 13) {
        errors.push('PSM mode must be between 0 and 13');
      }
    }
    
    if (options.oem !== undefined) {
      if (![0, 1, 2, 3].includes(options.oem)) {
        errors.push('OEM must be 0, 1, 2, or 3');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export const ocrService = new OCRService();