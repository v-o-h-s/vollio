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
  ERROR_STATUS_CODES,
} from "@/lib/utils/error-handling/errors";

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
