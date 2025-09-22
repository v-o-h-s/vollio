// Core document processing types
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

export interface ChunkMetadata {
  documentTitle: string;
  extractionMethod: 'pdfjs' | 'ocr';
  processingVersion: string;
  contentType: 'paragraph' | 'heading' | 'list' | 'table' | 'caption';
  confidence?: number;
  structuralElements?: string[];
  hasOverlap?: boolean;
  chunkIndex?: number;
}

export interface DocumentProcessingStatus {
  id: string;
  userId: string;
  documentId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalChunks: number;
  processedChunks: number;
  extractionMethod?: 'pdfjs' | 'ocr';
  errorMessage?: string;
  processingStartedAt?: string;
  processingCompletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Processing options and configuration
export interface ProcessingOptions {
  // OCR options
  useOCR?: boolean;
  forceReprocess?: boolean;
  language?: string;
  psmMode?: number;
  oem?: number;
  confidenceThreshold?: number;
  dpi?: number;
  preprocessImage?: boolean;
  
  // Chunking options
  chunkSize?: number;
  chunkOverlap?: number;
  preserveStructure?: boolean;
  respectSentenceBoundaries?: boolean;
  respectParagraphBoundaries?: boolean;
}

export interface ProcessingResult {
  success: boolean;
  chunks: DocumentChunk[];
  extractionMethod: 'pdfjs' | 'ocr';
  processingTime: number;
  totalPages: number;
  error?: string;
  metadata?: ProcessingMetadata;
}

export interface ProcessingMetadata {
  totalTokens: number;
  averageChunkSize: number;
  overlapRatio: number;
  averageConfidence?: number;
  languageDetected?: string;
  contentTypes: Record<string, number>;
}

// OCR-specific types
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

// Chunking-specific types
export interface ChunkingOptions {
  chunkSize?: number;
  chunkOverlap?: number;
  preserveStructure?: boolean;
  respectSentenceBoundaries?: boolean;
  respectParagraphBoundaries?: boolean;
}

export interface TextChunk {
  id: string;
  content: string;
  startIndex: number;
  endIndex: number;
  tokenCount: number;
  metadata: {
    chunkIndex: number;
    hasOverlap: boolean;
    contentType: 'paragraph' | 'heading' | 'list' | 'table' | 'caption';
    structuralElements: string[];
  };
}

export interface ChunkingResult {
  chunks: TextChunk[];
  totalTokens: number;
  averageChunkSize: number;
  overlapRatio: number;
}

// Queue and job management types
export interface ProcessingJob {
  id: string;
  userId: string;
  documentId: string;
  pdfBuffer: Buffer;
  documentTitle: string;
  options: ProcessingOptions;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  result?: ProcessingResult;
}

export interface QueueStats {
  totalJobs: number;
  pendingJobs: number;
  processingJobs: number;
  completedJobs: number;
  failedJobs: number;
  averageProcessingTime: number;
}

// API request/response types
export interface DocumentProcessingRequest {
  pdfId: string;
  useOCR?: boolean;
  forceReprocess?: boolean;
  options?: ProcessingOptions;
}

export interface DocumentProcessingResponse {
  success: boolean;
  jobId?: string;
  documentId: string;
  totalChunks?: number;
  processingTime?: number;
  extractionMethod?: 'pdfjs' | 'ocr';
  status: 'processing' | 'completed' | 'failed';
  error?: string;
}

export interface ProcessingStatusRequest {
  jobId: string;
}

export interface ProcessingStatusResponse {
  success: boolean;
  job?: ProcessingJob;
  error?: string;
}

// Database schema types for Supabase
export interface DocumentChunkRow {
  id: string;
  user_id: string;
  document_id: string;
  chunk_index: number;
  content: string;
  embedding: number[] | null;
  token_count: number;
  page_number: number;
  section_title: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DocumentProcessingStatusRow {
  id: string;
  user_id: string;
  document_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total_chunks: number;
  processed_chunks: number;
  extraction_method: 'pdfjs' | 'ocr' | null;
  error_message: string | null;
  processing_started_at: string | null;
  processing_completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// Utility types
export type ExtractionMethod = 'pdfjs' | 'ocr';
export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type ContentType = 'paragraph' | 'heading' | 'list' | 'table' | 'caption';

// Error types
export class DocumentProcessingError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'DocumentProcessingError';
  }
}

export class OCRError extends DocumentProcessingError {
  constructor(message: string, details?: any) {
    super(message, 'OCR_ERROR', details);
    this.name = 'OCRError';
  }
}

export class ChunkingError extends DocumentProcessingError {
  constructor(message: string, details?: any) {
    super(message, 'CHUNKING_ERROR', details);
    this.name = 'ChunkingError';
  }
}

export class QueueError extends DocumentProcessingError {
  constructor(message: string, details?: any) {
    super(message, 'QUEUE_ERROR', details);
    this.name = 'QueueError';
  }
}