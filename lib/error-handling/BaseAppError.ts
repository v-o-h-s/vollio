/**
 * Base error class that all application errors extend from
 */

export enum ErrorSeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}
// TODO :update the type of context

export abstract class BaseAppError extends Error {
  public readonly timestamp: Date;
  public readonly severity: ErrorSeverity;
  public readonly userMessage: string;
  public readonly technicalMessage?: string;
  public readonly statusCode: number;
  public readonly context?: any;
  public readonly details?: any;
  public readonly actionLabel?: string;
  public readonly cause?: Error;

  constructor(
    message: string,
    options: {
      severity: ErrorSeverity;
      userMessage: string;
      statusCode: number;
      context?: any;
      actionLabel?: string;
      cause?: Error;
    }
  ) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date();
    this.severity = options.severity;
    this.userMessage = options.userMessage;
    this.statusCode = options.statusCode;
    this.context = options.context;
    this.actionLabel = options.actionLabel;
    this.cause = options.cause;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Get the title for this error (used in UI)
   */
  abstract getTitle(): string;

  /**
   * Get a user-friendly error message with context
   */
  getDisplayMessage() {
    return this.userMessage;
  }

  /**
   * Get the action label for this error (used in UI)
   */
  getActionLabel() {
    return this.actionLabel;
  }

  /**
   * Convert error to a JSON-serializable object
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      userMessage: this.userMessage,
      technicalMessage: this.technicalMessage,
      severity: this.severity,
      statusCode: this.statusCode,
      timestamp: this.timestamp.toISOString(),
      context: this.context,
      details: this.details,
      stack: this.stack,
    };
  }
}
