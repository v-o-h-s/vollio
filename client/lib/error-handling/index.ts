/**
 * Error Handling System
 * 
 * This module provides a comprehensive error handling system with categorized error classes.
 * Each error category has a parent class with static factory methods for creating specific error types.
 */

// Base error and types
export { BaseAppError, ErrorSeverity } from "./BaseAppError";

// Authentication errors
export { AuthError, AuthErrorType } from "./AuthError";

// AI errors
export { AIError } from "./AIError";

// Validation errors
export { DocumentValidationError, DocumentValidationErrorType } from "./files/FileValidationError";

// Storage errors
export { StorageError, StorageErrorType } from "./StorageError";

// Database errors
export { DatabaseError } from "./DatabaseError";

// Network errors
export { NetworkError, NetworkErrorType } from "./NetworkError";

// Document errors
export { DocumentError, DocumentErrorType } from "./files/FileError";

// General errors
export { GeneralError, GeneralErrorType } from "./GeneralError";

// Legacy error types and utilities from errors.ts
export {
  ErrorType as LegacyErrorType,
  ErrorSeverity as LegacyErrorSeverity,
  AppError as LegacyAppError,
  createAuthError,
  createAuthorizationError,
  createValidationError,
  createNetworkError,
  createServerError,
  createDocumentError,
  createStorageError,
} from "./errors";
export type { ErrorContext } from "./errors";

// Frontend error handling utilities
export {
  ErrorType,
  DEFAULT_RETRY_CONFIG,
  ERROR_SEVERITY_MAP,
  ERROR_MESSAGES,
  createAppError,
  mapErrorToAppError,
  withRetry,
  createUploadErrorContext,
  createDocumentErrorContext,
  createNetworkErrorContext,
  logError,
  shouldReportError,
  sanitizeErrorForUser,
  formatErrorForDisplay,
} from "./frontend-error-handling";
export type {
  ErrorContext as FrontendErrorContext,
  AppError,
  RetryConfig,
} from "./frontend-error-handling";
