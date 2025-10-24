/**
 * Comprehensive error handling types for the PDF annotation system
 */

// Error types enum for better categorization
export enum ErrorType {
  // Authentication errors
  AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
  AUTHORIZATION_ERROR = "AUTHORIZATION_ERROR",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  
  // Validation errors
  VALIDATION_ERROR = "VALIDATION_ERROR",
  FILE_TOO_LARGE = "FILE_TOO_LARGE",
  INVALID_FILE_TYPE = "INVALID_FILE_TYPE",
  INVALID_FILE_FORMAT = "INVALID_FILE_FORMAT",
  
  // Storage errors
  STORAGE_ERROR = "STORAGE_ERROR",
  STORAGE_QUOTA_EXCEEDED = "STORAGE_QUOTA_EXCEEDED",
  STORAGE_UPLOAD_FAILED = "STORAGE_UPLOAD_FAILED",
  STORAGE_ACCESS_DENIED = "STORAGE_ACCESS_DENIED",
  
  // Database errors
  DATABASE_ERROR = "DATABASE_ERROR",
  DATABASE_CONNECTION_ERROR = "DATABASE_CONNECTION_ERROR",
  DATABASE_CONSTRAINT_ERROR = "DATABASE_CONSTRAINT_ERROR",
  
  // Network errors
  NETWORK_ERROR = "NETWORK_ERROR",
  TIMEOUT_ERROR = "TIMEOUT_ERROR",
  CONNECTION_ERROR = "CONNECTION_ERROR",
  
  // PDF-specific errors
  PDF_LOADING_ERROR = "PDF_LOADING_ERROR",
  PDF_RENDERING_ERROR = "PDF_RENDERING_ERROR",
  PDF_CORRUPTED = "PDF_CORRUPTED",
  
  // Rate limiting and external service errors
  RATE_LIMIT_ERROR = "RATE_LIMIT_ERROR",
  EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR",
  PROCESSING_ERROR = "PROCESSING_ERROR",
  
  // General errors
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
}

// Error severity levels
export enum ErrorSeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

// Base error interface
export interface AppError {
  type: ErrorType;
  message: string;
  severity: ErrorSeverity;
  retryable: boolean;
  userMessage: string; // User-friendly message
  technicalMessage?: string; // Technical details for debugging
  details?: any;
  timestamp: Date;
  context?: ErrorContext;
}

// Error context for better debugging
export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  pdfId?: string;
  documentId?: string;

  fileSize?: number;
  fileName?: string;
  url?: string;
  requestId?: string;
}

// Retry configuration
export interface RetryConfig {
  maxRetries: number;
  backoffMultiplier: number;
  initialDelay: number;
  maxDelay: number;
  retryableErrors: ErrorType[];
}

// Error recovery action
export interface ErrorRecoveryAction {
  label: string;
  action: () => void | Promise<void>;
  primary?: boolean;
}

// Error display options
export interface ErrorDisplayOptions {
  showTechnicalDetails?: boolean;
  showRetryButton?: boolean;
  showContactSupport?: boolean;
  customActions?: ErrorRecoveryAction[];
  autoRetry?: boolean;
  dismissible?: boolean;
}

// Error boundary state
export interface ErrorBoundaryState {
  hasError: boolean;
  error: AppError | null;
  errorId: string | null;
  retryCount: number;
  lastRetryAt: Date | null;
}

// Error notification options
export interface ErrorNotificationOptions {
  duration?: number;
  persistent?: boolean;
  showDetails?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

// Upload error details
export interface UploadErrorDetails {
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadProgress?: number;
  bytesUploaded?: number;
}

// PDF error details
export interface PDFErrorDetails {
  pdfId?: string;
  fileName?: string;
  fileSize?: number;
  pageNumber?: number;
  operation?: 'load' | 'render' | 'annotate' | 'save';
}

// Network error details
export interface NetworkErrorDetails {
  url: string;
  method: string;
  status?: number;
  statusText?: string;
  timeout?: boolean;
  retryAttempt?: number;
}

// Default retry configuration
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  backoffMultiplier: 2,
  initialDelay: 1000,
  maxDelay: 10000,
  retryableErrors: [
    ErrorType.NETWORK_ERROR,
    ErrorType.TIMEOUT_ERROR,
    ErrorType.CONNECTION_ERROR,
    ErrorType.DATABASE_CONNECTION_ERROR,
    ErrorType.STORAGE_ERROR,
    ErrorType.INTERNAL_SERVER_ERROR,
    ErrorType.SERVICE_UNAVAILABLE,
  ],
};

// Error type to severity mapping
export const ERROR_SEVERITY_MAP: Record<ErrorType, ErrorSeverity> = {
  [ErrorType.AUTHENTICATION_ERROR]: ErrorSeverity.HIGH,
  [ErrorType.AUTHORIZATION_ERROR]: ErrorSeverity.HIGH,
  [ErrorType.TOKEN_EXPIRED]: ErrorSeverity.MEDIUM,
  [ErrorType.VALIDATION_ERROR]: ErrorSeverity.LOW,
  [ErrorType.FILE_TOO_LARGE]: ErrorSeverity.LOW,
  [ErrorType.INVALID_FILE_TYPE]: ErrorSeverity.LOW,
  [ErrorType.INVALID_FILE_FORMAT]: ErrorSeverity.LOW,
  [ErrorType.STORAGE_ERROR]: ErrorSeverity.MEDIUM,
  [ErrorType.STORAGE_QUOTA_EXCEEDED]: ErrorSeverity.MEDIUM,
  [ErrorType.STORAGE_UPLOAD_FAILED]: ErrorSeverity.MEDIUM,
  [ErrorType.STORAGE_ACCESS_DENIED]: ErrorSeverity.HIGH,
  [ErrorType.DATABASE_ERROR]: ErrorSeverity.MEDIUM,
  [ErrorType.DATABASE_CONNECTION_ERROR]: ErrorSeverity.HIGH,
  [ErrorType.DATABASE_CONSTRAINT_ERROR]: ErrorSeverity.MEDIUM,
  [ErrorType.NETWORK_ERROR]: ErrorSeverity.MEDIUM,
  [ErrorType.TIMEOUT_ERROR]: ErrorSeverity.MEDIUM,
  [ErrorType.CONNECTION_ERROR]: ErrorSeverity.HIGH,
  [ErrorType.PDF_LOADING_ERROR]: ErrorSeverity.MEDIUM,
  [ErrorType.PDF_RENDERING_ERROR]: ErrorSeverity.MEDIUM,
  [ErrorType.PDF_CORRUPTED]: ErrorSeverity.HIGH,
  [ErrorType.RATE_LIMIT_ERROR]: ErrorSeverity.MEDIUM,
  [ErrorType.EXTERNAL_SERVICE_ERROR]: ErrorSeverity.MEDIUM,
  [ErrorType.PROCESSING_ERROR]: ErrorSeverity.MEDIUM,
  [ErrorType.UNKNOWN_ERROR]: ErrorSeverity.MEDIUM,
  [ErrorType.INTERNAL_SERVER_ERROR]: ErrorSeverity.HIGH,
  [ErrorType.SERVICE_UNAVAILABLE]: ErrorSeverity.HIGH,
};

// User-friendly error messages
export const ERROR_MESSAGES: Record<ErrorType, { title: string; message: string; action?: string }> = {
  [ErrorType.AUTHENTICATION_ERROR]: {
    title: "Authentication Required",
    message: "Please sign in to continue using Noto.",
    action: "Sign In",
  },
  [ErrorType.AUTHORIZATION_ERROR]: {
    title: "Access Denied",
    message: "You don't have permission to access this resource.",
    action: "Go Back",
  },
  [ErrorType.TOKEN_EXPIRED]: {
    title: "Session Expired",
    message: "Your session has expired. Please sign in again.",
    action: "Sign In",
  },
  [ErrorType.VALIDATION_ERROR]: {
    title: "Invalid Input",
    message: "Please check your input and try again.",
    action: "Try Again",
  },
  [ErrorType.FILE_TOO_LARGE]: {
    title: "File Too Large",
    message: "The selected file exceeds the maximum size limit of 50MB.",
    action: "Choose Another File",
  },
  [ErrorType.INVALID_FILE_TYPE]: {
    title: "Invalid File Type",
    message: "Only PDF files are supported. Please select a PDF file.",
    action: "Choose PDF File",
  },
  [ErrorType.INVALID_FILE_FORMAT]: {
    title: "Invalid File Format",
    message: "The selected file appears to be corrupted or in an unsupported format.",
    action: "Choose Another File",
  },
  [ErrorType.STORAGE_ERROR]: {
    title: "Storage Error",
    message: "There was an error saving your file. Please try again.",
    action: "Retry Upload",
  },
  [ErrorType.STORAGE_QUOTA_EXCEEDED]: {
    title: "Storage Full",
    message: "You've reached your storage limit. Please delete some files or upgrade your plan.",
    action: "Manage Storage",
  },
  [ErrorType.STORAGE_UPLOAD_FAILED]: {
    title: "Upload Failed",
    message: "Failed to upload your file. Please check your connection and try again.",
    action: "Retry Upload",
  },
  [ErrorType.STORAGE_ACCESS_DENIED]: {
    title: "Access Denied",
    message: "You don't have permission to access this file.",
    action: "Go Back",
  },
  [ErrorType.DATABASE_ERROR]: {
    title: "Database Error",
    message: "There was an error processing your request. Please try again.",
    action: "Try Again",
  },
  [ErrorType.DATABASE_CONNECTION_ERROR]: {
    title: "Connection Error",
    message: "Unable to connect to the database. Please check your connection.",
    action: "Retry",
  },
  [ErrorType.DATABASE_CONSTRAINT_ERROR]: {
    title: "Data Conflict",
    message: "There was a conflict with your data. Please refresh and try again.",
    action: "Refresh",
  },
  [ErrorType.NETWORK_ERROR]: {
    title: "Network Error",
    message: "Please check your internet connection and try again.",
    action: "Retry",
  },
  [ErrorType.TIMEOUT_ERROR]: {
    title: "Request Timeout",
    message: "The request took too long to complete. Please try again.",
    action: "Try Again",
  },
  [ErrorType.CONNECTION_ERROR]: {
    title: "Connection Failed",
    message: "Unable to connect to the server. Please check your connection.",
    action: "Retry",
  },
  [ErrorType.PDF_LOADING_ERROR]: {
    title: "PDF Loading Failed",
    message: "Unable to load the PDF file. The file might be corrupted.",
    action: "Try Another File",
  },
  [ErrorType.PDF_RENDERING_ERROR]: {
    title: "PDF Display Error",
    message: "There was an error displaying the PDF. Please refresh the page.",
    action: "Refresh",
  },
  [ErrorType.PDF_CORRUPTED]: {
    title: "Corrupted PDF",
    message: "The PDF file appears to be corrupted and cannot be opened.",
    action: "Upload New File",
  },
  [ErrorType.RATE_LIMIT_ERROR]: {
    title: "Rate Limit Exceeded",
    message: "Too many requests. Please wait a moment before trying again.",
    action: "Wait and Retry",
  },
  [ErrorType.EXTERNAL_SERVICE_ERROR]: {
    title: "Service Error",
    message: "An external service is temporarily unavailable.",
    action: "Try Again",
  },
  [ErrorType.PROCESSING_ERROR]: {
    title: "Processing Error",
    message: "There was an error processing your request.",
    action: "Try Again",
  },
  [ErrorType.UNKNOWN_ERROR]: {
    title: "Unexpected Error",
    message: "An unexpected error occurred. Please try again.",
    action: "Try Again",
  },
  [ErrorType.INTERNAL_SERVER_ERROR]: {
    title: "Server Error",
    message: "There was an internal server error. Please try again later.",
    action: "Try Again",
  },
  [ErrorType.SERVICE_UNAVAILABLE]: {
    title: "Service Unavailable",
    message: "The service is temporarily unavailable. Please try again later.",
    action: "Try Again",
  },
};