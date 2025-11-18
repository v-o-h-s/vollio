import { BaseAppError, ErrorSeverity, ErrorContext } from "./BaseAppError";

export enum DatabaseErrorType {
  GENERAL_ERROR = "GENERAL_ERROR",
  CONNECTION_ERROR = "CONNECTION_ERROR",
  CONSTRAINT_ERROR = "CONSTRAINT_ERROR",
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
      technicalMessage: message,
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
}
