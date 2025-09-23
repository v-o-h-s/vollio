import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getAuthenticatedSupabaseClient,
} from "@/lib/supabaseClient";
import {
  withErrorHandling,
  extractRequestContext,
  createServerError,
  ServerErrorType,
} from "@/lib/utils/server-error-handling";
import {
  requireAuthentication,
} from "@/lib/utils/auth-validation";
import { processingQueue } from "@/lib/services/processing-queue";

interface ProcessingStatusResponse {
  success: boolean;
  data: {
    id: string;
    documentId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    totalChunks: number;
    processedChunks: number;
    extractionMethod?: 'syncfusion' | 'ocr';
    errorMessage?: string;
    processingStartedAt?: string;
    processingCompletedAt?: string;
    estimatedTimeRemaining?: number;
    createdAt: string;
    updatedAt: string;
  };
}

/**
 * Gets processing status from database
 */
async function getProcessingStatusFromDB(
  supabaseClient: any, 
  statusId: string, 
  userId: string
) {
  const { data: status, error } = await supabaseClient
    .from("document_processing_status")
    .select(`
      *,
      pdfs (
        id,
        filename,
        file_size
      )
    `)
    .eq("id", statusId)
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      throw createServerError(
        ServerErrorType.NOT_FOUND,
        `Processing status with ID ${statusId} not found`,
        { operation: 'get_processing_status', statusId, userId }
      );
    }
    throw createServerError(
      ServerErrorType.DATABASE_ERROR,
      `Failed to get processing status: ${error.message}`,
      { operation: 'get_processing_status', statusId, userId },
      error
    );
  }

  return status;
}

/**
 * Gets real-time processing status from queue
 */
function getQueueStatus(jobId: string) {
  const job = processingQueue.getJob(jobId);
  if (!job) return null;

  return {
    status: job.status,
    progress: job.progress,
    error: job.error,
    startedAt: job.startedAt,
    completedAt: job.completedAt,
  };
}

/**
 * Estimates time remaining based on progress and elapsed time
 */
function estimateTimeRemaining(
  progress: number, 
  startedAt?: Date, 
  fileSize?: number
): number | undefined {
  if (!startedAt || progress <= 0) return undefined;

  const elapsedMs = Date.now() - startedAt.getTime();
  const elapsedSeconds = elapsedMs / 1000;
  
  if (progress >= 100) return 0;
  
  // Estimate based on progress
  const estimatedTotalTime = (elapsedSeconds / progress) * 100;
  const remainingTime = Math.max(0, estimatedTotalTime - elapsedSeconds);
  
  // Cap at reasonable limits
  return Math.min(remainingTime, 600); // Max 10 minutes
}

// GET handler for processing status
async function handleGET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ProcessingStatusResponse>> {
  const context = extractRequestContext(request, '/api/quiz/processing-status/[id]');
  const statusId = params.id;

  if (!statusId) {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      'Status ID is required',
      context
    );
  }

  // Authentication validation
  const authContext = await requireAuthentication(request, ['read']);
  const userId = authContext.userId;

  // Get authenticated Supabase client
  const supabaseClient = await getAuthenticatedSupabaseClient();

  // Get processing status from database
  const dbStatus = await getProcessingStatusFromDB(supabaseClient, statusId, userId);

  // Get real-time status from queue if processing
  let queueStatus = null;
  if (dbStatus.status === 'processing') {
    queueStatus = getQueueStatus(statusId);
  }

  // Merge database and queue status
  const currentStatus = queueStatus?.status || dbStatus.status;
  const currentProgress = queueStatus?.progress ?? 
    (dbStatus.total_chunks > 0 ? (dbStatus.processed_chunks / dbStatus.total_chunks) * 100 : 0);

  // Calculate estimated time remaining
  const estimatedTimeRemaining = estimateTimeRemaining(
    currentProgress,
    dbStatus.processing_started_at ? new Date(dbStatus.processing_started_at) : undefined,
    dbStatus.pdfs?.file_size
  );

  const response: ProcessingStatusResponse = {
    success: true,
    data: {
      id: dbStatus.id,
      documentId: dbStatus.document_id,
      status: currentStatus,
      progress: Math.round(currentProgress),
      totalChunks: dbStatus.total_chunks,
      processedChunks: dbStatus.processed_chunks,
      extractionMethod: dbStatus.extraction_method,
      errorMessage: queueStatus?.error || dbStatus.error_message,
      processingStartedAt: dbStatus.processing_started_at,
      processingCompletedAt: queueStatus?.completedAt?.toISOString() || dbStatus.processing_completed_at,
      estimatedTimeRemaining,
      createdAt: dbStatus.created_at,
      updatedAt: dbStatus.updated_at,
    }
  };

  return NextResponse.json(response, { status: 200 });
}

// Export the wrapped handler
export const GET = withErrorHandling(
  handleGET,
  { endpoint: '/api/quiz/processing-status/[id]', method: 'GET' }
);