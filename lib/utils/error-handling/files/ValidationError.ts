import { BaseAppError, ErrorSeverity, ErrorContext } from "../BaseAppError";

export enum ValidationErrorType {
  GENERAL_VALIDATION = "GENERAL_VALIDATION",
  FILE_TOO_LARGE = "FILE_TOO_LARGE",
  INVALID_FILE_TYPE = "INVALID_FILE_TYPE",
  INVALID_FILE_FORMAT = "INVALID_FILE_FORMAT",
}

/**
 * Validation errors
 * Use static factory methods to create specific error types
 */
export class ValidationError extends BaseAppError {
  public readonly validationErrorType: ValidationErrorType;

  private constructor(
    validationErrorType: ValidationErrorType,
    message: string,
    options: {
      severity: ErrorSeverity;
      retryable: boolean;
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
    this.validationErrorType = validationErrorType;
  }

  /**
   * Create a general validation error
   */
  static general(
    message: string = "Validation error",
  ): ValidationError {
    return new ValidationError(ValidationErrorType.GENERAL_VALIDATION, message, {
      severity: ErrorSeverity.LOW,
      retryable: false,
      userMessage: "Please check your input and try again.",
      actionLabel: "Try Again",
      statusCode: 400,
    });
  }

  /**
   * Create a file too large error
   */
  static fileTooLarge(
    maxSize: number = 50,
    context?: ErrorContext,
  ): ValidationError {
    return new ValidationError(
      ValidationErrorType.FILE_TOO_LARGE,
      `File size exceeds ${maxSize}MB`,
      {
        severity: ErrorSeverity.LOW,
        retryable: false,
        userMessage: `The selected file exceeds the maximum size limit of ${maxSize}MB.`,
        actionLabel: "Choose Another File",
        statusCode: 413,
        context,
      }
    );
  }

  /**
   * Create an invalid file type error
   */
  static invalidFileType(
    expectedType: string = "PDF",
    context?: ErrorContext,
  ): ValidationError {
    return new ValidationError(
      ValidationErrorType.INVALID_FILE_TYPE,
      `Invalid file type, expected ${expectedType}`,
      {
        severity: ErrorSeverity.LOW,
        retryable: false,
        userMessage: `Only ${expectedType} files are supported. Please select a ${expectedType} file.`,
        actionLabel: `Choose ${expectedType} File`,
        statusCode: 400,
        context,
      }
    );
  }

  /**
   * Create an invalid file format error
   */
  static invalidFileFormat(
    message: string = "Invalid file format",
    context?: ErrorContext,
  ): ValidationError {
    return new ValidationError(ValidationErrorType.INVALID_FILE_FORMAT, message, {
      severity: ErrorSeverity.LOW,
      retryable: false,
      userMessage:
        "The selected file appears to be corrupted or in an unsupported format.",
      actionLabel: "Choose Another File",
      statusCode: 400,
      context,
    });
  }

  getTitle(): string {
    switch (this.validationErrorType) {
      case ValidationErrorType.GENERAL_VALIDATION:
        return "Invalid Input";
      case ValidationErrorType.FILE_TOO_LARGE:
        return "File Too Large";
      case ValidationErrorType.INVALID_FILE_TYPE:
        return "Invalid File Type";
      case ValidationErrorType.INVALID_FILE_FORMAT:
        return "Invalid File Format";
      default:
        return "Validation Error";
    }
  }

  getActionLabel(): string {
    switch (this.validationErrorType) {
      case ValidationErrorType.GENERAL_VALIDATION:
        return "Try Again";
      case ValidationErrorType.FILE_TOO_LARGE:
      case ValidationErrorType.INVALID_FILE_FORMAT:
        return "Choose Another File";
      case ValidationErrorType.INVALID_FILE_TYPE:
        return "Choose PDF File";
      default:
        return "Try Again";
    }
  }
}
