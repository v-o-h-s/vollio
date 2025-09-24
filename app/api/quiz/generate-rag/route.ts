import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  withErrorHandling,
  extractRequestContext,
  createServerError,
  ServerErrorType,
} from "@/lib/utils/server-error-handling";
import {
  checkEnhancedRateLimit,
} from "@/lib/utils/security-validation";
import {
  requireAuthentication,
} from "@/lib/utils/auth-validation";
import { 
  ragQuizGenerationService,
  type RAGQuizGenerationRequest,
  type RAGQuizGenerationResponse
} from "@/lib/services/rag-quiz-generation-service";
import type { QuizDifficulty, QuizQuestionType } from "@/lib/types";

interface GenerateRAGQuizRequest {
  documentIds: string[];
  pageRange?: { start: number; end: number };
  questionCount: number;
  difficulty: QuizDifficulty;
  questionTypes: QuizQuestionType[];
  notes?: string;
  focusAreas?: string[];
  learningObjectives?: string[];
  title?: string;
}

interface GenerateRAGQuizResponse {
  success: boolean;
  quizId: string;
  questions: Array<{
    id: string;
    questionText: string;
    questionType: QuizQuestionType;
    options?: string[];
    correctAnswer: string;
    explanation: string;
    difficulty: QuizDifficulty;
    orderIndex: number;
    sourceChunks: string[];
    sourcePages: number[];
    confidenceScore?: number;
  }>;
  metadata: {
    sourceDocumentTitles: string[];
    totalChunksSearched: number;
    averageRelevanceScore: number;
    generationTime: number;
    aiModel: string;
    embeddingModel: string;
    searchQuery: string;
    retrievalMethod: string;
  };
  sourceChunks: Array<{
    chunkId: string;
    content: string;
    pageNumber: number;
    relevanceScore: number;
    documentTitle: string;
  }>;
  generationProgress?: {
    currentStep: string;
    completedSteps: number;
    totalSteps: number;
    estimatedTimeRemaining?: number;
  };
}

/**
 * Validates RAG quiz generation request parameters
 */
function validateRAGQuizRequest(request: GenerateRAGQuizRequest): void {
  // Document IDs validation
  if (!Array.isArray(request.documentIds) || request.documentIds.length === 0) {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      'documentIds is required and must be a non-empty array'
    );
  }

  if (request.documentIds.length > 5) {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      'Maximum 5 documents can be used for quiz generation at once'
    );
  }

  // Validate document IDs format (should be UUIDs)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  for (const docId of request.documentIds) {
    if (!uuidRegex.test(docId)) {
      throw createServerError(
        ServerErrorType.VALIDATION_ERROR,
        `Invalid document ID format: ${docId}`
      );
    }
  }

  // Question count validation
  if (!request.questionCount || request.questionCount < 1 || request.questionCount > 50) {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      'questionCount must be between 1 and 50'
    );
  }

  // Difficulty validation
  const validDifficulties: QuizDifficulty[] = ['easy', 'medium', 'hard'];
  if (!validDifficulties.includes(request.difficulty)) {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      `difficulty must be one of: ${validDifficulties.join(', ')}`
    );
  }

  // Question types validation
  const validQuestionTypes: QuizQuestionType[] = ['mcq', 'truefalse', 'fillblank'];
  if (!Array.isArray(request.questionTypes) || request.questionTypes.length === 0) {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      'questionTypes is required and must be a non-empty array'
    );
  }

  for (const type of request.questionTypes) {
    if (!validQuestionTypes.includes(type)) {
      throw createServerError(
        ServerErrorType.VALIDATION_ERROR,
        `Invalid question type: ${type}. Valid types are: ${validQuestionTypes.join(', ')}`
      );
    }
  }

  // Page range validation
  if (request.pageRange) {
    if (!request.pageRange.start || !request.pageRange.end || 
        request.pageRange.start < 1 || request.pageRange.end < request.pageRange.start) {
      throw createServerError(
        ServerErrorType.VALIDATION_ERROR,
        'pageRange must have valid start and end values (start >= 1, end >= start)'
      );
    }

    if (request.pageRange.end - request.pageRange.start > 100) {
      throw createServerError(
        ServerErrorType.VALIDATION_ERROR,
        'Page range cannot exceed 100 pages'
      );
    }
  }

  // Notes validation
  if (request.notes && request.notes.length > 2000) {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      'Notes cannot exceed 2000 characters'
    );
  }

  // Focus areas validation
  if (request.focusAreas && request.focusAreas.length > 10) {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      'Maximum 10 focus areas allowed'
    );
  }

  // Learning objectives validation
  if (request.learningObjectives && request.learningObjectives.length > 10) {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      'Maximum 10 learning objectives allowed'
    );
  }

  // Title validation
  if (request.title && request.title.length > 200) {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      'Title cannot exceed 200 characters'
    );
  }
}

/**
 * Validates that all documents are processed and ready for quiz generation
 */
async function validateDocumentsProcessed(documentIds: string[]): Promise<void> {
  const { getAuthenticatedSupabaseClient } = await import("@/lib/supabaseClient");
  const client = await getAuthenticatedSupabaseClient();
  
  console.log(`📋 Validating ${documentIds.length} documents are processed for quiz generation`);
  
  // Check document processing status
  const { data: statusData, error: statusError } = await client
    .from('document_processing_status')
    .select('document_id, status, total_chunks')
    .in('document_id', documentIds);

  if (statusError) {
    throw createServerError(
      ServerErrorType.DATABASE_ERROR,
      `Failed to check document processing status: ${statusError.message}`
    );
  }

  // Validate each document
  const unprocessedDocs: string[] = [];
  const processingDocs: string[] = [];
  
  for (const docId of documentIds) {
    const status = statusData?.find(s => s.document_id === docId);
    
    if (!status) {
      unprocessedDocs.push(docId);
    } else if (status.status === 'processing' || status.status === 'pending') {
      processingDocs.push(docId);
    } else if (status.status === 'failed') {
      throw createServerError(
        ServerErrorType.PROCESSING_ERROR,
        `Document ${docId} processing failed. Please reprocess the document before generating a quiz.`
      );
    } else if (status.status === 'completed' && (!status.total_chunks || status.total_chunks === 0)) {
      throw createServerError(
        ServerErrorType.PROCESSING_ERROR,
        `Document ${docId} has no content chunks. Please reprocess the document.`
      );
    }
  }

  if (unprocessedDocs.length > 0) {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      `Documents not processed: ${unprocessedDocs.join(', ')}. Please process documents before generating a quiz.`
    );
  }

  if (processingDocs.length > 0) {
    throw createServerError(
      ServerErrorType.PROCESSING_ERROR,
      `Documents still processing: ${processingDocs.join(', ')}. Please wait for processing to complete.`
    );
  }

  console.log(`✅ All ${documentIds.length} documents are processed and ready for quiz generation`);
}

/**
 * Estimates quiz generation time based on parameters
 */
function estimateGenerationTime(request: GenerateRAGQuizRequest): number {
  const baseTimePerQuestion = 15; // 15 seconds per question
  const documentMultiplier = Math.min(request.documentIds.length * 0.2, 1.0);
  const complexityMultiplier = {
    'easy': 0.8,
    'medium': 1.0,
    'hard': 1.3
  }[request.difficulty];

  const estimatedSeconds = Math.ceil(
    request.questionCount * baseTimePerQuestion * (1 + documentMultiplier) * complexityMultiplier
  );

  return Math.min(estimatedSeconds, 600); // Cap at 10 minutes
}

// POST handler for RAG quiz generation
async function handlePOST(request: NextRequest): Promise<NextResponse<GenerateRAGQuizResponse>> {
  const context = extractRequestContext(request, '/api/quiz/generate-rag');

  // Authentication validation
  const authContext = await requireAuthentication(request, ['write']);
  const userId = authContext.userId;

  // Rate limiting for quiz generation (more restrictive due to AI API costs)
  checkEnhancedRateLimit(userId, 'QUIZ_GENERATION', { 
    ...context, 
    userId,
    limit: 20, // 20 quiz generations per hour
    windowMs: 60 * 60 * 1000 
  });

  // Parse and validate request body
  let requestData: GenerateRAGQuizRequest;
  try {
    requestData = await request.json();
  } catch (error) {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      'Invalid JSON in request body',
      { ...context, userId }
    );
  }

  // Validate request parameters
  validateRAGQuizRequest(requestData);

  // Validate that documents are processed
  await validateDocumentsProcessed(requestData.documentIds);

  // Estimate generation time
  const estimatedTime = estimateGenerationTime(requestData);

  console.log(`🧠 Starting RAG quiz generation for user ${userId}:`);
  console.log(`   - Documents: ${requestData.documentIds.length}`);
  console.log(`   - Questions: ${requestData.questionCount}`);
  console.log(`   - Difficulty: ${requestData.difficulty}`);
  console.log(`   - Types: ${requestData.questionTypes.join(', ')}`);
  console.log(`   - Estimated time: ${estimatedTime}s`);

  try {
    // Get RAG quiz generation service instance
    const ragService = ragQuizGenerationService.getInstance();

    // Track generation progress (simplified for this implementation)
    const progressSteps = [
      'Constructing search query',
      'Performing semantic search',
      'Synthesizing content',
      'Generating questions',
      'Validating quality',
      'Storing results'
    ];
    
    let currentStep = 0;
    const updateProgress = (step: string) => {
      currentStep++;
      console.log(`   📊 Progress: ${currentStep}/${progressSteps.length} - ${step}`);
    };

    // Prepare request for service
    const serviceRequest: RAGQuizGenerationRequest = {
      documentIds: requestData.documentIds,
      pageRange: requestData.pageRange,
      questionCount: requestData.questionCount,
      difficulty: requestData.difficulty,
      questionTypes: requestData.questionTypes,
      notes: requestData.notes,
      focusAreas: requestData.focusAreas,
      learningObjectives: requestData.learningObjectives,
      title: requestData.title
    };

    // Generate RAG quiz
    const generationResult = await ragService.generateRAGQuiz(serviceRequest);

    if (!generationResult.success) {
      throw createServerError(
        ServerErrorType.PROCESSING_ERROR,
        generationResult.error || 'Quiz generation failed',
        { ...context, userId, requestData }
      );
    }

    // Transform response for API
    const response: GenerateRAGQuizResponse = {
      success: true,
      quizId: generationResult.quizId,
      questions: generationResult.questions.map(q => ({
        id: q.id,
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        difficulty: q.difficulty,
        orderIndex: q.orderIndex,
        sourceChunks: q.sourceChunks,
        sourcePages: q.sourcePages,
        confidenceScore: q.confidenceScore
      })),
      metadata: {
        sourceDocumentTitles: generationResult.metadata.sourceDocumentTitles,
        totalChunksSearched: generationResult.metadata.totalChunksSearched,
        averageRelevanceScore: generationResult.metadata.averageRelevanceScore,
        generationTime: generationResult.metadata.generationTime,
        aiModel: generationResult.metadata.aiModel,
        embeddingModel: generationResult.metadata.embeddingModel,
        searchQuery: generationResult.metadata.searchQuery,
        retrievalMethod: generationResult.metadata.retrievalMethod
      },
      sourceChunks: generationResult.sourceChunks
    };

    console.log(`✅ RAG quiz generation completed for user ${userId}:`);
    console.log(`   - Quiz ID: ${generationResult.quizId}`);
    console.log(`   - Questions generated: ${generationResult.questions.length}`);
    console.log(`   - Generation time: ${generationResult.metadata.generationTime}ms`);
    console.log(`   - Average relevance: ${generationResult.metadata.averageRelevanceScore.toFixed(3)}`);

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes('ServerError')) {
      throw error;
    }
    
    // Handle specific AI API errors
    if (error instanceof Error) {
      if (error.message.includes('API key') || error.message.includes('authentication')) {
        throw createServerError(
          ServerErrorType.EXTERNAL_SERVICE_ERROR,
          'AI service configuration error. Please contact support.',
          { ...context, userId, requestData }
        );
      }
      
      if (error.message.includes('rate limit') || error.message.includes('quota') || error.message.includes('429')) {
        throw createServerError(
          ServerErrorType.RATE_LIMIT_ERROR,
          'AI service rate limit exceeded. Please try again in a few minutes.',
          { ...context, userId, requestData }
        );
      }
      
      if (error.message.includes('timeout') || error.message.includes('AbortError')) {
        throw createServerError(
          ServerErrorType.EXTERNAL_SERVICE_ERROR,
          'Quiz generation timed out. Please try with fewer questions or simpler parameters.',
          { ...context, userId, requestData }
        );
      }

      if (error.message.includes('content_filter') || error.message.includes('safety')) {
        throw createServerError(
          ServerErrorType.VALIDATION_ERROR,
          'Content was filtered by AI safety systems. Please try with different source material.',
          { ...context, userId, requestData }
        );
      }

      if (error.message.includes('model_overloaded') || error.message.includes('503')) {
        throw createServerError(
          ServerErrorType.EXTERNAL_SERVICE_ERROR,
          'AI service is temporarily overloaded. Please try again in a few minutes.',
          { ...context, userId, requestData }
        );
      }
    }
    
    throw createServerError(
      ServerErrorType.PROCESSING_ERROR,
      `RAG quiz generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { ...context, userId, requestData },
      error instanceof Error ? error : undefined
    );
  }
}

// Export the wrapped handler
export const POST = withErrorHandling(
  handlePOST,
  { endpoint: '/api/quiz/generate-rag', method: 'POST' }
);