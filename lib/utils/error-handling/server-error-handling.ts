/**
 * Server-side error handling and logging utilities
 */

import { NextResponse } from "next/server";
import {
  ErrorType,
  ErrorSeverity,
  AppError,
  ErrorContext,
  ERROR_SEVERITY_MAP,
  ERROR_MESSAGES,
} from "@/lib/types/errors";

// Server-specific error context extending base ErrorContext
export interface ServerErrorContext extends ErrorContext {
  endpoint: string;
  method: string;
  userAgent?: string;
  ip?: string;
  operation?: string;
  duration?: number;
}

// Server error interface extending AppError
export interface ServerError extends AppError {
  statusCode: number;
  context?: ServerErrorContext;
  requestId?: string;
}

// API response interface
export interface APIErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
  requestId?: string;
  timestamp: string;
}

// Error type to status code mapping
const ERROR_STATUS_CODES: Record<ErrorType, number> = {
  // Authentication errors
  [ErrorType.AUTHENTICATION_ERROR]: 401,
  [ErrorType.AUTHORIZATION_ERROR]: 403,
  [ErrorType.TOKEN_EXPIRED]: 401,

  // Validation errors
  [ErrorType.VALIDATION_ERROR]: 400,
  [ErrorType.FILE_TOO_LARGE]: 413,
  [ErrorType.INVALID_FILE_TYPE]: 400,
  [ErrorType.INVALID_FILE_FORMAT]: 400,

  // Storage errors
  [ErrorType.STORAGE_ERROR]: 500,
  [ErrorType.STORAGE_QUOTA_EXCEEDED]: 507,
  [ErrorType.STORAGE_UPLOAD_FAILED]: 500,
  [ErrorType.STORAGE_ACCESS_DENIED]: 403,

  // Database errors
  [ErrorType.DATABASE_ERROR]: 500,
  [ErrorType.DATABASE_CONNECTION_ERROR]: 503,
  [ErrorType.DATABASE_CONSTRAINT_ERROR]: 409,

  // Network errors
  [ErrorType.NETWORK_ERROR]: 503,
  [ErrorType.TIMEOUT_ERROR]: 504,
  [ErrorType.CONNECTION_ERROR]: 503,

  // PDF-specific errors
  [ErrorType.PDF_LOADING_ERROR]: 422,
  [ErrorType.PDF_RENDERING_ERROR]: 422,
  [ErrorType.PDF_CORRUPTED]: 422,

  // Rate limiting and external service errors
  [ErrorType.RATE_LIMIT_ERROR]: 429,
  [ErrorType.EXTERNAL_SERVICE_ERROR]: 502,
  [ErrorType.PROCESSING_ERROR]: 500,

  // AI service specific errors
  [ErrorType.AI_SERVICE_ERROR]: 502,
  [ErrorType.AI_QUOTA_EXCEEDED]: 429,
  [ErrorType.AI_CONTENT_POLICY_VIOLATION]: 400,
  [ErrorType.AI_MODEL_UNAVAILABLE]: 503,

  // General errors
  [ErrorType.UNKNOWN_ERROR]: 500,
  [ErrorType.INTERNAL_SERVER_ERROR]: 500,
  [ErrorType.SERVICE_UNAVAILABLE]: 503,
};

/**
 * Creates a standardized server error
 */
export function createServerError(
  type: ErrorType,
  message: string,
  context?: Partial<ServerErrorContext>,
  details?: any
): ServerError {
  const requestId = generateRequestId();
  const errorMessage = ERROR_MESSAGES[type];

  return {
    type,
    message,
    severity: ERROR_SEVERITY_MAP[type],
    statusCode: ERROR_STATUS_CODES[type],
    userMessage: errorMessage.message,
    technicalMessage: message,
    retryable: isRetryableError(type),
    context: context as ServerErrorContext,
    timestamp: new Date(),
    requestId,
    details,
  };
}

/**
 * Determines if an error type is retryable
 */
function isRetryableError(type: ErrorType): boolean {
  const retryableErrors = [
    ErrorType.NETWORK_ERROR,
    ErrorType.TIMEOUT_ERROR,
    ErrorType.CONNECTION_ERROR,
    ErrorType.DATABASE_CONNECTION_ERROR,
    ErrorType.STORAGE_ERROR,
    ErrorType.INTERNAL_SERVER_ERROR,
    ErrorType.SERVICE_UNAVAILABLE,
    ErrorType.EXTERNAL_SERVICE_ERROR,
  ];

  return retryableErrors.includes(type);
}

/**
 * Maps various error types to ServerError
 */
export function mapToServerError(
  error: any,
  context?: Partial<ServerErrorContext>
): ServerError {
  // Handle Supabase errors
  if (error?.code && typeof error.code === "string") {
    return mapSupabaseErrorToServerError(error, context);
  }

  // Handle Clerk authentication errors
  if (error?.message?.includes("Unauthorized") || error?.status === 401) {
    return createServerError(
      ErrorType.AUTHENTICATION_ERROR,
      "Authentication failed",
      context,
      error
    );
  }

  // Handle validation errors
  if (
    error?.message?.includes("validation") ||
    error?.message?.includes("invalid")
  ) {
    return createServerError(
      ErrorType.VALIDATION_ERROR,
      error.message || "Validation failed",
      context,
      error
    );
  }

  // Handle file size errors
  if (
    error?.message?.includes("file size") ||
    error?.message?.includes("too large")
  ) {
    return createServerError(
      ErrorType.FILE_TOO_LARGE,
      error.message || "File too large",
      context,
      error
    );
  }

  // Handle file type errors
  if (
    error?.message?.includes("file type") ||
    error?.message?.includes("invalid type")
  ) {
    return createServerError(
      ErrorType.INVALID_FILE_TYPE,
      error.message || "Invalid file type",
      context,
      error
    );
  }

  // Handle storage errors
  if (
    error?.message?.includes("storage") ||
    error?.message?.includes("upload")
  ) {
    return createServerError(
      ErrorType.STORAGE_ERROR,
      error.message || "Storage operation failed",
      context,
      error
    );
  }

  // Handle network/timeout errors
  if (error?.code === "ECONNREFUSED" || error?.code === "ETIMEDOUT") {
    return createServerError(
      ErrorType.EXTERNAL_SERVICE_ERROR,
      "External service connection failed",
      context,
      error
    );
  }

  // Handle AI service errors
  if (error?.message?.includes("AI") || error?.message?.includes("model")) {
    return createServerError(
      ErrorType.AI_SERVICE_ERROR,
      error.message || "AI service error",
      context,
      error
    );
  }

  // Handle PDF-specific errors
  if (error?.message?.includes("PDF") || error?.message?.includes("document")) {
    return createServerError(
      ErrorType.PDF_LOADING_ERROR,
      error.message || "PDF processing error",
      context,
      error
    );
  }

  // Default to internal error
  return createServerError(
    ErrorType.INTERNAL_SERVER_ERROR,
    error?.message || "An unexpected error occurred",
    context,
    error
  );
}

/**
 * Maps Supabase errors to ServerError
 */
function mapSupabaseErrorToServerError(
  error: any,
  context?: Partial<ServerErrorContext>
): ServerError {
  const code = error.code;
  const message = error.message || "";

  switch (code) {
    case "PGRST116": // Row not found or RLS policy violation
      return createServerError(
        ErrorType.AUTHORIZATION_ERROR,
        "Access denied or resource not found",
        context,
        error
      );

    case "PGRST301": // Resource not found
      return createServerError(
        ErrorType.VALIDATION_ERROR,
        "Resource not found",
        context,
        error
      );

    case "23505": // Unique constraint violation
      return createServerError(
        ErrorType.DATABASE_CONSTRAINT_ERROR,
        "Duplicate resource",
        context,
        error
      );

    case "23503": // Foreign key constraint violation
      return createServerError(
        ErrorType.DATABASE_CONSTRAINT_ERROR,
        "Invalid reference",
        context,
        error
      );

    case "42501": // Insufficient privilege
      return createServerError(
        ErrorType.AUTHORIZATION_ERROR,
        "Insufficient permissions",
        context,
        error
      );

    default:
      if (message.includes("JWT") || message.includes("token")) {
        return createServerError(
          ErrorType.TOKEN_EXPIRED,
          "Authentication token invalid or expired",
          context,
          error
        );
      }

      if (message.includes("connection") || message.includes("network")) {
        return createServerError(
          ErrorType.DATABASE_CONNECTION_ERROR,
          "Database connection failed",
          context,
          error
        );
      }

      return createServerError(
        ErrorType.DATABASE_ERROR,
        message || "Database error occurred",
        context,
        error
      );
  }
}

/**
 * Logs server errors with appropriate level
 */
export function logServerError(error: ServerError): void {
  const logData = {
    requestId: error.requestId,
    type: error.type,
    severity: error.severity,
    statusCode: error.statusCode,
    message: error.technicalMessage || error.message,
    context: error.context,
    timestamp: error.timestamp.toISOString(),
    userId: error.context?.userId,
    details: error.details,
    retryable: error.retryable,
  };

  // Add structured logging based on severity
  switch (error.severity) {
    case ErrorSeverity.CRITICAL:
      console.error(
        "🚨 CRITICAL SERVER ERROR:",
        JSON.stringify(logData, null, 2)
      );
      // In production, this would also send to external monitoring service
      break;

    case ErrorSeverity.HIGH:
      console.error(
        "🔥 HIGH SEVERITY SERVER ERROR:",
        JSON.stringify(logData, null, 2)
      );
      break;

    case ErrorSeverity.MEDIUM:
      console.warn(
        "⚠️  MEDIUM SEVERITY SERVER ERROR:",
        JSON.stringify(logData, null, 2)
      );
      break;

    case ErrorSeverity.LOW:
      console.info(
        "ℹ️  LOW SEVERITY SERVER ERROR:",
        JSON.stringify(logData, null, 2)
      );
      break;

    default:
      console.log("📝 SERVER ERROR:", JSON.stringify(logData, null, 2));
  }

  // In production, you would also:
  // - Send to external logging service (e.g., Sentry, LogRocket, DataDog)
  // - Store in database for analytics
  // - Send alerts for critical errors
  // - Update metrics/monitoring dashboards
}

/**
 * Creates a standardized error response
 */
export function createErrorResponse(
  error: ServerError,
  includeDetails = false
): NextResponse<APIErrorResponse> {
  const response: APIErrorResponse = {
    success: false,
    error: error.userMessage,
    code: error.type,
    requestId: error.requestId,
    timestamp: error.timestamp.toISOString(),
  };

  // Include technical details in development or for debugging
  if (
    includeDetails &&
    (process.env.NODE_ENV === "development" ||
      error.severity === ErrorSeverity.LOW)
  ) {
    response.details = {
      technicalMessage: error.technicalMessage,
      context: error.context,
      retryable: error.retryable,
    };
  }

  // Log the error
  logServerError(error);

  return NextResponse.json(response, { status: error.statusCode });
}

/**
 * Generates a unique request ID for tracking
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Extracts request context from Next.js request
 */
export function extractRequestContext(
  request: Request,
  endpoint: string,
  userId?: string
): Partial<ServerErrorContext> {
  return {
    endpoint,
    method: request.method,
    userId,
    userAgent: request.headers.get("user-agent") || undefined,
    // Note: Getting real IP in Next.js requires additional setup with reverse proxy headers
    ip:
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      undefined,
  };
}

/**
 * Middleware for handling errors in API routes
 */
export function withErrorHandling<T extends any[], R>(
  handler: (...args: T) => Promise<R>,
  context?: Partial<ServerErrorContext>
) {
  return async (...args: T): Promise<R | NextResponse<APIErrorResponse>> => {
    const startTime = Date.now();

    try {
      const result = await handler(...args);

      // Log successful requests in development
      if (process.env.NODE_ENV === "development") {
        const duration = Date.now() - startTime;
        console.log(
          `✅ ${context?.method || "REQUEST"} ${
            context?.endpoint || "UNKNOWN"
          } - ${duration}ms`
        );
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const serverError = mapToServerError(error, {
        ...context,
        duration,
      });

      return createErrorResponse(
        serverError,
        process.env.NODE_ENV === "development"
      );
    }
  };
}

/**
 * Validates request parameters and throws appropriate errors
 */
export function validateRequired(
  value: any,
  fieldName: string,
  context?: Partial<ServerErrorContext>
): void {
  if (value === undefined || value === null || value === "") {
    throw createServerError(
      ErrorType.VALIDATION_ERROR,
      `${fieldName} is required`,
      context
    );
  }
}

/**
 * Validates UUID format
 */
export function validateUUID(
  value: string,
  fieldName: string,
  context?: Partial<ServerErrorContext>
): void {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(value)) {
    throw createServerError(
      ErrorType.VALIDATION_ERROR,
      `${fieldName} must be a valid UUID`,
      context
    );
  }
}

/**
 * Validates file upload parameters
 */
export function validateFileUpload(
  file: File | null,
  maxSize: number,
  allowedTypes: string[],
  context?: Partial<ServerErrorContext>
): void {
  if (!file) {
    throw createServerError(
      ErrorType.VALIDATION_ERROR,
      "No file provided",
      context
    );
  }

  if (file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    throw createServerError(
      ErrorType.FILE_TOO_LARGE,
      `File size exceeds ${maxSizeMB}MB limit`,
      { ...context, fileSize: file.size, fileName: file.name }
    );
  }

  if (!allowedTypes.includes(file.type)) {
    throw createServerError(
      ErrorType.INVALID_FILE_TYPE,
      `File type ${file.type} is not allowed`,
      { ...context, fileSize: file.size, fileName: file.name }
    );
  }

  if (file.size === 0) {
    throw createServerError(ErrorType.INVALID_FILE_FORMAT, "File is empty", {
      ...context,
      fileSize: file.size,
      fileName: file.name,
    });
  }
}

/**
 * Rate limiting helper (basic implementation)
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number,
  context?: Partial<ServerErrorContext>
): void {
  const now = Date.now();

  // Clean up old entries
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.resetTime < now) {
      rateLimitMap.delete(key);
    }
  }

  const current = rateLimitMap.get(identifier);

  if (!current) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return;
  }

  if (current.count >= maxRequests) {
    throw createServerError(
      ErrorType.RATE_LIMIT_ERROR,
      `Rate limit exceeded. Maximum ${maxRequests} requests per ${
        windowMs / 1000
      } seconds`,
      context
    );
  }

  current.count++;
}

/**
 * Creates AI service specific errors
 */
export function createAIServiceError(
  message: string,
  context?: Partial<ServerErrorContext>,
  details?: any
): ServerError {
  // Determine specific AI error type based on message
  let errorType = ErrorType.AI_SERVICE_ERROR;

  if (message.includes("quota") || message.includes("limit")) {
    errorType = ErrorType.AI_QUOTA_EXCEEDED;
  } else if (message.includes("policy") || message.includes("violation")) {
    errorType = ErrorType.AI_CONTENT_POLICY_VIOLATION;
  } else if (message.includes("unavailable") || message.includes("model")) {
    errorType = ErrorType.AI_MODEL_UNAVAILABLE;
  }

  return createServerError(errorType, message, context, details);
}

/**
 * Creates PDF processing specific errors
 */
export function createPDFProcessingError(
  message: string,
  context?: Partial<ServerErrorContext>,
  details?: any
): ServerError {
  let errorType = ErrorType.PDF_LOADING_ERROR;

  if (message.includes("corrupted") || message.includes("invalid")) {
    errorType = ErrorType.PDF_CORRUPTED;
  } else if (message.includes("render") || message.includes("display")) {
    errorType = ErrorType.PDF_RENDERING_ERROR;
  }

  return createServerError(errorType, message, context, details);
}

/**
 * Creates storage specific errors
 */
export function createStorageError(
  message: string,
  context?: Partial<ServerErrorContext>,
  details?: any
): ServerError {
  let errorType = ErrorType.STORAGE_ERROR;

  if (message.includes("quota") || message.includes("space")) {
    errorType = ErrorType.STORAGE_QUOTA_EXCEEDED;
  } else if (message.includes("upload") || message.includes("failed")) {
    errorType = ErrorType.STORAGE_UPLOAD_FAILED;
  } else if (message.includes("access") || message.includes("denied")) {
    errorType = ErrorType.STORAGE_ACCESS_DENIED;
  }

  return createServerError(errorType, message, context, details);
}
