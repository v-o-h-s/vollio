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
 * throw AuthError.authenticationRequired("User not logged in", { component: "DocumentViewer" });
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
 * throw ValidationError.documentTooLarge(100); // 100MB limit
 * throw ValidationError.invalidDocumentType("Document");
 * throw ValidationError.invalidDocumentFormat();
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
 * // Document errors
 * throw DocumentError.general("Document operation failed");
 * throw DocumentError.loadingError();
 * throw DocumentError.renderingError();
 * throw DocumentError.corrupted();
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
export { BaseAppError, ErrorSeverity } from "./BaseAppError";
import { BaseAppError, ErrorSeverity } from "./BaseAppError";

// Authentication errors
export { AuthError, AuthErrorType } from "./AuthError";

// AI errors
export { AIError } from "./AIError";

// Validation errors
export { DocumentValidationError, DocumentValidationErrorType } from "./documents/DocumentValidationError";

// Storage errors
export { StorageError, StorageErrorType } from "./StorageError";

// Database errors
export { DatabaseError } from "./DatabaseError";

// Network errors
export { NetworkError, NetworkErrorType } from "./NetworkError";

// Document errors
export { DocumentError, DocumentErrorType } from "./documents/DocumentError";

// General errors
export { GeneralError, GeneralErrorType } from "./GeneralError";
import { GeneralError } from "./GeneralError";

// Error handling utilities

