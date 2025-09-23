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
  logServerError
} from "@/lib/utils/server-error-handling";
import {
  checkEnhancedRateLimit,
} from "@/lib/utils/security-validation";
import {
  requireAuthentication,
} from "@/lib/utils/auth-validation";
import { processingQueue } from "@/lib/services/processing-queue";

interface DocumentProcessingRequest {
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

interface DocumentProcessingResponse {
  success: boolean;
  jobId: string;
  documentId: string;
  status: 'processing' | 'queued';
  estimatedTime?: number;
  message: string;
}

/**
 * Validates that the PDF exists and belongs to the user
 */
async function validatePDFAccess(supabaseClient: any, pdfId: string, userId: string) {
  const { data: pdf, error } = await supabaseClient
    .from("pdfs")
    .select("id, filename, storage_path, file_size")
    .eq("id", pdfId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      throw createServerError(
        ServerErrorType.NOT_FOUND,
        `PDF with ID ${pdfId} not found`,
        { operation: 'validate_pdf_access', pdfId, userId }
      );
    }
    throw createServerError(
      ServerErrorType.DATABASE_ERROR,
      `Failed to validate PDF access: ${error.message}`,
      { operation: 'validate_pdf_access', pdfId, userId },
      error
    );
  }

  return pdf;
}

/**
 * Checks if document is already processed or being processed
 */
async function checkProcessingStatus(supabaseClient: any, documentId: string, userId: string) {
  const { data: status, error } = await supabaseClient
    .from("document_processing_status")
    .select("*")
    .eq("document_id", documentId)
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    throw createServerError(
      ServerErrorType.DATABASE_ERROR,
      `Failed to check processing status: ${error.message}`,
      { operation: 'check_processing_status', documentId, userId },
      error
    );
  }

  return status;
}

/**
 * Creates or updates processing status record
 */
async function createProcessingStatus(
  supabaseClient: any, 
  documentId: string, 
  userId: string,
  extractionMethod: 'syncfusion' | 'ocr'
) {
  const { data, error } = await supabaseClient
    .from("document_processing_status")
    .upsert({
      user_id: userId,
      document_id: documentId,
      status: 'pending',
      total_chunks: 0,
      processed_chunks: 0,
      extraction_method: extractionMethod,
      processing_started_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,document_id'
    })
    .select()
    .single();

  if (error) {
    throw createServerError(
      ServerErrorType.DATABASE_ERROR,
      `Failed to create processing status: ${error.message}`,
      { operation: 'create_processing_status', documentId, userId },
      error
    );
  }

  return data;
}

/**
 * Downloads PDF from Supabase storage
 */
async function downloadPDF(supabaseClient: any, storagePath: string): Promise<Buffer> {
  const { data, error } = await supabaseClient.storage
    .from('pdfs')
    .download(storagePath);

  if (error) {
    throw createServerError(
      ServerErrorType.STORAGE_ERROR,
      `Failed to download PDF: ${error.message}`,
      { operation: 'download_pdf', storagePath },
      error
    );
  }

  return Buffer.from(await data.arrayBuffer());
}

// POST handler for document processing
async function handlePOST(request: NextRequest): Promise<NextResponse<DocumentProcessingResponse>> {
  const context = extractRequestContext(request, '/api/quiz/process-document');

  // Authentication validation
  const authContext = await requireAuthentication(request, ['write']);
  const userId = authContext.userId;

  // Rate limiting for document processing
  checkEnhancedRateLimit(userId, 'DOCUMENT_PROCESSING', { 
    ...context, 
    userId,
    limit: 10, // 10 documents per hour
    windowMs: 60 * 60 * 1000 
  });

  // Parse and validate request body
  let requestData: DocumentProcessingRequest;
  try {
    requestData = await request.json();
  } catch (error) {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      'Invalid JSON in request body',
      { ...context, userId }
    );
  }

  const { 
    pdfId, 
    useOCR = false, 
    forceReprocess = false,
    generateEmbeddings = true,
    ocrOptions = {},
    chunkingOptions = {},
    embeddingOptions = {}
  } = requestData;

  if (!pdfId) {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      'pdfId is required',
      { ...context, userId }
    );
  }

  // Get authenticated Supabase client
  const supabaseClient = await getAuthenticatedSupabaseClient();

  // Validate PDF access
  const pdf = await validatePDFAccess(supabaseClient, pdfId, userId);

  // Check if already processed (unless force reprocess)
  if (!forceReprocess) {
    const existingStatus = await checkProcessingStatus(supabaseClient, pdfId, userId);
    
    if (existingStatus) {
      if (existingStatus.status === 'completed') {
        return NextResponse.json({
          success: true,
          jobId: existingStatus.id,
          documentId: pdfId,
          status: 'processing',
          message: 'Document already processed. Use forceReprocess=true to reprocess.'
        }, { status: 200 });
      }
      
      if (existingStatus.status === 'processing') {
        return NextResponse.json({
          success: true,
          jobId: existingStatus.id,
          documentId: pdfId,
          status: 'processing',
          message: 'Document is currently being processed.'
        }, { status: 200 });
      }
    }
  }

  // Create processing status record
  const extractionMethod = useOCR ? 'ocr' : 'syncfusion';
  await createProcessingStatus(supabaseClient, pdfId, userId, extractionMethod);

  // Download PDF from storage
  const pdfBuffer = await downloadPDF(supabaseClient, pdf.storage_path);

  // Prepare processing options
  const processingOptions = {
    useOCR,
    generateEmbeddings,
    // OCR options
    language: ocrOptions.language || 'eng',
    psmMode: ocrOptions.psmMode || 3,
    confidenceThreshold: ocrOptions.confidenceThreshold || 30,
    dpi: ocrOptions.dpi || 300,
    preprocessImage: ocrOptions.preprocessImage !== false,
    autoDetectLanguage: ocrOptions.autoDetectLanguage || false,
    multiLanguageSupport: ocrOptions.multiLanguageSupport || ['eng'],
    // Chunking options
    chunkSize: chunkingOptions.chunkSize || 400,
    chunkOverlap: chunkingOptions.chunkOverlap || 50,
    preserveStructure: chunkingOptions.preserveStructure !== false,
    respectSentenceBoundaries: chunkingOptions.respectSentenceBoundaries !== false,
    respectParagraphBoundaries: chunkingOptions.respectParagraphBoundaries !== false,
    // Embedding options
    model: embeddingOptions.model || 'text-embedding-ada-002',
    batchSize: embeddingOptions.batchSize || 50,
    cacheEnabled: embeddingOptions.cacheEnabled !== false,
    validateQuality: embeddingOptions.validateQuality !== false,
    retryAttempts: embeddingOptions.retryAttempts || 3,
  };

  // Add job to processing queue
  const jobId = processingQueue.addJob(
    userId,
    pdfId,
    pdfBuffer,
    pdf.filename,
    processingOptions
  );

  // Estimate processing time based on file size
  const estimatedTime = Math.max(30, Math.min(600, Math.floor(pdf.file_size / 1024 / 1024 * 15))); // 15 seconds per MB, min 30s, max 10min

  console.log(`📄 Document processing queued for user ${userId}: ${pdf.filename} (${pdf.file_size} bytes)`);
  console.log(`   - Job ID: ${jobId}`);
  console.log(`   - Extraction method: ${extractionMethod}`);
  console.log(`   - Generate embeddings: ${generateEmbeddings}`);
  console.log(`   - Estimated time: ${estimatedTime}s`);

  const response: DocumentProcessingResponse = {
    success: true,
    jobId,
    documentId: pdfId,
    status: 'queued',
    estimatedTime,
    message: `Document processing started. Job ID: ${jobId}`
  };

  return NextResponse.json(response, { status: 202 });
}

// Export the wrapped handler
export const POST = withErrorHandling(
  handlePOST,
  { endpoint: '/api/quiz/process-document', method: 'POST' }
);