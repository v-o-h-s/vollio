/**
 * Error Handling Types and Classes
 * Temporary solution for error management
 */

export enum ErrorSeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export enum ErrorType {
  GENERAL = "GENERAL",
  AUTHENTICATION = "AUTHENTICATION",
  AUTHORIZATION = "AUTHORIZATION",
  VALIDATION = "VALIDATION",
  NETWORK = "NETWORK",
  SERVER = "SERVER",
  FILE_OPERATION = "FILE_OPERATION",
  STORAGE = "STORAGE",
}

export interface ErrorContext {
  component?: string;
  action?: string;
  documentName?: string;
  size?: number;
  userId?: string;
  requestId?: string;
  [key: string]: any;
}

export interface ErrorNotificationOptions {
  duration?: number;
  persistent?: boolean;
  showDetails?: boolean;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center";
}

export interface ErrorRecoveryAction {
  label: string;
  action: () => void | Promise<void>;
  primary?: boolean;
}

/**
 * AppError class - Base error class for the application
 */
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly severity: ErrorSeverity;
  public readonly userMessage: string;
  public readonly title: string;
  public readonly retryable: boolean;
  public readonly context?: ErrorContext;
  public readonly originalError?: Error;
  public readonly timestamp: Date;

  constructor(options: {
    type: ErrorType;
    message: string;
    title?: string;
    userMessage?: string;
    severity?: ErrorSeverity;
    retryable?: boolean;
    context?: ErrorContext;
    originalError?: Error;
  }) {
    super(options.message);
    this.name = "AppError";
    this.type = options.type;
    this.severity = options.severity || ErrorSeverity.MEDIUM;
    this.userMessage = options.userMessage || options.message;
    this.title = options.title || this.getDefaultTitle();
    this.retryable = options.retryable ?? false;
    this.context = options.context;
    this.originalError = options.originalError;
    this.timestamp = new Date();

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  private getDefaultTitle(): string {
    switch (this.type) {
      case ErrorType.AUTHENTICATION:
        return "Authentication Error";
      case ErrorType.AUTHORIZATION:
        return "Access Denied";
      case ErrorType.VALIDATION:
        return "Validation Error";
      case ErrorType.NETWORK:
        return "Network Error";
      case ErrorType.SERVER:
        return "Server Error";
      case ErrorType.FILE_OPERATION:
        return "Document Error";
      case ErrorType.STORAGE:
        return "Storage Error";
      default:
        return "Error";
    }
  }

  toJSON() {
    return {
      name: this.name,
      type: this.type,
      severity: this.severity,
      message: this.message,
      userMessage: this.userMessage,
      title: this.title,
      retryable: this.retryable,
      timestamp: this.timestamp.toISOString(),
      context: this.context,
    };
  }
}

/**
 * Create an authentication error
 */
export function createAuthError(
  message: string,
  context?: ErrorContext
): AppError {
  return new AppError({
    type: ErrorType.AUTHENTICATION,
    message,
    userMessage: "Please sign in to continue.",
    severity: ErrorSeverity.HIGH,
    retryable: false,
    context,
  });
}

/**
 * Create an authorization error
 */
export function createAuthorizationError(
  message: string,
  context?: ErrorContext
): AppError {
  return new AppError({
    type: ErrorType.AUTHORIZATION,
    message,
    userMessage: "You don't have permission to perform this action.",
    severity: ErrorSeverity.HIGH,
    retryable: false,
    context,
  });
}

/**
 * Create a validation error
 */
export function createValidationError(
  message: string,
  context?: ErrorContext
): AppError {
  return new AppError({
    type: ErrorType.VALIDATION,
    message,
    userMessage: "Please check your input and try again.",
    severity: ErrorSeverity.LOW,
    retryable: false,
    context,
  });
}

/**
 * Create a network error
 */
export function createNetworkError(
  message: string,
  context?: ErrorContext
): AppError {
  return new AppError({
    type: ErrorType.NETWORK,
    message,
    userMessage: "Please check your connection and try again.",
    severity: ErrorSeverity.MEDIUM,
    retryable: true,
    context,
  });
}

/**
 * Create a server error
 */
export function createServerError(
  message: string,
  context?: ErrorContext
): AppError {
  return new AppError({
    type: ErrorType.SERVER,
    message,
    userMessage: "Something went wrong on the server. Please try again.",
    severity: ErrorSeverity.HIGH,
    retryable: true,
    context,
  });
}

/**
 * Create a document operation error
 */
export function createDocumentError(
  message: string,
  context?: ErrorContext
): AppError {
  return new AppError({
    type: ErrorType.FILE_OPERATION,
    message,
    userMessage: "There was a problem with the document. Please try again.",
    severity: ErrorSeverity.MEDIUM,
    retryable: true,
    context,
  });
}

/**
 * Create a storage error
 */
export function createStorageError(
  message: string,
  context?: ErrorContext
): AppError {
  return new AppError({
    type: ErrorType.STORAGE,
    message,
    userMessage: "There was a problem with storage. Please try again.",
    severity: ErrorSeverity.MEDIUM,
    retryable: true,
    context,
  });
}
