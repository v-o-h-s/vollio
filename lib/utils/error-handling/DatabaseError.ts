import { BaseAppError, ErrorSeverity, ErrorContext } from "./BaseAppError";

export enum DatabaseErrorType {
  GENERAL_ERROR = "GENERAL_ERROR",
  CONNECTION_ERROR = "CONNECTION_ERROR",
  CONSTRAINT_ERROR = "CONSTRAINT_ERROR",
  RLS_VIOLATION_ERROR = "RLS_VIOLATION_ERROR"
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
      retryable: boolean;
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
      retryable: true,
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
      retryable: true,
      userMessage: "Unable to connect to the database. Please check your connection.",
      actionLabel: "Retry",
      statusCode: 503,
      context,
      cause,
    });
  }

  static RlsViolationError(
    message: string = "Database RLS violation",
    context?: ErrorContext,
    cause?: Error
  ): DatabaseError {
    return new DatabaseError(DatabaseErrorType.RLS_VIOLATION_ERROR, message, {
      severity: ErrorSeverity.MEDIUM,
      retryable: false,
      userMessage:
        "You do not have permission to access this data. Please contact support if you believe this is an error.",
      actionLabel: "Contact Support",
      statusCode: 403,
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
      retryable: false,
      userMessage:
        "There was a conflict with your data. Please refresh and try again.",
      actionLabel: "Refresh",
      statusCode: 409,
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
}
