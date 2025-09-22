import { promises as fs } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { v4 as uuidv4 } from "uuid";
import { ocrService, type OCROptions } from "./ocr-service";
import { chunkingService, type ChunkingOptions } from "./chunking-service";
import { syncfusionTextExtractor, type SyncfusionExtractionOptions } from "./syncfusion-text-extractor";

export interface DocumentChunk {
  id: string;
  content: string;
  pageNumber: number;
  chunkIndex: number;
  tokenCount: number;
  sectionTitle?: string;   
  metadata: ChunkMetadata;
}

export interface ChunkMetadata {
  documentTitle: string;
  extractionMethod: "syncfusion" | "ocr";
  processingVersion: string;
  contentType: "paragraph" | "heading" | "list" | "table" | "caption";
  confidence?: number;
}

export interface ProcessingOptions extends OCROptions, ChunkingOptions, SyncfusionExtractionOptions {
  useOCR?: boolean;
  forceReprocess?: boolean;
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
          console.warn("Syncfusion extraction failed, falling back to OCR:", error);
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
      const extractionResult = await syncfusionTextExtractor.extractText(pdfBuffer, {
        enableTextSelection: options.enableTextSelection,
        enableTextSearch: options.enableTextSearch,
        extractImages: options.extractImages,
        preserveFormatting: options.preserveFormatting,
        timeout: options.timeout
      });

      if (!extractionResult.success) {
        throw new Error(extractionResult.error || 'Syncfusion extraction failed');
      }

      // Convert Syncfusion page texts to our format
      const pageTexts = extractionResult.pageTexts.map(pageText => ({
        pageNumber: pageText.pageNumber,
        text: pageText.text
      }));

      // Preprocess and chunk the text
      const processedTexts = pageTexts.map(({ pageNumber, text }) => ({
        pageNumber,
        text: this.preprocessText(text),
      }));

      const chunks = this.createChunks(
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
      throw new Error(`Syncfusion extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

      const chunks = this.createChunks(
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
    const ocrResult = await ocrService.processPDF(pdfPath, {
      language: options.language,
      psmMode: options.psmMode,
      oem: options.oem,
      confidenceThreshold: options.confidenceThreshold,
      dpi: options.dpi,
      preprocessImage: options.preprocessImage,
    });

    if (!ocrResult.success) {
      throw new Error(ocrResult.error || "OCR processing failed");
    }

    return ocrResult.results.map((result) => ({
      pageNumber: result.pageNumber,
      text: result.text,
      confidence: result.confidence,
    }));
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
   */
  private createChunks(
    pageTexts: Array<{ pageNumber: number; text: string }>,
    documentTitle: string,
    extractionMethod: "syncfusion" | "ocr",
    options: ProcessingOptions = {}
  ): DocumentChunk[] {
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
        chunks.push({
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
        });
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
