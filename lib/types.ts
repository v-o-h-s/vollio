/**
 * Core types for PDF annotation system
 */

import { JSONContent } from "@tiptap/core";
import type { Editor } from "@tiptap/react";
import { ActivityType } from "./types/database";

// ============================================================================
// PDF ANNOTATION TYPES
// ============================================================================

/**
 * Text bounds interface for PDF annotations and highlights
 * Used for both individual text fragments and coordinate arrays
 */
export interface TextBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Highlight data structure matching the database schema
 */
export interface Highlight {
  id: string;
  user_id: string;
  pdfId: string;
  noteId: string | null;
  content: string;
  title: string | null;
  color: string;
  opacity: number;
  pageNumber: number;
  textbounds: TextBounds[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// EDITOR TYPES
// ============================================================================

/**
 * Text bounds interface for PDF annotations and highlights
 * Used for both individual text fragments and coordinate arrays
 */
export interface TextBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Highlight data structure matching the database schema
 */
export interface Highlight {
  id: string;
  user_id: string;
  pdfId: string;
  noteId: string | null;
  content: string;
  title: string | null;
  color: string;
  opacity: number;
  pageNumber: number;
  textbounds: TextBounds[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// EDITOR TYPES
// ============================================================================

/**
 * Editor mode for different viewing experiences
 */
export type EditorMode = "normal" | "fullscreen" | "focus";

/**
 * Re-export JSONContent from TipTap for convenience
 */
export type { JSONContent };

/**
 * Props for the main NotionEditor component
 */
export interface NoteContent {
  title: string;
  content?: JSONContent | null;
}
export interface NotionEditorProps {
  content?: NoteContent;
  onChange?: (content: JSONContent) => void;
  onUpdate?: (editor: Editor) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
  autoFocus?: boolean;
  customToolbar?: (editor: Editor) => React.ReactNode;

  showWordCount?: boolean;
  showReadingTime?: boolean;
  // Auto-save props
  autoSave?: boolean;
  noteId?: string;
  autoSaveDelay?: number;
  onAutoSaveStatusChange?: (status: {
    status: "idle" | "typing" | "saving" | "saved" | "error";
    lastSaved: Date | null;
    error: string | null;
  }) => void;
  onNoteCreated?: (noteId: string) => void;
}

/**
 * Props for editor toolbar components
 */
export interface EditorToolbarProps {
  editor: Editor | null;
  className?: string;
}

/**
 * Configuration for editor commands (buttons, shortcuts, etc.)
 */
export interface EditorCommand {
  name: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: (editor: Editor) => void;
  isActive?: (editor: Editor) => boolean;
  isDisabled?: (editor: Editor) => boolean;
}

/**
 * Configuration for TipTap extensions
 */
export interface EditorExtensionConfig {
  heading?: {
    levels: number[];
  };
  table?: {
    resizable: boolean;
    handleWidth: number;
  };
  image?: {
    inline: boolean;
    allowBase64: boolean;
  };
}

/**
 * Editor state for context management
 */
export interface EditorState {
  editor: Editor | null;
  content: JSONContent | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Editor context value with state and actions
 */
export interface EditorContextValue extends EditorState {
  setEditor: (editor: Editor | null) => void;
  updateContent: (content: JSONContent) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  resetEditor: () => void;
}

// ============================================================================
// PDF ANNOTATION TYPES
// ============================================================================

/**
 * Rectangle coordinates for PDF annotations
 */
export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Text selection data from PDF viewer
 */
export interface TextSelection {
  text: string;
  pageNumber: number;
  coordinates: Rectangle;
  pdfId: string;
}

/**
 * PDF annotation with coordinates and note content
 */
export interface Annotation {
  id: string;
  userId: string;
  pdfId: string;
  pageNumber: number;
  selectedText: string;
  content: string;
  coordinates: Rectangle;
  createdAt: string; // ISO string for Redux serialization
  updatedAt: string; // ISO string for Redux serialization
}

/**
 * Note entity with rich text content
 */
export interface Note {
  id: string;
  userId: string;
  title: string;
  content: JSONContent; // TipTap JSONContent format
  pdfAnnotationId?: string | null;
  createdAt: string; // ISO string for Redux serialization
  updatedAt: string; // ISO string for Redux serialization
  isDeleted: boolean;
}

/**
 * PDF document metadata and storage information
 */
export interface PDFDocument {
  id: string;
  userId: string;
  filename: string;
  fileSize: number;
  storagePath: string;
  mimeType: string;
  uploadedAt: string; // ISO string for Redux serialization
  updatedAt: string; // ISO string for Redux serialization
  fileUrl?: string; // Signed URL for frontend use
}

/**
 * User activity tracking for PDF interactions
 */
export interface UserActivity {
  id: string;
  userId: string;
  pdfId: string;
  activityType: "view" | "upload" | "delete";
  accessedAt: string; // ISO string for Redux serialization
}

/**
 * File upload progress tracking
 */
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// ============================================================================
// DATABASE TYPES
// ============================================================================

/**
 * Re-export database types from Supabase schema
 */
export type {
  Database,
  PDFRow,
  PDFInsert,
  PDFUpdate,
  UserActivityRow,
  UserActivityInsert,
  UserActivityUpdate,
  AnnotationRow,
  AnnotationInsert,
  AnnotationUpdate,
  ActivityType,
} from "./types/database";

/**
 * Re-export error types
 */
export * from "./types/errors";

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Generic API response wrapper
 */
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * PDF upload API response
 */
export interface UploadResponse {
  success: boolean;
  data?: {
    id: string;
    filename: string;
    fileSize: number;
    uploadedAt: string;
    fileUrl: string; // Signed URL for viewing
  };
  error?: string;
}

/**
 * PDF list API response
 */
export interface PDFListResponse {
  success: boolean;
  data?: {
    pdfs: Array<{
      id: string;
      filename: string;
      fileSize: number;
      uploadedAt: string;
      fileUrl: string; // Signed URL
    }>;
    recentActivity?: {
      pdfId: string;
      filename: string;
      accessedAt: string;
      fileUrl: string;
    };
  };
  error?: string;
}

/**
 * PDF access API response
 */
export interface PDFAccessResponse {
  success: boolean;
  data?: {
    id: string;
    filename: string;
    fileUrl: string; // Fresh signed URL
    fileSize: number;
  };
  error?: string;
}

/**
 * File validation result
 */
export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Storage upload operation result
 */
export interface StorageUploadResult {
  path: string;
  fullPath: string;
  id: string;
}

/**
 * Database insert operation result
 */
export interface DatabaseInsertResult {
  id: string;
  created: boolean;
}

/**
 * Signed URL generation result
 */
export interface SignedUrlResult {
  url: string;
  expiresAt: Date;
}

// ============================================================================
// SUPABASE CLIENT TYPES
// ============================================================================

/**
 * Authenticated Supabase client result
 */
export interface AuthenticatedClientResult {
  client: any; // SupabaseClient<Database> - avoiding circular import
  userId: string;
}

/**
 * Client authentication state
 */
export interface ClientAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null;
  error: string | null;
}

/**
 * Database operation result wrapper
 */
export interface DatabaseOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
}

/**
 * Storage operation result wrapper
 */
export interface StorageOperationResult {
  success: boolean;
  path?: string;
  url?: string;
  error?: string;
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data?: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  error?: string;
}

/**
 * Bulk operation response with individual results
 */
export interface BulkOperationResponse<T> {
  success: boolean;
  results?: Array<{
    id: string;
    success: boolean;
    data?: T;
    error?: string;
  }>;
  summary?: {
    total: number;
    successful: number;
    failed: number;
  };
  error?: string;
}

// ============================================================================
// SUPABASE API RESPONSE TYPES
// ============================================================================

/**
 * Supabase PDF upload response
 */
export interface SupabaseUploadResponse {
  success: boolean;
  data?: {
    id: string;
    filename: string;
    fileSize: number;
    uploadedAt: string;
    fileUrl: string;
    storagePath: string;
  };
  error?: string;
}

/**
 * Supabase PDF list response
 */
export interface SupabasePDFListResponse {
  success: boolean;
  data?: {
    pdfs: Array<{
      id: string;
      filename: string;
      fileSize: number;
      uploadedAt: string;
      fileUrl: string;
      mimeType: string;
    }>;
    recentActivity?: {
      pdfId: string;
      filename: string;
      accessedAt: string;
      fileUrl: string;
      activityType: ActivityType;
    };
    totalCount: number;
  };
  error?: string;
}

/**
 * Supabase PDF access response
 */
export interface SupabasePDFAccessResponse {
  success: boolean;
  data?: {
    id: string;
    filename: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: string;
  };
  error?: string;
}

/**
 * Supabase activity tracking response
 */
export interface SupabaseActivityResponse {
  success: boolean;
  data?: {
    activities: Array<{
      id: string;
      pdfId: string;
      activityType: ActivityType;
      accessedAt: string;
      pdf?: {
        filename: string;
        fileUrl: string;
      };
    }>;
    summary: {
      totalViews: number;
      totalUploads: number;
      totalDeletes: number;
      lastActivity: string | null;
    };
  };
  error?: string;
}

/**
 * Supabase notes list response
 */
export interface SupabaseNotesResponse {
  success: boolean;
  data?: Note[];
  error?: string;
}

/**
 * Supabase single note response
 */
export interface SupabaseNoteResponse {
  success: boolean;
  data?: Note;
  error?: string;
}

/**
 * Create note request payload
 */
export interface CreateNoteRequest {
  title?: string;
  content: JSONContent;
  pdfAnnotationId?: string;
}

/**
 * Update note request payload
 */
export interface UpdateNoteRequest {
  title?: string;
  content?: JSONContent;
}

// ============================================================================
// AUTHENTICATION TYPES
// ============================================================================

/**
 * Authentication operation result
 */
export interface AuthenticationResult {
  success: boolean;
  userId?: string;
  token?: string;
  error?: string;
}

/**
 * JWT token validation result
 */
export interface TokenValidationResult {
  valid: boolean;
  userId?: string;
  expiresAt?: Date;
  error?: string;
}

// ============================================================================
// DASHBOARD TYPES
// ============================================================================

/**
 * Dashboard data aggregation
 */
export interface DashboardData {
  pdfs: PDFDocument[];
  recentActivity: UserActivity | null;
  totalFiles: number;
  totalSize: number;
}

/**
 * Dashboard component state
 */
export interface DashboardState {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null; // ISO string for Redux serialization
}

// ============================================================================
// UPLOAD TYPES
// ============================================================================

/**
 * File upload component state
 */
export interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  uploadedFile: PDFDocument | null;
}

/**
 * Upload operation configuration
 */
export interface UploadOptions {
  onProgress?: (progress: UploadProgress) => void;
  onSuccess?: (pdf: PDFDocument) => void;
  onError?: (error: string) => void;
}

// ============================================================================
// ACTIVITY TRACKING TYPES
// ============================================================================

/**
 * Activity tracking configuration
 */
export interface ActivityTrackingOptions {
  trackView?: boolean;
  trackUpload?: boolean;
  trackDelete?: boolean;
}

/**
 * User activity summary statistics
 */
export interface ActivitySummary {
  totalViews: number;
  totalUploads: number;
  totalDeletes: number;
  lastActivity: string | null; // ISO string for Redux serialization
  mostViewedPdf: {
    id: string;
    filename: string;
    viewCount: number;
  } | null;
}
// ============================================================================
// QUIZ TYPES
// ============================================================================

/**
 * Quiz difficulty levels
 */
export type QuizDifficulty = "easy" | "medium" | "hard";

/**
 * Quiz question types (enhanced)
 */
export type QuizQuestionType = "mcq" | "truefalse" | "fillblank";

/**
 * RAG quiz metadata for additional information
 */
export interface RAGQuizMetadata {
  sourceDocumentTitles: string[];
  totalChunksSearched: number;
  averageRelevanceScore: number;
  generationTime: number;
  aiModel: string;
  embeddingModel: string;
  searchQuery: string;
  retrievalMethod: "vector_similarity" | "hybrid";
}

/**
 * Legacy quiz metadata (for backward compatibility)
 */
export interface QuizMetadata {
  sourceDocumentTitles: string[];
  extractionMethod: "pdfjs" | "ocr";
  generationTime: number;
  aiModel: string;
  totalTextLength?: number;
  averageQuestionComplexity?: number;
}

/**
 * Main quiz entity (enhanced for RAG)
 */
export interface Quiz {
  id: string;
  userId: string;
  title: string;
  sourceDocumentIds: string[]; // Changed from sourcePdfIds for clarity
  pageRange?: { start: number; end: number };
  questionCount: number;
  difficulty: QuizDifficulty;
  questionTypes: QuizQuestionType[];
  notes?: string; // User-provided context and instructions for quiz generation
  focusAreas?: string[];
  learningObjectives?: string[];
  generationMethod: "rag" | "simple";
  metadata: RAGQuizMetadata;
  createdAt: string; // ISO string for Redux serialization
  updatedAt: string; // ISO string for Redux serialization
}

/**
 * Individual quiz question (enhanced for RAG)
 */
export interface QuizQuestion {
  id: string;
  quizId: string;
  questionText: string;
  questionType: QuizQuestionType;
  options?: string[]; // For MCQ questions (4 options)
  correctAnswer: string;
  explanation: string;
  difficulty: QuizDifficulty;
  orderIndex: number;
  sourceChunks: string[]; // References to document chunks used
  sourcePages: number[]; // Page numbers where content was sourced
  confidenceScore?: number; // AI confidence in question quality (0.00-1.00)
  createdAt: string; // ISO string for Redux serialization
}

/**
 * Quiz attempt/result record
 */
export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  answers: Record<string, string>; // questionId -> selectedAnswer
  score: number; // Percentage (0-100)
  totalQuestions: number;
  timeTaken?: number; // in seconds
  completedAt: string; // ISO string for Redux serialization
}

/**
 * Document chunk for vector storage and retrieval
 */
export interface DocumentChunk {
  id: string;
  userId: string;
  documentId: string;
  chunkIndex: number;
  content: string;
  embedding: number[];
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
  extractionMethod: "pdfjs" | "ocr";
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
  extractionMethod?: "pdfjs" | "ocr";
  errorMessage?: string;
  processingStartedAt?: string;
  processingCompletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * RAG quiz generation request payload
 */
export interface RAGQuizGenerationRequest {
  documentIds: string[];
  pageRange?: { start: number; end: number };
  questionCount: number;
  difficulty: QuizDifficulty;
  questionTypes: QuizQuestionType[];
  notes?: string;
  focusAreas?: string[];
  learningObjectives?: string[];
}

/**
 * Legacy quiz generation request (for backward compatibility)
 */
export interface QuizGenerationRequest {
  text: string;
  questionCount: number;
  difficulty: QuizDifficulty;
  questionTypes: QuizQuestionType[];
  sourceDocuments: string[];
  title?: string;
  notes?: string; // Additional context and instructions from user
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
 * Quiz generation response
 */
export interface QuizGenerationResponse {
  success: boolean;
  quizId: string;
  questions: QuizQuestion[];
  metadata: QuizMetadata;
  error?: string;
}

/**
 * Quiz attempt submission request
 */
export interface QuizAttemptRequest {
  quizId: string;
  answers: Record<string, string>;
  timeTaken?: number;
}

/**
 * Quiz attempt submission response
 */
export interface QuizAttemptResponse {
  success: boolean;
  attemptId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  results: Array<{
    questionId: string;
    correct: boolean;
    userAnswer: string;
    correctAnswer: string;
    explanation: string;
  }>;
  error?: string;
}

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
 * Document processing request
 */
export interface DocumentProcessingRequest {
  pdfId: string;
  useOCR?: boolean;
  forceReprocess?: boolean;
}

/**
 * Document processing response
 */
export interface DocumentProcessingResponse {
  success: boolean;
  documentId: string;
  totalChunks: number;
  processingTime: number;
  extractionMethod: "pdfjs" | "ocr";
  status: "processing" | "completed" | "failed";
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

/**
 * Quiz configuration for generation (enhanced)
 */
export interface QuizConfiguration {
  questionCount: number;
  difficulty: QuizDifficulty;
  questionTypes: QuizQuestionType[];
  pageRange?: { start: number; end: number };
  notes?: string; // User-provided context and instructions
  focusAreas?: string[];
  learningObjectives?: string[];
  includeDiagrams?: boolean;
  excludeTopics?: string[];
}

/**
 * Quiz statistics and analytics
 */
export interface QuizStatistics {
  totalQuizzes: number;
  totalAttempts: number;
  averageScore: number;
  bestScore: number;
  mostRecentAttempt: string | null;
  difficultyBreakdown: Record<QuizDifficulty, number>;
  questionTypeBreakdown: Record<QuizQuestionType, number>;
}

/**
 * Quiz list response with pagination
 */
export interface QuizListResponse {
  success: boolean;
  data?: {
    quizzes: Quiz[];
    totalCount: number;
    statistics: QuizStatistics;
  };
  error?: string;
}

/**
 * Quiz details response with questions
 */
export interface QuizDetailsResponse {
  success: boolean;
  data?: {
    quiz: Quiz;
    questions: QuizQuestion[];
    attempts: QuizAttempt[];
    statistics: {
      totalAttempts: number;
      averageScore: number;
      bestScore: number;
      lastAttempt: string | null;
    };
  };
  error?: string;
}

/**
 * Quiz history response
 */
export interface QuizHistoryResponse {
  success: boolean;
  data?: {
    attempts: Array<
      QuizAttempt & {
        quiz: {
          title: string;
          difficulty: QuizDifficulty;
          questionCount: number;
        };
      }
    >;
    summary: {
      totalAttempts: number;
      averageScore: number;
      improvementTrend: "improving" | "declining" | "stable";
    };
  };
  error?: string;
}

// ============================================================================
// THEME TYPES
// ============================================================================

/**
 * Re-export theme types for convenience
 */
export type {
  ThemeMode,
  ThemeContextValue,
  ThemeProviderProps,
  ThemeState,
} from "./types/theme";
