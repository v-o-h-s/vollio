import { promises as fs } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { v4 as uuidv4 } from "uuid";
import { ocrService, type OCROptions, type DocumentType, type FallbackStrategy } from "./ocr-service";
import { chunkingService, type ChunkingOptions } from "./chunking-service";
import {
  syncfusionTextExtractor,
  type SyncfusionExtractionOptions,
} from "./syncfusion-text-extractor";
import { embeddingService, type EmbeddingOptions } from "./embedding-service";

export interface DocumentChunk {
  id: string;
  content: string;
  pageNumber: number;
  chunkIndex: number;
  tokenCount: number;
  sectionTitle?: string;
  embedding?: number[]; // Vector embedding for semantic search
  metadata: ChunkMetadata;
}

export interface ChunkMetadata {
  documentTitle: string;
  extractionMethod: "syncfusion" | "ocr";
  processingVersion: string;
  contentType: "paragraph" | "heading" | "list" | "table" | "caption";
  confidence?: number;
}

export interface ProcessingOptions
  extends OCROptions,
    ChunkingOptions,
    SyncfusionExtractionOptions,
    EmbeddingOptions {
  useOCR?: boolean;
  forceReprocess?: boolean;
  generateEmbeddings?: boolean; // Whether to generate vector embeddings
  documentType?: DocumentType;
  autoDetectLanguage?: boolean;
  multiLanguageSupport?: string[];
  fallbackStrategies?: FallbackStrategy[];
}

export interface ProcessingResult {
  success: boolean;
  chunks: DocumentChunk[];
  extractionMethod: "syncfusion" | "ocr";
  processingTime: number;
  totalPages: number;
  error?: string;
}

export class DocumentProcessingService {
  private static readonly CHUNK_SIZE = 400; // tokens
  private static readonly CHUNK_OVERLAP = 50; // tokens
  private static readonly PROCESSING_VERSION = "1.0.0";

  /**
   * Process a PDF document and extract text chunks
   */
  async processDocument(
    pdfBuffer: Buffer,
    documentTitle: string,
    options: ProcessingOptions = {}
  ): Promise<ProcessingResult> {
    const startTime = Date.now();

    try {
      // First attempt: Syncfusion text extraction
      if (!options.useOCR) {
        try {
          const pdfResult = await this.extractTextWithSyncfusion(
            pdfBuffer,
            documentTitle,
            options
          );
          if (pdfResult.success && pdfResult.chunks.length > 0) {
            return {
              ...pdfResult,
              processingTime: Date.now() - startTime,
            };
          }
        } catch (error) {
          console.warn(
            "Syncfusion extraction failed, falling back to OCR:",
            error
          );
        }
      }

      // Fallback: node-tesseract-ocr
      const ocrResult = await this.extractTextWithOCR(
        pdfBuffer,
        documentTitle,
        options
      );
      return {
        ...ocrResult,
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        chunks: [],
        extractionMethod: "syncfusion",
        processingTime: Date.now() - startTime,
        totalPages: 0,
        error:
          error instanceof Error ? error.message : "Unknown processing error",
      };
    }
  }

  /**
   * Extract text using Syncfusion PDF Viewer
   */
  private async extractTextWithSyncfusion(
    pdfBuffer: Buffer,
    documentTitle: string,
    options: ProcessingOptions
  ): Promise<ProcessingResult> {
    try {
      // Use the dedicated Syncfusion text extractor
      const extractionResult = await syncfusionTextExtractor.extractText(
        pdfBuffer,
        {
          enableTextSelection: options.enableTextSelection,
          enableTextSearch: options.enableTextSearch,
          extractImages: options.extractImages,
          preserveFormatting: options.preserveFormatting,
          timeout: options.timeout,
        }
      );

      if (!extractionResult.success) {
        throw new Error(
          extractionResult.error || "Syncfusion extraction failed"
        );
      }

      // Convert Syncfusion page texts to our format
      const pageTexts = extractionResult.pageTexts.map((pageText) => ({
        pageNumber: pageText.pageNumber,
        text: pageText.text,
      }));

      // Preprocess and chunk the text
      const processedTexts = pageTexts.map(({ pageNumber, text }) => ({
        pageNumber,
        text: this.preprocessText(text),
      }));

      const chunks = await this.createChunks(
        processedTexts,
        documentTitle,
        "syncfusion",
        options
      );

      return {
        success: true,
        chunks,
        extractionMethod: "syncfusion",
        processingTime: 0, // Will be set by caller
        totalPages: extractionResult.totalPages,
      };
    } catch (error) {
      throw new Error(
        `Syncfusion extraction failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Extract text using node-tesseract-ocr
   */
  private async extractTextWithOCR(
    pdfBuffer: Buffer,
    documentTitle: string,
    options: ProcessingOptions
  ): Promise<ProcessingResult> {
    const tempDir = tmpdir();
    const tempPdfPath = join(tempDir, `${uuidv4()}.pdf`);

    try {
      // Write PDF to temporary file
      await fs.writeFile(tempPdfPath, pdfBuffer);

      // Convert PDF to images and extract text
      const pageTexts = await this.extractTextFromPdfWithTesseract(
        tempPdfPath,
        options
      );

      // Preprocess and chunk the text
      const processedTexts = pageTexts.map(({ pageNumber, text }) => ({
        pageNumber,
        text: this.preprocessText(text),
      }));

      const chunks = await this.createChunks(
        processedTexts,
        documentTitle,
        "ocr",
        options
      );

      return {
        success: true,
        chunks,
        extractionMethod: "ocr",
        processingTime: 0, // Will be set by caller
        totalPages: pageTexts.length,
      };
    } finally {
      // Clean up temporary file
      try {
        await fs.unlink(tempPdfPath);
      } catch (error) {
        console.warn("Failed to clean up temporary file:", error);
      }
    }
  }

  /**
   * Extract text from PDF using advanced OCR service
   */
  private async extractTextFromPdfWithTesseract(
    pdfPath: string,
    options: ProcessingOptions
  ): Promise<Array<{ pageNumber: number; text: string; confidence?: number }>> {
    // Determine document type from options or use default
    const documentType = options.documentType || this.inferDocumentType(options);
    
    // Configure OCR with enhanced options
    const ocrOptions: OCROptions = {
      language: options.language,
      psmMode: options.psmMode,
      oem: options.oem,
      confidenceThreshold: options.confidenceThreshold,
      dpi: options.dpi,
      preprocessImage: options.preprocessImage,
      documentType,
      enableCaching: true,
      autoDetectLanguage: options.autoDetectLanguage || false,
      multiLanguageSupport: options.multiLanguageSupport,
      fallbackStrategies: options.fallbackStrategies || [
        'retry_with_preprocessing',
        'retry_with_different_psm',
        'retry_with_different_language'
      ]
    };

    const ocrResult = await ocrService.processPDF(pdfPath, ocrOptions);

    if (!ocrResult.success) {
      throw new Error(ocrResult.error || "OCR processing failed");
    }

    // Log OCR performance metrics
    console.log(`📊 OCR Performance Metrics:`);
    console.log(`   - Pages processed: ${ocrResult.totalPages}`);
    console.log(`   - Average confidence: ${ocrResult.averageConfidence.toFixed(1)}%`);
    console.log(`   - Cache hit rate: ${(ocrResult.cacheHitRate * 100).toFixed(1)}%`);
    console.log(`   - Processing strategy: ${ocrResult.processingStrategy}`);
    
    if (ocrResult.languageDetection) {
      console.log(`   - Detected language: ${ocrResult.languageDetection.detectedLanguage} (${(ocrResult.languageDetection.confidence * 100).toFixed(1)}%)`);
    }
    
    if (ocrResult.fallbacksUsed.length > 0) {
      console.log(`   - Fallbacks used: ${ocrResult.fallbacksUsed.join(', ')}`);
    }

    return ocrResult.results.map((result) => ({
      pageNumber: result.pageNumber,
      text: result.text,
      confidence: result.confidence,
    }));
  }

  /**
   * Infer document type from processing options
   */
  private inferDocumentType(options: ProcessingOptions): DocumentType {
    // Simple heuristics to infer document type
    // In a real application, you might use more sophisticated analysis
    
    if (options.language && options.language !== 'eng') {
      return 'text_document'; // Multi-language documents are often regular text
    }
    
    if (options.psmMode === 3) {
      return 'mixed_content'; // Fully automatic suggests complex layout
    }
    
    if (options.psmMode === 4) {
      return 'single_column'; // Single column mode
    }
    
    if (options.dpi && options.dpi > 350) {
      return 'technical_manual'; // High DPI suggests detailed technical content
    }
    
    // Default to text document
    return 'text_document';
  }

  /**
   * Preprocess extracted text
   */
  private preprocessText(text: string): string {
    return (
      text
        // Remove excessive whitespace
        .replace(/\s+/g, " ")
        // Remove common header/footer patterns
        .replace(/^Page \d+.*$/gm, "")
        .replace(/^\d+\s*$/gm, "")
        // Remove URLs and email addresses
        .replace(/https?:\/\/[^\s]+/g, "")
        .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "")
        // Normalize punctuation
        .replace(/[""]/g, '"')
        .replace(/['']/g, "'")
        // Clean up
        .trim()
    );
  }

  /**
   * Create semantic chunks from processed text using advanced chunking service
   * Optionally generates vector embeddings for each chunk
   */
  private async createChunks(
    pageTexts: Array<{ pageNumber: number; text: string }>,
    documentTitle: string,
    extractionMethod: "syncfusion" | "ocr",
    options: ProcessingOptions = {}
  ): Promise<DocumentChunk[]> {
    const chunks: DocumentChunk[] = [];
    let globalChunkIndex = 0;

    for (const { pageNumber, text } of pageTexts) {
      if (!text.trim()) continue;

      // Use advanced chunking service
      const chunkingResult = chunkingService.createChunks(text, {
        chunkSize: options.chunkSize || DocumentProcessingService.CHUNK_SIZE,
        chunkOverlap:
          options.chunkOverlap || DocumentProcessingService.CHUNK_OVERLAP,
        preserveStructure: options.preserveStructure,
        respectSentenceBoundaries: options.respectSentenceBoundaries,
        respectParagraphBoundaries: options.respectParagraphBoundaries,
      });

      for (const chunk of chunkingResult.chunks) {
        const documentChunk: DocumentChunk = {
          id: chunk.id,
          content: chunk.content,
          pageNumber,
          chunkIndex: globalChunkIndex++,
          tokenCount: chunk.tokenCount,
          sectionTitle: this.extractSectionTitle(chunk.content),
          metadata: {
            documentTitle,
            extractionMethod,
            processingVersion: DocumentProcessingService.PROCESSING_VERSION,
            contentType: chunk.metadata.contentType,
            confidence: extractionMethod === "ocr" ? 85 : undefined, // Default OCR confidence
          },
        };

        chunks.push(documentChunk);
      }
    }

    // Generate embeddings if requested
    if (options.generateEmbeddings && chunks.length > 0) {
      try {
        console.log(`Generating embeddings for ${chunks.length} chunks...`);

        const chunkTexts = chunks.map((chunk) => chunk.content);
        const embeddingResult = await embeddingService.generateBatchEmbeddings(
          chunkTexts,
          {
            model: options.model,
            batchSize: options.batchSize || 50,
            cacheEnabled: options.cacheEnabled !== false,
            validateQuality: options.validateQuality !== false,
            retryAttempts: options.retryAttempts || 3,
          }
        );

        if (embeddingResult.success) {
          // Add embeddings to chunks
          embeddingResult.results.forEach((embeddingRes, index) => {
            if (chunks[index]) {
              chunks[index].embedding = embeddingRes.embedding;
            }
          });

          console.log(
            `✅ Generated embeddings for ${embeddingResult.totalProcessed} chunks`
          );
          console.log(
            `   - Cache hit rate: ${(
              embeddingResult.cacheHitRate * 100
            ).toFixed(1)}%`
          );
          console.log(
            `   - Average quality: ${
              embeddingResult.averageQualityScore?.toFixed(3) || "N/A"
            }`
          );
        } else {
          console.warn(
            `⚠️ Failed to generate embeddings: ${embeddingResult.error}`
          );
        }
      } catch (error) {
        console.warn(
          `⚠️ Embedding generation failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
        // Continue without embeddings - they're optional
      }
    }

    return chunks;
  }

  /**
   * Extract section title from chunk content
   */
  private extractSectionTitle(content: string): string | undefined {
    const lines = content.split("\n");
    const firstLine = lines[0]?.trim();

    // If first line looks like a heading, use it as section title
    if (
      firstLine &&
      firstLine.length < 100 &&
      /^[A-Z][^.!?]*$/.test(firstLine) &&
      !firstLine.includes("\n")
    ) {
      return firstLine;
    }

    return undefined;
  }
}

export const documentProcessingService = new DocumentProcessingService();
