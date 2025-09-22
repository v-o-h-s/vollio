import tesseract from 'node-tesseract-ocr';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { v4 as uuidv4 } from 'uuid';

export interface OCROptions {
  language?: string;
  psmMode?: number;
  oem?: number;
  confidenceThreshold?: number;
  dpi?: number;
  preprocessImage?: boolean;
}

export interface OCRResult {
  pageNumber: number;
  text: string;
  confidence: number;
  processingTime: number;
}

export interface OCRPageResult {
  success: boolean;
  results: OCRResult[];
  totalPages: number;
  averageConfidence: number;
  error?: string;
}

export class OCRService {
  private static readonly DEFAULT_OPTIONS: Required<OCROptions> = {
    language: 'eng',
    psmMode: 3, // Fully automatic page segmentation
    oem: 3, // Use LSTM OCR Engine Mode
    confidenceThreshold: 30,
    dpi: 300,
    preprocessImage: true
  };

  /**
   * Process PDF with OCR, converting to images first for better page-by-page processing
   */
  async processPDF(pdfPath: string, options: OCROptions = {}): Promise<OCRPageResult> {
    const config = { ...OCRService.DEFAULT_OPTIONS, ...options };
    const tempDir = join(tmpdir(), `ocr-${uuidv4()}`);
    
    try {
      // Create temporary directory
      await fs.mkdir(tempDir, { recursive: true });
      
      // Convert PDF to images
      const imageFiles = await this.convertPDFToImages(pdfPath, tempDir, config.dpi);
      
      // Process each image with OCR
      const results: OCRResult[] = [];
      
      for (let i = 0; i < imageFiles.length; i++) {
        const startTime = Date.now();
        
        try {
          const imagePath = imageFiles[i];
          let processedImagePath = imagePath;
          
          // Preprocess image if enabled
          if (config.preprocessImage) {
            processedImagePath = await this.preprocessImage(imagePath, tempDir);
          }
          
          // Run OCR
          const text = await tesseract.recognize(processedImagePath, {
            lang: config.language,
            oem: config.oem,
            psm: config.psmMode,
          });
          
          // Estimate confidence (node-tesseract-ocr doesn't provide detailed confidence)
          const confidence = this.estimateConfidence(text);
          
          if (confidence >= config.confidenceThreshold) {
            results.push({
              pageNumber: i + 1,
              text: text.trim(),
              confidence,
              processingTime: Date.now() - startTime
            });
          }
          
        } catch (error) {
          console.warn(`OCR failed for page ${i + 1}:`, error);
          // Continue with other pages
        }
      }
      
      const averageConfidence = results.length > 0 
        ? results.reduce((sum, r) => sum + r.confidence, 0) / results.length 
        : 0;
      
      return {
        success: true,
        results,
        totalPages: imageFiles.length,
        averageConfidence
      };
      
    } catch (error) {
      return {
        success: false,
        results: [],
        totalPages: 0,
        averageConfidence: 0,
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
   * Preprocess image for better OCR results
   */
  private async preprocessImage(imagePath: string, tempDir: string): Promise<string> {
    const outputPath = join(tempDir, `processed-${uuidv4()}.png`);
    
    return new Promise((resolve, reject) => {
      // Use ImageMagick to enhance image for OCR
      const args = [
        imagePath,
        '-colorspace', 'Gray',
        '-normalize',
        '-despeckle',
        '-enhance',
        '-sharpen', '0x1',
        outputPath
      ];
      
      const convertProcess = spawn('convert', args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 60000 // 1 minute timeout
      });
      
      let stderr = '';
      
      convertProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      convertProcess.on('close', (code) => {
        if (code === 0) {
          resolve(outputPath);
        } else {
          // If preprocessing fails, use original image
          console.warn(`Image preprocessing failed: ${stderr}`);
          resolve(imagePath);
        }
      });
      
      convertProcess.on('error', (error) => {
        console.warn(`Image preprocessing error: ${error.message}`);
        resolve(imagePath);
      });
    });
  }

  /**
   * Estimate confidence based on text characteristics
   */
  private estimateConfidence(text: string): number {
    if (!text || text.trim().length === 0) return 0;
    
    let confidence = 50; // Base confidence
    
    // Boost confidence for longer text
    if (text.length > 100) confidence += 10;
    if (text.length > 500) confidence += 10;
    
    // Boost confidence for proper sentence structure
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length > 1) confidence += 10;
    
    // Boost confidence for proper capitalization
    const words = text.split(/\s+/);
    const capitalizedWords = words.filter(w => /^[A-Z]/.test(w)).length;
    const capitalizationRatio = capitalizedWords / words.length;
    if (capitalizationRatio > 0.1 && capitalizationRatio < 0.8) confidence += 10;
    
    // Reduce confidence for excessive special characters
    const specialCharRatio = (text.match(/[^a-zA-Z0-9\s.,!?;:'"()-]/g) || []).length / text.length;
    if (specialCharRatio > 0.1) confidence -= 20;
    
    // Reduce confidence for excessive repeated characters
    if (/(.)\1{3,}/.test(text)) confidence -= 15;
    
    return Math.max(0, Math.min(100, confidence));
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
   * Detect language of text for automatic language selection
   */
  detectLanguage(text: string): string {
    // Simple language detection based on character patterns
    // In production, you might want to use a proper language detection library
    
    if (/[àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]/i.test(text)) {
      return 'fra'; // French
    }
    
    if (/[äöüß]/i.test(text)) {
      return 'deu'; // German
    }
    
    if (/[áéíóúüñ¿¡]/i.test(text)) {
      return 'spa'; // Spanish
    }
    
    if (/[àèéìíîòóùú]/i.test(text)) {
      return 'ita'; // Italian
    }
    
    // Default to English
    return 'eng';
  }

  /**
   * Get optimal PSM mode based on document characteristics
   */
  getOptimalPSM(imageWidth: number, imageHeight: number, hasMultipleColumns: boolean = false): number {
    // PSM modes:
    // 3 = Fully automatic page segmentation (default)
    // 4 = Assume a single column of text of variable sizes
    // 6 = Assume a single uniform block of vertically aligned text
    // 8 = Treat the image as a single word
    // 13 = Raw line. Treat the image as a single text line
    
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
}

export const ocrService = new OCRService();