import { BaseAppError } from "./BaseAppError";
import { ErrorSeverity } from "./BaseAppError";
export enum GeneralErrorType {
  UNKNOWN = "UNKNOWN",
  INTERNAL_SERVER = "INTERNAL_SERVER",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
  EXTERNAL_SERVICE = "EXTERNAL_SERVICE",
  PROCESSING = "PROCESSING",
  RATE_LIMIT = "RATE_LIMIT",
}

/**
 * General errors
 * Use static factory methods to create specific error types
 */
export class GeneralError extends BaseAppError {
  public readonly generalErrorType: GeneralErrorType;

  private constructor(
    generalErrorType: GeneralErrorType,
    message: string,
    options: {
      severity: ErrorSeverity;
      retryable: boolean;
      userMessage: string;
      actionLabel: string;
      statusCode: number;
      context?: any;
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
    this.generalErrorType = generalErrorType;
  }

  /**
   * Create an unknown error
   */
  static unknown(
    message: string = "Unknown error",
    context?: any,
    cause?: Error
  ): GeneralError {
    return new GeneralError(GeneralErrorType.UNKNOWN, message, {
      severity: ErrorSeverity.MEDIUM,
      retryable: true,
      userMessage: "An unexpected error occurred. Please try again.",
      actionLabel: "Try Again",
      statusCode: 500,
      context,
      cause,
    });
  }

  /**
   * Create an internal server error
   */
  static internalServer(
    message: string = "Internal server error",
    context?: any,
    cause?: Error
  ): GeneralError {
    return new GeneralError(GeneralErrorType.INTERNAL_SERVER, message, {
      severity: ErrorSeverity.HIGH,
      retryable: true,
      userMessage: "There was an internal server error. Please try again later.",
      actionLabel: "Try Again",
      statusCode: 500,
      context,
      cause,
    });
  }

  /**
   * Create a service unavailable error
   */
  static serviceUnavailable(
    message: string = "Service unavailable",
    context?: any,
    cause?: Error
  ): GeneralError {
    return new GeneralError(GeneralErrorType.SERVICE_UNAVAILABLE, message, {
      severity: ErrorSeverity.HIGH,
      retryable: true,
      userMessage: "The service is temporarily unavailable. Please try again later.",
      actionLabel: "Try Again",
      statusCode: 503,
      context,
      cause,
    });
  }

  /**
   * Create an external service error
   */
  static externalService(
    message: string = "External service error",
    context?: any,
    cause?: Error
  ): GeneralError {
    return new GeneralError(GeneralErrorType.EXTERNAL_SERVICE, message, {
      severity: ErrorSeverity.MEDIUM,
      retryable: true,
      userMessage: "An external service is temporarily unavailable.",
      actionLabel: "Try Again",
      statusCode: 502,
      context,
      cause,
    });
  }

  /**
   * Create a processing error
   */
  static processing(
    message: string = "Processing error",
    context?: any,
    cause?: Error
  ): GeneralError {
    return new GeneralError(GeneralErrorType.PROCESSING, message, {
      severity: ErrorSeverity.MEDIUM,
      retryable: true,
      userMessage: "There was an error processing your request.",
      actionLabel: "Try Again",
      statusCode: 500,
      context,
      cause,
    });
  }

  /**
   * Create a rate limit error
   */
  static rateLimit(
    message: string = "Rate limit exceeded",
    retryAfter?: number,
    context?: any,
    cause?: Error
  ): GeneralError {
    const userMessage = retryAfter
      ? `Too many requests. Please wait ${retryAfter} seconds before trying again.`
      : "Too many requests. Please wait a moment before trying again.";

    return new GeneralError(GeneralErrorType.RATE_LIMIT, message, {
      severity: ErrorSeverity.MEDIUM,
      retryable: true,
      userMessage,
      actionLabel: "Wait and Retry",
      statusCode: 429,
      context: {
        ...context,
        retryAfter,
      },
      cause,
    });
  }

  getTitle(): string {
    switch (this.generalErrorType) {
      case GeneralErrorType.UNKNOWN:
        return "Unexpected Error";
      case GeneralErrorType.INTERNAL_SERVER:
        return "Server Error";
      case GeneralErrorType.SERVICE_UNAVAILABLE:
        return "Service Unavailable";
      case GeneralErrorType.EXTERNAL_SERVICE:
        return "Service Error";
      case GeneralErrorType.PROCESSING:
        return "Processing Error";
      case GeneralErrorType.RATE_LIMIT:
        return "Rate Limit Exceeded";
      default:
        return "Error";
    }
  }

  getActionLabel(): string {
    switch (this.generalErrorType) {
      case GeneralErrorType.RATE_LIMIT:
        return "Wait and Retry";
      default:
        return "Try Again";
    }
  }
}
