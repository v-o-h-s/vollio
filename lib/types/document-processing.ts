/**
 * Document processing types for text extraction, chunking, and RAG system
 */

// ============================================================================
// DOCUMENT PROCESSING TYPES
// ============================================================================

/**
 * Document chunk for vector storage and retrieval
 */
export interface DocumentChunk {
  id: string;
  userId: string;
  documentId: string;
  chunkIndex: number;
  content: string;
  embedding?: number[];
  tokenCount: number;
  pageNumber: number;
  sectionTitle?: string;
  metadata: ChunkMetadata;
  createdAt: string;
  updatedAt: string;
}

/**
 * Metadata for document chunks
 */
export interface ChunkMetadata {
  documentTitle: string;
  extractionMethod: "syncfusion" | "ocr" | "pdfjs";
  processingVersion: string;
  contentType: "paragraph" | "heading" | "list" | "table" | "caption";
  confidence?: number;
}

/**
 * Document processing status tracking
 */
export interface DocumentProcessingStatus {
  id: string;
  userId: string;
  documentId: string;
  status: "pending" | "processing" | "completed" | "failed";
  totalChunks: number;
  processedChunks: number;
  extractionMethod?: "syncfusion" | "ocr";
  errorMessage?: string;
  processingStartedAt?: string;
  processingCompletedAt?: string;
  createdAt: string;
  updatedAt: string;
}


/**
 * Document processing request interface
 */
export interface DocumentProcessingRequest {
  pdfId: string;
  useOCR?: boolean;
  forceReprocess?: boolean;
  generateEmbeddings?: boolean;
  ocrOptions?: {
    language?: string;
    psmMode?: number;
    confidenceThreshold?: number;
    dpi?: number;
    preprocessImage?: boolean;
    autoDetectLanguage?: boolean;
    multiLanguageSupport?: string[];
  };
  chunkingOptions?: {
    chunkSize?: number;
    chunkOverlap?: number;
    preserveStructure?: boolean;
    respectSentenceBoundaries?: boolean;
    respectParagraphBoundaries?: boolean;
  };
  embeddingOptions?: {
    model?: string;
    batchSize?: number;
    cacheEnabled?: boolean;
    validateQuality?: boolean;
    retryAttempts?: number;
  };
}

/**
 * Document processing response interface
 */
export interface DocumentProcessingResponse {
  success: boolean;
  jobId: string;
  documentId: string;
  status: "processing" | "queued";
  estimatedTime?: number;
  message: string;
}

/**
 * Processing status response interface
 */
export interface ProcessingStatusResponse {
  success: boolean;
  data: {
    id: string;
    documentId: string;
    status: "pending" | "processing" | "completed" | "failed";
    progress: number;
    totalChunks: number;
    processedChunks: number;
    extractionMethod?: "syncfusion" | "ocr";
    errorMessage?: string;
    processingStartedAt?: string;
    processingCompletedAt?: string;
    estimatedTimeRemaining?: number;
    createdAt: string;
    updatedAt: string;
  };
}

/**
 * Text extraction request payload
 */
export interface TextExtractionRequest {
  pdfId: string;
  useOCR?: boolean;
  extractionOptions?: {
    pageRange?: { start: number; end: number };
    cleanText?: boolean;
    chunkSize?: number;
  };
}

/**
 * Text extraction response
 */
export interface TextExtractionResponse {
  success: boolean;
  text: string;
  pageCount: number;
  extractionMethod: "pdfjs" | "ocr";
  processingTime: number;
  error?: string;
}

/**
 * Question-chunk source mapping
 */
export interface QuestionChunkSource {
  id: string;
  questionId: string;
  chunkId: string;
  relevanceScore: number;
  usageType: "primary" | "supporting" | "context";
  createdAt: string;
}

/**
 * Chunk reference for quiz generation
 */
export interface ChunkReference {
  chunkId: string;
  content: string;
  pageNumber: number;
  relevanceScore: number;
  documentTitle: string;
}


// ============================================================================
// SEARCH TYPES
// ============================================================================

/**
 * Content search request for vector similarity
 */
export interface ContentSearchRequest {
  query: string;
  documentIds: string[];
  pageRange?: { start: number; end: number };
  limit?: number;
  similarityThreshold?: number;
}

/**
 * Content search response with ranked chunks
 */
export interface ContentSearchResponse {
  success: boolean;
  chunks: Array<{
    id: string;
    content: string;
    metadata: ChunkMetadata;
    similarity: number;
  }>;
  totalResults: number;
  error?: string;
}

/**
 * Hybrid search configuration options
 */
export interface HybridSearchOptions {
  vectorWeight?: number;
  keywordWeight?: number;
  similarityThreshold?: number;
  enableFuzzyMatch?: boolean;
  stemming?: boolean;
  synonymExpansion?: boolean;
  contentTypes?: ('paragraph' | 'heading' | 'list' | 'table' | 'caption')[];
  confidenceRange?: { min: number; max: number };
  relevanceRange?: { min: number; max: number };
  pageRange?: { start: number; end: number };
  documentIds?: string[];
  limit?: number;
  includeExplanations?: boolean;
  enableDebugging?: boolean;
  enableCaching?: boolean;
  cacheTimeout?: number;
}

/**
 * Search explanation for result transparency
 */
export interface SearchExplanation {
  vectorMatches: string[];
  keywordMatches: string[];
  relevanceFactors: string[];
}

/**
 * Debug information for search optimization
 */
export interface SearchDebugInfo {
  originalQuery: string;
  processedQuery: string;
  vectorEmbeddingTime: number;
  keywordProcessingTime: number;
  filteringTime: number;
  rankingTime: number;
  cacheHit: boolean;
  indexesUsed: string[];
  queryPlan?: any;
}