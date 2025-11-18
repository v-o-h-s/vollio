/**
 * Error Handling System
 * 
 * This module provides a comprehensive error handling system with categorized error classes.
 * Each error category has a parent class with static factory methods for creating specific error types.
 * 
 * Usage Examples:
 * 
 * ```typescript
 * // Authentication errors
 * throw AuthError.authenticationRequired("User not logged in", { component: "PDFViewer" });
 * throw AuthError.authorizationDenied("No permission", { action: "delete" });
 * throw AuthError.tokenExpired();
 * 
 * // AI errors
 * throw AIError.serviceError("DeepSeek API failed");
 * throw AIError.quotaExceeded();
 * throw AIError.modelUnavailable();
 * 
 * // Validation errors
 * throw ValidationError.general("Invalid input");
 * throw ValidationError.fileTooLarge(100); // 100MB limit
 * throw ValidationError.invalidFileType("PDF");
 * throw ValidationError.invalidFileFormat();
 * 
 * // Storage errors
 * throw StorageError.general("Upload failed");
 * throw StorageError.quotaExceeded();
 * throw StorageError.uploadFailed();
 * throw StorageError.accessDenied();
 * 
 * // Database errors
 * throw DatabaseError.general("Query failed");
 * throw DatabaseError.connectionError();
 * throw DatabaseError.constraintError();
 * 
 * // Network errors
 * throw NetworkError.general("Request failed");
 * throw NetworkError.timeout();
 * throw NetworkError.connectionFailed();
 * 
 * // PDF errors
 * throw PDFError.general("PDF operation failed");
 * throw PDFError.loadingError();
 * throw PDFError.renderingError();
 * throw PDFError.corrupted();
 * 
 * // General errors
 * throw GeneralError.unknown();
 * throw GeneralError.internalServer();
 * throw GeneralError.serviceUnavailable();
 * throw GeneralError.externalService();
 * throw GeneralError.processing();
 * throw GeneralError.rateLimit("Too many requests", 60); // retry after 60 seconds
 * ```
 */

// Base error and types
export { BaseAppError, ErrorSeverity, type ErrorContext } from "./BaseAppError";
import { BaseAppError, ErrorSeverity } from "./BaseAppError";

// Authentication errors
export { AuthError, AuthErrorType } from "./AuthError";

// AI errors
export { AIError, AIErrorType } from "./AIError";

// Validation errors
export { FileValidationError, FileValidationErrorType } from "./files/FileValidationError";

// Storage errors
export { StorageError, StorageErrorType } from "./StorageError";

// Database errors
export { DatabaseError } from "./DatabaseError";

// Network errors
export { NetworkError, NetworkErrorType } from "./NetworkError";

// PDF errors
export { FileError, FileErrorType } from "./files/FileError";

// General errors
export { GeneralError, GeneralErrorType } from "./GeneralError";
import { GeneralError } from "./GeneralError";

// Error handling utilities
export { withErrorHandler } from "../../wrappers/withErrorHandling";

