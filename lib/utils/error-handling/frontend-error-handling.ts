/**
 * Comprehensive error handling utilities
 */

import {
  AppError,
  ErrorType,
  ErrorSeverity,
  ErrorContext,
  RetryConfig,
  DEFAULT_RETRY_CONFIG,
  ERROR_SEVERITY_MAP,
  ERROR_MESSAGES,
} from "@/lib/types/errors";

/**
 * Creates a standardized AppError from various error sources
 */

export function createAppError(
  type: ErrorType,
  message: string,
  context?: ErrorContext,
  details?: any
): AppError {
  const severity = ERROR_SEVERITY_MAP[type] || ErrorSeverity.MEDIUM; // level of error
  const errorMessage = ERROR_MESSAGES[type]; // gives title message and action

  return {
    type,
    message,
    severity,
    retryable: DEFAULT_RETRY_CONFIG.retryableErrors.includes(type),
    userMessage: errorMessage?.message || message,
    technicalMessage: message,
    details,
    timestamp: new Date(),
    context,
  };
}

/**
 * Maps various error types to AppError
 */
export function mapErrorToAppError(
  error: any,
  context?: ErrorContext
): AppError {
  // Handle RTK Query errors
  if (error?.status) {
    return mapRTKQueryError(error, context);
  }

  // Handle Supabase errors
  if (error?.code && typeof error.code === "string") {
    return mapSupabaseError(error, context);
  }

  // Handle fetch/network errors
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return createAppError(
      ErrorType.NETWORK_ERROR,
      "Network request failed",
      context,
      error
    );
  }

  // Handle timeout errors
  if (error?.name === "AbortError" || error?.message?.includes("timeout")) {
    return createAppError(
      ErrorType.TIMEOUT_ERROR,
      "Request timed out",
      context,
      error
    );
  }

  // Handle file validation errors
  if (
    error?.message?.includes("file size") ||
    error?.message?.includes("too large")
  ) {
    return createAppError(
      ErrorType.FILE_TOO_LARGE,
      error.message,
      context,
      error
    );
  }

  if (
    error?.message?.includes("file type") ||
    error?.message?.includes("PDF")
  ) {
    return createAppError(
      ErrorType.INVALID_FILE_TYPE,
      error.message,
      context,
      error
    );
  }

  // Handle authentication errors
  if (
    error?.message?.includes("Unauthorized") ||
    error?.message?.includes("401")
  ) {
    return createAppError(
      ErrorType.AUTHENTICATION_ERROR,
      "Authentication required",
      context,
      error
    );
  }

  if (
    error?.message?.includes("Forbidden") ||
    error?.message?.includes("403")
  ) {
    return createAppError(
      ErrorType.AUTHORIZATION_ERROR,
      "Access denied",
      context,
      error
    );
  }

  // Default to unknown error
  return createAppError(
    ErrorType.UNKNOWN_ERROR,
    error?.message || "An unexpected error occurred",
    context,
    error
  );
}

/**
 * Maps RTK Query errors to AppError
 */
function mapRTKQueryError(error: any, context?: ErrorContext): AppError {
  const status = error.status;
  const data = error.data;

  switch (status) {
    case 401:
      return createAppError(
        ErrorType.AUTHENTICATION_ERROR,
        data?.error || "Authentication required",
        context,
        error
      );

    case 403:
      return createAppError(
        ErrorType.AUTHORIZATION_ERROR,
        data?.error || "Access denied",
        context,
        error
      );

    case 404:
      return createAppError(
        ErrorType.VALIDATION_ERROR,
        data?.error || "Resource not found",
        context,
        error
      );

    case 413:
      return createAppError(
        ErrorType.FILE_TOO_LARGE,
        data?.error || "File too large",
        context,
        error
      );

    case 415:
      return createAppError(
        ErrorType.INVALID_FILE_TYPE,
        data?.error || "Unsupported file type",
        context,
        error
      );

    case 429:
      return createAppError(
        ErrorType.STORAGE_QUOTA_EXCEEDED,
        data?.error || "Rate limit exceeded",
        context,
        error
      );

    case 500:
      return createAppError(
        ErrorType.INTERNAL_SERVER_ERROR,
        data?.error || "Internal server error",
        context,
        error
      );

    case 503:
      return createAppError(
        ErrorType.SERVICE_UNAVAILABLE,
        data?.error || "Service unavailable",
        context,
        error
      );

    case "FETCH_ERROR":
      return createAppError(
        ErrorType.NETWORK_ERROR,
        "Network connection failed",
        context,
        error
      );

    case "TIMEOUT_ERROR":
      return createAppError(
        ErrorType.TIMEOUT_ERROR,
        "Request timed out",
        context,
        error
      );

    default:
      return createAppError(
        ErrorType.UNKNOWN_ERROR,
        data?.error || error?.error || "An unexpected error occurred",
        context,
        error
      );
  }
}

/**
 * Maps Supabase errors to AppError
 */
function mapSupabaseError(error: any, context?: ErrorContext): AppError {
  const code = error.code;
  const message = error.message || "";

  switch (code) {
    case "PGRST116": // Row not found or RLS policy violation
      return createAppError(
        ErrorType.AUTHORIZATION_ERROR,
        "Access denied or resource not found",
        context,
        error
      );

    case "PGRST301": // Resource not found
      return createAppError(
        ErrorType.VALIDATION_ERROR,
        "Resource not found",
        context,
        error
      );

    case "23505": // Unique constraint violation
      return createAppError(
        ErrorType.DATABASE_CONSTRAINT_ERROR,
        "Duplicate resource",
        context,
        error
      );

    case "23503": // Foreign key constraint violation
      return createAppError(
        ErrorType.DATABASE_CONSTRAINT_ERROR,
        "Invalid reference",
        context,
        error
      );

    case "42501": // Insufficient privilege
      return createAppError(
        ErrorType.AUTHORIZATION_ERROR,
        "Insufficient permissions",
        context,
        error
      );

    default:
      if (message.includes("JWT")) {
        return createAppError(
          ErrorType.TOKEN_EXPIRED,
          "Authentication token expired",
          context,
          error
        );
      }

      if (message.includes("network") || message.includes("connection")) {
        return createAppError(
          ErrorType.DATABASE_CONNECTION_ERROR,
          "Database connection failed",
          context,
          error
        );
      }

      if (message.includes("storage")) {
        return createAppError(
          ErrorType.STORAGE_ERROR,
          "Storage operation failed",
          context,
          error
        );
      }

      return createAppError(
        ErrorType.DATABASE_ERROR,
        message || "Database error occurred",
        context,
        error
      );
  }
}

/**
 * Implements retry logic with exponential backoff
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  context?: ErrorContext
): Promise<T> {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: AppError;

  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = mapErrorToAppError(error, {
        ...context,
        action: `${context?.action || "operation"} (attempt ${attempt + 1})`,
      });

      // Don't retry if it's the last attempt
      if (attempt === retryConfig.maxRetries) {
        break;
      }

      // Don't retry if error is not retryable
      if (
        !lastError.retryable ||
        !retryConfig.retryableErrors.includes(lastError.type)
      ) {
        throw lastError;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        retryConfig.initialDelay *
          Math.pow(retryConfig.backoffMultiplier, attempt),
        retryConfig.maxDelay
      );

      // Add jitter to prevent thundering herd
      const jitteredDelay = delay + Math.random() * 1000;

      console.warn(
        `Retrying operation after ${jitteredDelay}ms (attempt ${attempt + 1}/${
          retryConfig.maxRetries + 1
        })`,
        {
          error: lastError,
          context,
        }
      );

      await new Promise((resolve) => setTimeout(resolve, jitteredDelay));
    }
  }

  // If we get here, all retries have been exhausted
  throw lastError!;
}

/**
 * Creates error context for upload operations
 */
export function createUploadErrorContext(
  fileName: string,
  fileSize: number,
  fileType?: string,
  uploadProgress?: number
): ErrorContext {
  return {
    component: "FileUpload",
    action: "upload",
    fileName,
    fileSize,
    // Include additional context if provided
    ...(fileType && { fileType }),
    ...(uploadProgress !== undefined && { uploadProgress }),
  };
}

/**
 * Creates error context for PDF operations
 */
export function createPDFErrorContext(
  operation: "load" | "render" | "annotate" | "save",
  pdfId?: string,
  fileName?: string,
  pageNumber?: number
): ErrorContext {
  return {
    component: "PDFViewer",
    action: operation,
    pdfId,
    fileName,
    ...(pageNumber !== undefined && { pageNumber }),
  };
}

/**
 * Creates error context for network operations
 */
export function createNetworkErrorContext(
  url: string,
  method: string,
  retryAttempt?: number
): ErrorContext {
  return {
    component: "NetworkRequest",
    action: method.toLowerCase(),
    url,
    ...(retryAttempt !== undefined && { retryAttempt }),
  };
}

/**
 * Logs errors with appropriate level based on severity
 */
export function logError(error: AppError): void {
  const logData = {
    type: error.type,
    message: error.message,
    severity: error.severity,
    context: error.context,
    timestamp: error.timestamp,
    details: error.details,
  };

  switch (error.severity) {
    case ErrorSeverity.CRITICAL:
      console.error("CRITICAL ERROR:", logData);
      break;
    case ErrorSeverity.HIGH:
      console.error("HIGH SEVERITY ERROR:", logData);
      break;
    case ErrorSeverity.MEDIUM:
      console.warn("MEDIUM SEVERITY ERROR:", logData);
      break;
    case ErrorSeverity.LOW:
      console.info("LOW SEVERITY ERROR:", logData);
      break;
    default:
      console.log("ERROR:", logData);
  }
}

/**
 * Determines if an error should be reported to external services
 */
export function shouldReportError(error: AppError): boolean {
  // Don't report validation errors or user errors
  if (error.severity === ErrorSeverity.LOW) {
    return false;
  }

  // Don't report authentication errors (user action required)
  if (
    [
      ErrorType.AUTHENTICATION_ERROR,
      ErrorType.AUTHORIZATION_ERROR,
      ErrorType.TOKEN_EXPIRED,
    ].includes(error.type)
  ) {
    return false;
  }

  // Report medium, high, and critical errors
  return [
    ErrorSeverity.MEDIUM,
    ErrorSeverity.HIGH,
    ErrorSeverity.CRITICAL,
  ].includes(error.severity);
}

/**
 * Sanitizes error details for user display (removes sensitive information)
 */
export function sanitizeErrorForUser(error: AppError): AppError {
  return {
    ...error,
    technicalMessage: undefined, // Remove technical details
    details: undefined, // Remove raw error details
    context: error.context
      ? {
          component: error.context.component,
          action: error.context.action,
          // Remove sensitive context like userId, tokens, etc.
        }
      : undefined,
  };
}

/**
 * Formats error for display in UI components
 */
export function formatErrorForDisplay(error: AppError): {
  title: string;
  message: string;
  action?: string;
} {
  const errorMessage = ERROR_MESSAGES[error.type];

  return {
    title: errorMessage?.title || "Error",
    message: error.userMessage || errorMessage?.message || error.message,
    action: errorMessage?.action,
  };
}
