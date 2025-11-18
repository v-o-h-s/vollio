import { BaseAppError, ErrorSeverity, ErrorContext } from "./BaseAppError";

export enum DatabaseErrorType {
  GENERAL_ERROR = "GENERAL_ERROR",
  CONNECTION_ERROR = "CONNECTION_ERROR",
  CONSTRAINT_ERROR = "CONSTRAINT_ERROR",
  RLS_VIOLATION_ERROR = "RLS_VIOLATION_ERROR",
  ACCESS_DENIED = "ACCESS_DENIED",
  NOT_FOUND = "NOT_FOUND",
  JWT_EXPIRED = "JWT_EXPIRED",
  NETWORK_ERROR = "NETWORK_ERROR",
  STORAGE_ERROR = "STORAGE_ERROR",
}

/**
 * Database errors
 * Use static factory methods to create specific error types
 */
export class DatabaseError extends BaseAppError {
  public readonly databaseErrorType: DatabaseErrorType;

  private constructor(
    databaseErrorType: DatabaseErrorType,
    message: string,
    options: {
      severity: ErrorSeverity;
      userMessage: string;
      actionLabel: string;
      statusCode: number;
      context?: ErrorContext;
      cause?: Error;
    }
  ) {
    super(message, {
      severity: options.severity,
      userMessage: options.userMessage,
      statusCode: options.statusCode,
      context: options.context,
      cause: options.cause,
    });
    this.databaseErrorType = databaseErrorType;
  }

  /**
   * Create a general database error
   */
  static general(
    message: string = "Database error",
    context?: ErrorContext,
    cause?: Error
  ): DatabaseError {
    return new DatabaseError(DatabaseErrorType.GENERAL_ERROR, message, {
      severity: ErrorSeverity.MEDIUM,
      userMessage: "There was an error processing your request. Please try again.",
      actionLabel: "Try Again",
      statusCode: 500,
      context,
      cause,
    });
  }

  /**
   * Create a connection error
   */
  static connectionError(
    message: string = "Database connection failed",
    context?: ErrorContext,
    cause?: Error
  ): DatabaseError {
    return new DatabaseError(DatabaseErrorType.CONNECTION_ERROR, message, {
      severity: ErrorSeverity.HIGH,
      userMessage: "Unable to connect to the database. Please check your connection.",
      actionLabel: "Retry",
      statusCode: 503,
      context,
      cause,
    });
  }

  /**
   * Create a constraint error
   */
  static constraintError(
    message: string = "Database constraint violation",
    context?: ErrorContext,
    cause?: Error
  ): DatabaseError {
    return new DatabaseError(DatabaseErrorType.CONSTRAINT_ERROR, message, {
      severity: ErrorSeverity.MEDIUM,
      userMessage:
        "There was a conflict with your data. Please refresh and try again.",
      actionLabel: "Refresh",
      statusCode: 409,
      context,
      cause,
    });
  }

  /**
   * Create an access denied error
   */
  static accessDenied(
    message: string = "Access denied",
    context?: ErrorContext,
    cause?: Error
  ): DatabaseError {
    return new DatabaseError(DatabaseErrorType.ACCESS_DENIED, message, {
      severity: ErrorSeverity.MEDIUM,
      userMessage: "Access denied. Please check your permissions.",
      actionLabel: "Contact Support",
      statusCode: 403,
      context,
      cause,
    });
  }

  /**
   * Create a not found error
   */
  static notFound(
    message: string = "Resource not found",
    context?: ErrorContext,
    cause?: Error
  ): DatabaseError {
    return new DatabaseError(DatabaseErrorType.NOT_FOUND, message, {
      severity: ErrorSeverity.MEDIUM,
      userMessage: "Resource not found.",
      actionLabel: "Go Back",
      statusCode: 404,
      context,
      cause,
    });
  }

  /**
   * Create a JWT expired error
   */
  static jwtExpired(
    message: string = "Authentication token expired",
    context?: ErrorContext,
    cause?: Error
  ): DatabaseError {
    return new DatabaseError(DatabaseErrorType.JWT_EXPIRED, message, {
      severity: ErrorSeverity.HIGH,
      userMessage: "Authentication token expired. Please sign in again.",
      actionLabel: "Sign In",
      statusCode: 401,
      context,
      cause,
    });
  }

  /**
   * Create a network error
   */
  static networkError(
    message: string = "Network error",
    context?: ErrorContext,
    cause?: Error
  ): DatabaseError {
    return new DatabaseError(DatabaseErrorType.NETWORK_ERROR, message, {
      severity: ErrorSeverity.MEDIUM,
      userMessage: "Network error occurred. Please try again.",
      actionLabel: "Retry",
      statusCode: 503,
      context,
      cause,
    });
  }

  /**
   * Create a storage error
   */
  static storageError(
    message: string = "File storage error",
    context?: ErrorContext,
    cause?: Error
  ): DatabaseError {
    return new DatabaseError(DatabaseErrorType.STORAGE_ERROR, message, {
      severity: ErrorSeverity.MEDIUM,
      userMessage: "File storage error occurred.",
      actionLabel: "Retry",
      statusCode: 500,
      context,
      cause,
    });
  }

  /**
   * Create an RLS violation error
   */
  static RlsViolationError(
    message: string = "RLS violation",
    context?: ErrorContext,
    cause?: Error
  ): DatabaseError {
    return new DatabaseError(DatabaseErrorType.RLS_VIOLATION_ERROR, message, {
      severity: ErrorSeverity.HIGH,
      userMessage: "Permission denied. Please contact support.",
      actionLabel: "Contact Support",
      statusCode: 403,
      context,
      cause,
    });
  }

  getTitle(): string {
    switch (this.databaseErrorType) {
      case DatabaseErrorType.GENERAL_ERROR:
        return "Database Error";
      case DatabaseErrorType.CONNECTION_ERROR:
        return "Connection Error";
      case DatabaseErrorType.CONSTRAINT_ERROR:
        return "Data Conflict";
      case DatabaseErrorType.RLS_VIOLATION_ERROR:
        return "Permission Denied";
      case DatabaseErrorType.ACCESS_DENIED:
        return "Access Denied";
      case DatabaseErrorType.NOT_FOUND:
        return "Not Found";
      case DatabaseErrorType.JWT_EXPIRED:
        return "Session Expired";
      case DatabaseErrorType.NETWORK_ERROR:
        return "Network Error";
      case DatabaseErrorType.STORAGE_ERROR:
        return "Storage Error";
      default:
        return "Database Error";
    }
  }

  getActionLabel(): string {
    switch (this.databaseErrorType) {
      case DatabaseErrorType.GENERAL_ERROR:
        return "Try Again";
      case DatabaseErrorType.CONNECTION_ERROR:
        return "Retry";
      case DatabaseErrorType.CONSTRAINT_ERROR:
        return "Refresh";
      case DatabaseErrorType.RLS_VIOLATION_ERROR:
        return "Contact Support";
      case DatabaseErrorType.ACCESS_DENIED:
        return "Contact Support";
      case DatabaseErrorType.NOT_FOUND:
        return "Go Back";
      case DatabaseErrorType.JWT_EXPIRED:
        return "Sign In";
      case DatabaseErrorType.NETWORK_ERROR:
        return "Retry";
      case DatabaseErrorType.STORAGE_ERROR:
        return "Retry";
      default:
        return "Try Again";
    }
  }

  static mapSupabaseErrorCodeToDatabaseError(
    supabaseErrorCode: string,
    message?: string,
    context?: ErrorContext,
    cause?: Error
  ): DatabaseError {
    switch (supabaseErrorCode) {
      case "PGRST000":
        return DatabaseError.connectionError(
          message || "Failed to connect to the database",
          context,
          cause
        );
      case "PGRST101":
        return DatabaseError.constraintError(
          message || "Database constraint violation",
          context,
          cause
        );
      case "PGRST116":
        return DatabaseError.accessDenied(
          message || "Access denied. Please check your permissions.",
          context,
          cause
        );
      case "PGRST301":
        return DatabaseError.notFound(
          message || "Resource not found",
          context,
          cause
        );
      case "42501":
        return DatabaseError.RlsViolationError(
          message || "Database RLS violation",
          context,
          cause
        );
      default:
        return DatabaseError.general(
          message || "General database error",
          context,
          cause
        );
    }
  }

  /**
   * Map error message patterns to appropriate database errors
   * Checks for JWT, network, and storage error messages
   */
  static mapErrorMessageToDatabaseError(
    error: any,
    context?: ErrorContext
  ): DatabaseError {
    const errorMessage = error?.message || "";

    if (errorMessage.includes("JWT")) {
      return DatabaseError.jwtExpired(
        errorMessage,
        context,
        error instanceof Error ? error : undefined
      );
    }

    if (errorMessage.includes("network")) {
      return DatabaseError.networkError(
        errorMessage,
        context,
        error instanceof Error ? error : undefined
      );
    }

    if (errorMessage.includes("storage")) {
      return DatabaseError.storageError(
        errorMessage,
        context,
        error instanceof Error ? error : undefined
      );
    }

    // Fall back to general error
    return DatabaseError.general(
      errorMessage || "An unexpected error occurred",
      context,
      error instanceof Error ? error : undefined
    );
  }
}
