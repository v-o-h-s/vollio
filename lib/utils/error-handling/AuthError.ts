import { BaseAppError, ErrorSeverity, ErrorContext } from "./BaseAppError";

export enum AuthErrorType {
  AUTHENTICATION_REQUIRED = "AUTHENTICATION_REQUIRED",
  AUTHORIZATION_DENIED = "AUTHORIZATION_DENIED",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
}

/**
 * Authentication and authorization errors
 * Use static factory methods to create specific error types
 */
export class AuthError extends BaseAppError {
  public readonly authErrorType: AuthErrorType;

  private constructor(
    authErrorType: AuthErrorType,
    message: string,
    options: {
      severity: ErrorSeverity;
      userMessage: string;
      technicalMessage?: string;
      statusCode: number;
      context?: ErrorContext;
      actionLabel?: string;
    }
  ) {
    super(message, {
      severity: options.severity,
      userMessage: options.userMessage,
      statusCode: options.statusCode,
      context: options.context,
      actionLabel: options.actionLabel,});
    this.authErrorType = authErrorType;
  }

  /**
   * Create an authentication required error
   */
  static authenticationRequired(
    message: string = "Authentication required",
    context?: ErrorContext,
  ): AuthError {
    return new AuthError(
      AuthErrorType.AUTHENTICATION_REQUIRED,
      message,
      {

        severity: ErrorSeverity.HIGH,
        userMessage: "Please sign in to continue using Noto.",
        actionLabel: "Sign In",
        statusCode: 401,
        context,

      }
    );
  }

  /**
   * Create an authorization denied error
   */
  static authorizationDenied(
    message: string = "Access denied",
    context?: ErrorContext,
    cause?: Error
  ): AuthError {
    return new AuthError(
      AuthErrorType.AUTHORIZATION_DENIED,
      message,
      {
        severity: ErrorSeverity.HIGH,
        userMessage: "You don't have permission to access this resource.",
        actionLabel: "Go Back",
        statusCode: 403,
        context,
      }
    );
  }

  /**
   * Create a token expired error
   */
  static tokenExpired(
    message: string = "Token expired",
    context?: ErrorContext,
    cause?: Error
  ): AuthError {
    return new AuthError(
      AuthErrorType.TOKEN_EXPIRED,
      message,
      {
        severity: ErrorSeverity.MEDIUM,
        userMessage: "Your session has expired. Please sign in again.",
        actionLabel: "Sign In",
        statusCode: 401,
        context,

      }
    );
  }

  getTitle(): string {
    switch (this.authErrorType) {
      case AuthErrorType.AUTHENTICATION_REQUIRED:
        return "Authentication Required";
      case AuthErrorType.AUTHORIZATION_DENIED:
        return "Access Denied";
      case AuthErrorType.TOKEN_EXPIRED:
        return "Session Expired";
      default:
        return "Authentication Error";
    }
  }

  getActionLabel(): string {
    switch (this.authErrorType) {
      case AuthErrorType.AUTHENTICATION_REQUIRED:
      case AuthErrorType.TOKEN_EXPIRED:
        return "Sign In";
      case AuthErrorType.AUTHORIZATION_DENIED:
        return "Go Back";
      default:
        return "Try Again";
    }
  }
}
