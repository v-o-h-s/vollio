import { BaseAppError, ErrorSeverity, } from "../BaseAppError";

export enum DocumentValidationErrorType {
  GENERAL_VALIDATION = "GENERAL_VALIDATION",
  FILE_TOO_LARGE = "FILE_TOO_LARGE",
  INVALID_FILE_TYPE = "INVALID_FILE_TYPE",
  INVALID_FILE_FORMAT = "INVALID_FILE_FORMAT",
}

/**
 * Validation errors
 * Use static factory methods to create specific error types
 */
export class DocumentValidationError extends BaseAppError {
  public readonly DocumentValidationErrorType: DocumentValidationErrorType;

  private constructor(
    DocumentValidationErrorType: DocumentValidationErrorType,
    message: string,
    options: {
      context?: any;
      severity: ErrorSeverity;
      retryable: boolean;
      userMessage: string;
      actionLabel: string;
      statusCode: number;
    }
  ) {
    super(message, {
      severity: options.severity,
      userMessage: options.userMessage,
      statusCode: options.statusCode,
      context: options.context,
    });
    this.DocumentValidationErrorType = DocumentValidationErrorType;
  }

  /**
   * Create a general validation error
   */
  static general(
    message: string = "Validation error",
  ): DocumentValidationError {
    return new DocumentValidationError(DocumentValidationErrorType.GENERAL_VALIDATION, message, {
      severity: ErrorSeverity.LOW,
      retryable: false,
      userMessage: "Please check your input and try again.",
      actionLabel: "Try Again",
      statusCode: 400,
    });
  }

  /**
   * Create a document too large error
   */
  static documentTooLarge(
    maxSize: number = 50,
    context?: any,
  ): DocumentValidationError {
    return new DocumentValidationError(
      DocumentValidationErrorType.FILE_TOO_LARGE,
      `Document size exceeds ${maxSize}MB`,
      {
        severity: ErrorSeverity.LOW,
        retryable: false,
        userMessage: `The selected document exceeds the maximum size limit of ${maxSize}MB.`,
        actionLabel: "Choose Another Document",
        statusCode: 413,
        context,
      }
    );
  }

  /**
   * Create an invalid document type error
   */
  static invalidDocumentType(
    expectedType: string = "Document",
    context?: any,
  ): DocumentValidationError {
    return new DocumentValidationError(
      DocumentValidationErrorType.INVALID_FILE_TYPE,
      `Invalid document type, expected ${expectedType}`,
      {
        severity: ErrorSeverity.LOW,
        retryable: false,
        userMessage: `Only ${expectedType} documents are supported. Please select a ${expectedType} document.`,
        actionLabel: `Choose ${expectedType} Document`,
        statusCode: 400,
        context,
      }
    );
  }

  /**
   * Create an invalid document format error
   */
  static invalidDocumentFormat(
    message: string = "Invalid document format",
    context?: any,
  ): DocumentValidationError {
    return new DocumentValidationError(DocumentValidationErrorType.INVALID_FILE_FORMAT, message, {
      severity: ErrorSeverity.LOW,
      retryable: false,
      userMessage:
        "The selected document appears to be corrupted or in an unsupported format.",
      actionLabel: "Choose Another Document",
      statusCode: 400,
      context,
    });
  }

  /**
   * Create a field required error
   */
  static fieldRequired(
    fieldName: string,
    context?: any,
  ): DocumentValidationError {
    return new DocumentValidationError(DocumentValidationErrorType.GENERAL_VALIDATION, `${fieldName} is required`, {
      severity: ErrorSeverity.LOW,
      retryable: false,
      userMessage: `${fieldName} is required. Please provide a value.`,
      actionLabel: "Try Again",
      statusCode: 400,
      context,
    });
  }

  /**
   * Create a field length invalid error
   */
  static fieldLengthInvalid(
    fieldName: string,
    minLength: number,
    maxLength: number,
    context?: any,
  ): DocumentValidationError {
    return new DocumentValidationError(
      DocumentValidationErrorType.GENERAL_VALIDATION,
      `${fieldName} must be between ${minLength} and ${maxLength} characters`,
      {
        severity: ErrorSeverity.LOW,
        retryable: false,
        userMessage: `${fieldName} must be between ${minLength} and ${maxLength} characters long.`,
        actionLabel: "Try Again",
        statusCode: 400,
        context,
      }
    );
  }

  /**
   * Create an invalid format error (for non-document fields)
   */
  static invalidFormat(
    fieldName: string,
    expectedFormat: string,
    context?: any,
  ): DocumentValidationError {
    return new DocumentValidationError(
      DocumentValidationErrorType.GENERAL_VALIDATION,
      `${fieldName} has invalid format`,
      {
        severity: ErrorSeverity.LOW,
        retryable: false,
        userMessage: `${fieldName} must be in the format: ${expectedFormat}`,
        actionLabel: "Try Again",
        statusCode: 400,
        context,
      }
    );
  }

  /**
   * Create a duplicate value error
   */
  static duplicateValue(
    fieldName: string,
    message: string = "This value already exists",
    context?: any,
  ): DocumentValidationError {
    return new DocumentValidationError(
      DocumentValidationErrorType.GENERAL_VALIDATION,
      `Duplicate ${fieldName}: ${message}`,
      {
        severity: ErrorSeverity.LOW,
        retryable: false,
        userMessage: message,
        actionLabel: "Try Again",
        statusCode: 409,
        context,
      }
    );
  }

  getTitle(): string {
    switch (this.DocumentValidationErrorType) {
      case DocumentValidationErrorType.GENERAL_VALIDATION:
        return "Invalid Input";
      case DocumentValidationErrorType.FILE_TOO_LARGE:
        return "Document Too Large";
      case DocumentValidationErrorType.INVALID_FILE_TYPE:
        return "Invalid Document Type";
      case DocumentValidationErrorType.INVALID_FILE_FORMAT:
        return "Invalid Document Format";
      default:
        return "Validation Error";
    }
  }

  getActionLabel(): string {
    switch (this.DocumentValidationErrorType) {
      case DocumentValidationErrorType.GENERAL_VALIDATION:
        return "Try Again";
      case DocumentValidationErrorType.FILE_TOO_LARGE:
      case DocumentValidationErrorType.INVALID_FILE_FORMAT:
        return "Choose Another Document";
      case DocumentValidationErrorType.INVALID_FILE_TYPE:
        return "Choose document";
      default:
        return "Try Again";
    }
  }
}
