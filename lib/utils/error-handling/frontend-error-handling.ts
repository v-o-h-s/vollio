/**
 * Frontend Error Handling Utilities
 * Client-side utilities for handling and displaying errors
 */

import { AppError, ErrorType, ErrorSeverity } from "./errors";

/**
 * Format an error for display in the UI
 */
export function formatErrorForDisplay(error: AppError | Error | unknown): {
  title: string;
  message: string;
  severity: ErrorSeverity;
} {
  if (error instanceof AppError) {
    return {
      title: error.title || "Error",
      message: error.userMessage || error.message,
      severity: error.severity || ErrorSeverity.MEDIUM,
    };
  }

  if (error instanceof Error) {
    return {
      title: "Error",
      message: error.message,
      severity: ErrorSeverity.MEDIUM,
    };
  }

  return {
    title: "Unknown Error",
    message: "An unexpected error occurred. Please try again.",
    severity: ErrorSeverity.MEDIUM,
  };
}

/**
 * Map any error to an AppError instance
 */
export function mapErrorToAppError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError({
      type: ErrorType.GENERAL,
      message: error.message,
      title: "Error",
      userMessage: error.message || "An error occurred",
      severity: ErrorSeverity.MEDIUM,
      originalError: error,
    });
  }

  return new AppError({
    type: ErrorType.GENERAL,
    message: String(error),
    title: "Unknown Error",
    userMessage: "An unexpected error occurred",
    severity: ErrorSeverity.HIGH,
  });
}

/**
 * Create an AppError instance
 */
export function createAppError(options: {
  type: ErrorType;
  message: string;
  title?: string;
  userMessage?: string;
  severity?: ErrorSeverity;
  retryable?: boolean;
  originalError?: Error;
  context?: Record<string, any>;
}): AppError {
  return new AppError({
    type: options.type,
    message: options.message,
    title: options.title,
    userMessage: options.userMessage || options.message,
    severity: options.severity || ErrorSeverity.MEDIUM,
    retryable: options.retryable ?? false,
    originalError: options.originalError,
    context: options.context,
  });
}

/**
 * Log an error to the console in development
 */
export function logError(
  error: unknown,
  context?: Record<string, any>
): void {
  if (process.env.NODE_ENV === "development") {
    console.error("Error:", error);
    if (context) {
      console.error("Context:", context);
    }
  }

  // In production, could send to error tracking service
  if (process.env.NODE_ENV === "production") {
    if (error instanceof AppError) {
      // TODO: Send to Sentry, LogRocket, or similar service
      console.error("[Production Error]", error.toJSON());
    }
  }
}

/**
 * Determine if an error should be reported to users
 */
export function shouldReportError(error: AppError | Error | unknown): boolean {
  if (error instanceof AppError) {
    // Don't report low severity errors
    return error.severity !== ErrorSeverity.LOW;
  }

  // Report all other errors
  return true;
}

/**
 * Create context object for upload errors
 */
export function createUploadErrorContext(options: {
  fileName?: string;
  fileSize?: number;
  uploadedBytes?: number;
  maxFileSize?: number;
}): Record<string, any> {
  return {
    operation: "file_upload",
    fileName: options.fileName,
    fileSize: options.fileSize,
    uploadedBytes: options.uploadedBytes,
    maxFileSize: options.maxFileSize,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create context object for network errors
 */
export function createNetworkErrorContext(options: {
  url?: string;
  method?: string;
  statusCode?: number;
  timeoutMs?: number;
}): Record<string, any> {
  return {
    operation: "network_request",
    url: options.url,
    method: options.method || "GET",
    statusCode: options.statusCode,
    timeoutMs: options.timeoutMs,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Retry logic for failed operations
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options?: {
    maxRetries?: number;
    delayMs?: number;
    backoffMultiplier?: number;
  }
): Promise<T> {
  const maxRetries = options?.maxRetries ?? 3;
  const delayMs = options?.delayMs ?? 1000;
  const backoffMultiplier = options?.backoffMultiplier ?? 2;

  let lastError: Error | undefined;
  let currentDelay = delayMs;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, currentDelay));
        currentDelay *= backoffMultiplier;
      }
    }
  }

  throw lastError || new Error("Operation failed after retries");
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.retryable === true;
  }

  // Network errors are generally retryable
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("network") ||
      message.includes("timeout") ||
      message.includes("connection")
    );
  }

  return false;
}

/**
 * Get a user-friendly error message
 */
export function getUserFriendlyMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.userMessage || error.message;
  }

  if (error instanceof Error) {
    return error.message || "An error occurred";
  }

  return "An unexpected error occurred. Please try again.";
}
