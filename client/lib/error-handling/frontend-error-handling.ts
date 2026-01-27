/**
 * Comprehensive error handling utilities
 */

// Error types
export enum ErrorType {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
  AUTHORIZATION_ERROR = "AUTHORIZATION_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
  TIMEOUT_ERROR = "TIMEOUT_ERROR",
  FILE_TOO_LARGE = "FILE_TOO_LARGE",
  INVALID_FILE_TYPE = "INVALID_FILE_TYPE",
  STORAGE_QUOTA_EXCEEDED = "STORAGE_QUOTA_EXCEEDED",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
  DATABASE_CONSTRAINT_ERROR = "DATABASE_CONSTRAINT_ERROR",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  DATABASE_CONNECTION_ERROR = "DATABASE_CONNECTION_ERROR",
  STORAGE_ERROR = "STORAGE_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export enum ErrorSeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export interface ErrorContext {
  component?: string;
  action?: string;
  documentName?: string;
  size?: number;
  documentType?: string;
  uploadProgress?: number;
  documentId?: string;
  pageNumber?: number;
  url?: string;
  retryAttempt?: number;
  [key: string]: any;
}

export interface AppError {
  type: ErrorType;
  message: string;
  severity: ErrorSeverity;
  retryable: boolean;
  userMessage: string;
  technicalMessage?: string;
  details?: any;
  timestamp: Date;
  context?: ErrorContext;
}

export interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors: ErrorType[];
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  retryableErrors: [
    ErrorType.NETWORK_ERROR,
    ErrorType.TIMEOUT_ERROR,
    ErrorType.SERVICE_UNAVAILABLE,
    ErrorType.DATABASE_CONNECTION_ERROR,
  ],
};

export const ERROR_SEVERITY_MAP: Record<ErrorType, ErrorSeverity> = {
  [ErrorType.VALIDATION_ERROR]: ErrorSeverity.LOW,
  [ErrorType.AUTHENTICATION_ERROR]: ErrorSeverity.HIGH,
  [ErrorType.AUTHORIZATION_ERROR]: ErrorSeverity.HIGH,
  [ErrorType.NETWORK_ERROR]: ErrorSeverity.MEDIUM,
  [ErrorType.TIMEOUT_ERROR]: ErrorSeverity.MEDIUM,
  [ErrorType.FILE_TOO_LARGE]: ErrorSeverity.LOW,
  [ErrorType.INVALID_FILE_TYPE]: ErrorSeverity.LOW,
  [ErrorType.STORAGE_QUOTA_EXCEEDED]: ErrorSeverity.HIGH,
  [ErrorType.INTERNAL_SERVER_ERROR]: ErrorSeverity.HIGH,
  [ErrorType.SERVICE_UNAVAILABLE]: ErrorSeverity.HIGH,
  [ErrorType.DATABASE_CONSTRAINT_ERROR]: ErrorSeverity.MEDIUM,
  [ErrorType.TOKEN_EXPIRED]: ErrorSeverity.MEDIUM,
  [ErrorType.DATABASE_CONNECTION_ERROR]: ErrorSeverity.HIGH,
  [ErrorType.STORAGE_ERROR]: ErrorSeverity.MEDIUM,
  [ErrorType.DATABASE_ERROR]: ErrorSeverity.HIGH,
  [ErrorType.UNKNOWN_ERROR]: ErrorSeverity.MEDIUM,
};

export const ERROR_MESSAGES: Record<ErrorType, { title: string; message: string; action?: string }> = {
  [ErrorType.VALIDATION_ERROR]: {
    title: "Validation Error",
    message: "Please check your input and try again.",
  },
  [ErrorType.AUTHENTICATION_ERROR]: {
    title: "Authentication Required",
    message: "Please sign in to continue.",
    action: "Sign In",
  },
  [ErrorType.AUTHORIZATION_ERROR]: {
    title: "Access Denied",
    message: "You don't have permission to perform this action.",
  },
  [ErrorType.NETWORK_ERROR]: {
    title: "Connection Error",
    message: "Please check your internet connection and try again.",
    action: "Retry",
  },
  [ErrorType.TIMEOUT_ERROR]: {
    title: "Request Timeout",
    message: "The request took too long. Please try again.",
    action: "Retry",
  },
  [ErrorType.FILE_TOO_LARGE]: {
    title: "File Too Large",
    message: "The file exceeds the maximum allowed size.",
  },
  [ErrorType.INVALID_FILE_TYPE]: {
    title: "Invalid File Type",
    message: "This file type is not supported.",
  },
  [ErrorType.STORAGE_QUOTA_EXCEEDED]: {
    title: "Storage Full",
    message: "You've reached your storage limit.",
    action: "Upgrade Plan",
  },
  [ErrorType.INTERNAL_SERVER_ERROR]: {
    title: "Server Error",
    message: "Something went wrong on our end. Please try again later.",
  },
  [ErrorType.SERVICE_UNAVAILABLE]: {
    title: "Service Unavailable",
    message: "The service is temporarily unavailable. Please try again later.",
    action: "Retry",
  },
  [ErrorType.DATABASE_CONSTRAINT_ERROR]: {
    title: "Data Error",
    message: "There was a problem with your data. Please check and try again.",
  },
  [ErrorType.TOKEN_EXPIRED]: {
    title: "Session Expired",
    message: "Your session has expired. Please sign in again.",
    action: "Sign In",
  },
  [ErrorType.DATABASE_CONNECTION_ERROR]: {
    title: "Connection Error",
    message: "Unable to connect to the database. Please try again.",
    action: "Retry",
  },
  [ErrorType.STORAGE_ERROR]: {
    title: "Storage Error",
    message: "There was a problem with file storage. Please try again.",
    action: "Retry",
  },
  [ErrorType.DATABASE_ERROR]: {
    title: "Database Error",
    message: "A database error occurred. Please try again.",
  },
  [ErrorType.UNKNOWN_ERROR]: {
    title: "Error",
    message: "An unexpected error occurred. Please try again.",
  },
};

/**
 * Creates a standardized AppError from various error sources
 */
export function createAppError(
  type: ErrorType,
  message: string,
  context?: ErrorContext,
  details?: any
): AppError {
  const severity = ERROR_SEVERITY_MAP[type] || ErrorSeverity.MEDIUM;
  const errorMessage = ERROR_MESSAGES[type];

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

  // Handle document validation errors
  if (
    error?.message?.includes("document size") ||
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
    error?.message?.includes("document type") ||
    error?.message?.includes("Document")
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
        data?.error || "Document too large",
        context,
        error
      );

    case 415:
      return createAppError(
        ErrorType.INVALID_FILE_TYPE,
        data?.error || "Unsupported document type",
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
    case "PGRST116":
      return createAppError(
        ErrorType.AUTHORIZATION_ERROR,
        "Access denied or resource not found",
        context,
        error
      );

    case "PGRST301":
      return createAppError(
        ErrorType.VALIDATION_ERROR,
        "Resource not found",
        context,
        error
      );

    case "23505":
      return createAppError(
        ErrorType.DATABASE_CONSTRAINT_ERROR,
        "Duplicate resource",
        context,
        error
      );

    case "23503":
      return createAppError(
        ErrorType.DATABASE_CONSTRAINT_ERROR,
        "Invalid reference",
        context,
        error
      );

    case "42501":
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

      if (attempt === retryConfig.maxRetries) {
        break;
      }

      if (
        !lastError.retryable ||
        !retryConfig.retryableErrors.includes(lastError.type)
      ) {
        throw lastError;
      }

      const delay = Math.min(
        retryConfig.initialDelay *
          Math.pow(retryConfig.backoffMultiplier, attempt),
        retryConfig.maxDelay
      );

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

  throw lastError!;
}

/**
 * Creates error context for upload operations
 */
export function createUploadErrorContext(
  documentName: string,
  size: number,
  documentType?: string,
  uploadProgress?: number
): ErrorContext {
  return {
    component: "DocumentUpload",
    action: "upload",
    documentName,
    size,
    ...(documentType && { documentType }),
    ...(uploadProgress !== undefined && { uploadProgress }),
  };
}

/**
 * Creates error context for Document operations
 */
export function createDocumentErrorContext(
  operation: "load" | "render" | "annotate" | "save",
  documentId?: string,
  documentName?: string,
  pageNumber?: number
): ErrorContext {
  return {
    component: "DocumentViewer",
    action: operation,
    documentId,
    documentName,
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
  if (error.severity === ErrorSeverity.LOW) {
    return false;
  }

  if (
    [
      ErrorType.AUTHENTICATION_ERROR,
      ErrorType.AUTHORIZATION_ERROR,
      ErrorType.TOKEN_EXPIRED,
    ].includes(error.type)
  ) {
    return false;
  }

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
    technicalMessage: undefined,
    details: undefined,
    context: error.context
      ? {
          component: error.context.component,
          action: error.context.action,
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
