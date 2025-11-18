import { BaseAppError, ErrorSeverity, ErrorContext } from "./BaseAppError";

export enum AIErrorType {
  SERVICE_ERROR = "SERVICE_ERROR",
  QUOTA_EXCEEDED = "QUOTA_EXCEEDED",
  CONTENT_POLICY_VIOLATION = "CONTENT_POLICY_VIOLATION",
  MODEL_UNAVAILABLE = "MODEL_UNAVAILABLE",
}

/**
 * AI service errors
 * Use static factory methods to create specific error types
 */
export class AIError extends BaseAppError {
  public readonly aiErrorType: AIErrorType;

  private constructor(
    aiErrorType: AIErrorType,
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
    });
    this.aiErrorType = aiErrorType;
  }

  /**
   * Create a general AI service error
   */
  static serviceError(
    message: string = "AI service error",
    context?: ErrorContext,
  ): AIError {
    return new AIError(AIErrorType.SERVICE_ERROR, message, {
      severity: ErrorSeverity.MEDIUM,
      userMessage: "The AI service encountered an error. Please try again.",
      actionLabel: "Try Again",
      statusCode: 502,
      context,
    });
  }

  /**
   * Create an AI quota exceeded error
   */
  static quotaExceeded(
    message: string = "AI quota exceeded",
    context?: ErrorContext,
  ): AIError {
    return new AIError(AIErrorType.QUOTA_EXCEEDED, message, {
      severity: ErrorSeverity.HIGH,
      userMessage:
        "You've reached your AI usage limit. Please upgrade your plan or try again later.",
      actionLabel: "Upgrade Plan",
      statusCode: 429,
      context,
    });
  }

  /**
   * Create a content policy violation error
   */
  static contentPolicyViolation(
    message: string = "Content policy violation",
    context?: ErrorContext,
  ): AIError {
    return new AIError(AIErrorType.CONTENT_POLICY_VIOLATION, message, {
      severity: ErrorSeverity.LOW,
      userMessage:
        "Your request violates AI content policies. Please modify your request.",
      actionLabel: "Modify Request",
      statusCode: 400,
      context,
    });
  }

  /**
   * Create a model unavailable error
   */
  static modelUnavailable(
    message: string = "AI model unavailable",
    context?: ErrorContext,
    cause?: Error
  ): AIError {
    return new AIError(AIErrorType.MODEL_UNAVAILABLE, message, {
      severity: ErrorSeverity.MEDIUM,
      userMessage:
        "The requested AI model is temporarily unavailable. Using default model.",
      actionLabel: "Continue",
      statusCode: 503,
      context,
    });
  }

  getTitle(): string {
    switch (this.aiErrorType) {
      case AIErrorType.SERVICE_ERROR:
        return "AI Service Error";
      case AIErrorType.QUOTA_EXCEEDED:
        return "AI Quota Exceeded";
      case AIErrorType.CONTENT_POLICY_VIOLATION:
        return "Content Policy Violation";
      case AIErrorType.MODEL_UNAVAILABLE:
        return "AI Model Unavailable";
      default:
        return "AI Error";
    }
  }

  getActionLabel(): string {
    switch (this.aiErrorType) {
      case AIErrorType.SERVICE_ERROR:
      case AIErrorType.MODEL_UNAVAILABLE:
        return "Try Again";
      case AIErrorType.QUOTA_EXCEEDED:
        return "Upgrade Plan";
      case AIErrorType.CONTENT_POLICY_VIOLATION:
        return "Modify Request";
      default:
        return "Try Again";
    }
  }
}
