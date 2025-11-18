import { BaseAppError, ErrorSeverity, ErrorContext } from "./BaseAppError";

export enum NetworkErrorType {
  GENERAL_ERROR = "GENERAL_ERROR",
  TIMEOUT = "TIMEOUT",
  CONNECTION_FAILED = "CONNECTION_FAILED",
}

/**
 * Network errors
 * Use static factory methods to create specific error types
 */
export class NetworkError extends BaseAppError {
  public readonly networkErrorType: NetworkErrorType;

  private constructor(
    networkErrorType: NetworkErrorType,
    message: string,
    options: {
      severity: ErrorSeverity;
      userMessage: string;
      actionLabel: string;
      statusCode: number;
      context?: ErrorContext;
    }
  ) {
    super(message, {
      severity: options.severity,
      userMessage: options.userMessage,
      technicalMessage: message,
      statusCode: options.statusCode,
      context: options.context,
      actionLabel: options.actionLabel,
    });
    this.networkErrorType = networkErrorType;
  }

  /**
   * Create a general network error
   */
  static general(
    message: string = "Network error",
    context?: ErrorContext
  ): NetworkError {
    return new NetworkError(NetworkErrorType.GENERAL_ERROR, message, {
      severity: ErrorSeverity.MEDIUM,
      userMessage: "Please check your internet connection and try again.",
      actionLabel: "Retry",
      statusCode: 503,
      context,
    });
  }

  /**
   * Create a timeout error
   */
  static timeout(
    message: string = "Request timeout",
    context?: ErrorContext,
  ): NetworkError {
    return new NetworkError(NetworkErrorType.TIMEOUT, message, {
      severity: ErrorSeverity.MEDIUM,
      userMessage: "The request took too long to complete. Please try again.",
      actionLabel: "Try Again",
      statusCode: 504,
      context,
    });
  }

  /**
   * Create a connection failed error
   */
  static connectionFailed(
    message: string = "Connection failed",
    context?: ErrorContext,
    cause?: Error
  ): NetworkError {
    return new NetworkError(NetworkErrorType.CONNECTION_FAILED, message, {
      severity: ErrorSeverity.HIGH,
      userMessage: "Unable to connect to the server. Please check your connection.",
      actionLabel: "Retry",
      statusCode: 503,
      context,
    });
  }

  getTitle(): string {
    switch (this.networkErrorType) {
      case NetworkErrorType.GENERAL_ERROR:
        return "Network Error";
      case NetworkErrorType.TIMEOUT:
        return "Request Timeout";
      case NetworkErrorType.CONNECTION_FAILED:
        return "Connection Failed";
      default:
        return "Network Error";
    }
  }

  getActionLabel(): string {
    switch (this.networkErrorType) {
      case NetworkErrorType.GENERAL_ERROR:
      case NetworkErrorType.CONNECTION_FAILED:
        return "Retry";
      case NetworkErrorType.TIMEOUT:
        return "Try Again";
      default:
        return "Retry";
    }
  }
}
