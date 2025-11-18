import { BaseAppError, ErrorSeverity, ErrorContext } from "./BaseAppError";

export enum StorageErrorType {
  GENERAL_ERROR = "GENERAL_ERROR",
  QUOTA_EXCEEDED = "QUOTA_EXCEEDED",
  UPLOAD_FAILED = "UPLOAD_FAILED",
  ACCESS_DENIED = "ACCESS_DENIED",
}

/**
 * Storage errors
 * Use static factory methods to create specific error types
 */
export class StorageError extends BaseAppError {
  public readonly storageErrorType: StorageErrorType;

  private constructor(
    storageErrorType: StorageErrorType,
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
    this.storageErrorType = storageErrorType;
  }

  /**
   * Create a general storage error
   */
  static general(
    message: string = "Storage error",
    context?: ErrorContext,
  ): StorageError {
    return new StorageError(StorageErrorType.GENERAL_ERROR, message, {
      severity: ErrorSeverity.MEDIUM,
      retryable: true,
      userMessage: "There was an error saving your file. Please try again.",
      actionLabel: "Retry Upload",
      statusCode: 500,
      context,
    });
  }

  /**
   * Create a quota exceeded error
   */
  static quotaExceeded(
    message: string = "Storage quota exceeded",
    context?: ErrorContext,
  ): StorageError {
    return new StorageError(StorageErrorType.QUOTA_EXCEEDED, message, {
      severity: ErrorSeverity.MEDIUM,
      retryable: false,
      userMessage:
        "You've reached your storage limit. Please delete some files or upgrade your plan.",
      actionLabel: "Manage Storage",
      statusCode: 507,
      context,
    });
  }

  /**
   * Create an upload failed error
   */
  static uploadFailed(
    message: string = "Upload failed",
    context?: ErrorContext,
  ): StorageError {
    return new StorageError(StorageErrorType.UPLOAD_FAILED, message, {
      severity: ErrorSeverity.MEDIUM,
      retryable: true,
      userMessage:
        "Failed to upload your file. Please check your connection and try again.",
      actionLabel: "Retry Upload",
      statusCode: 500,
      context,
    });
  }

  /**
   * Create an access denied error
   */
  static accessDenied(
    message: string = "Storage access denied",
    context?: ErrorContext,
  ): StorageError {
    return new StorageError(StorageErrorType.ACCESS_DENIED, message, {
      severity: ErrorSeverity.HIGH,
      retryable: false,
      userMessage: "You don't have permission to access this file.",
      actionLabel: "Go Back",
      statusCode: 403,
      context,
    });
  }

  getTitle(): string {
    switch (this.storageErrorType) {
      case StorageErrorType.GENERAL_ERROR:
        return "Storage Error";
      case StorageErrorType.QUOTA_EXCEEDED:
        return "Storage Full";
      case StorageErrorType.UPLOAD_FAILED:
        return "Upload Failed";
      case StorageErrorType.ACCESS_DENIED:
        return "Access Denied";
      default:
        return "Storage Error";
    }
  }

  getActionLabel(): string {
    switch (this.storageErrorType) {
      case StorageErrorType.GENERAL_ERROR:
      case StorageErrorType.UPLOAD_FAILED:
        return "Retry Upload";
      case StorageErrorType.QUOTA_EXCEEDED:
        return "Manage Storage";
      case StorageErrorType.ACCESS_DENIED:
        return "Go Back";
      default:
        return "Try Again";
    }
  }
}
