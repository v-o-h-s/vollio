import { BaseAppError, ErrorSeverity } from "../BaseAppError";

export enum DocumentErrorType {
  GENERAL_ERROR = "GENERAL_ERROR",
  LOADING_ERROR = "LOADING_ERROR",
  RENDERING_ERROR = "RENDERING_ERROR",
  CORRUPTED = "CORRUPTED",

}

/**
 * Document errors
 * Use static factory methods to create specific error types
 */
export class DocumentError extends BaseAppError {
  public readonly DocumentErrorType: DocumentErrorType;
  public readonly DocumentName: string
  private constructor(
    DocumentName: string,
    DocumentErrorType: DocumentErrorType,
    message: string,
    options: {
      severity: ErrorSeverity;
      userMessage: string;
      statusCode: number;
      context?: any;
      technicalMessage?: string;
      actionLabel?: string;
    }
  ) {
    super(message, {

      severity: options.severity,
      userMessage: options.userMessage,
      statusCode: options.statusCode,
      context: options.context,
      actionLabel: options.actionLabel,
    });
    this.DocumentErrorType = DocumentErrorType;
    this.DocumentName = DocumentName
  }

  /**
   * Create a general Document error
   */
  static general(
    message: string = "Document error",
    documentName: string = "document",
    context?: any,
  ): DocumentError {
    return new DocumentError(documentName, DocumentErrorType.GENERAL_ERROR, message, {
      severity: ErrorSeverity.MEDIUM,
      userMessage: `There was an error with the document ${documentName}.`,
      statusCode: 422,
      context,
      actionLabel: "Retry",
    });
  }

  /**
   * Create a loading error
   */
  static loadingError(
    message: string = "Document loading failed",
    documentName: string = "document",
    context?: any,
  ): DocumentError {
    return new DocumentError(documentName, DocumentErrorType.LOADING_ERROR, message, {
      severity: ErrorSeverity.MEDIUM,
      userMessage: `Unable to load the document ${documentName}. The document might be corrupted.`,
      statusCode: 422,
      context,
      actionLabel: "Retry Loading",
    });
  }



  /**
   * Create a corrupted document error
   */
  static corrupted(
    message: string = "Document document is corrupted",
    documentName: string = "document",
    context?: any ,
  ): DocumentError {
    return new DocumentError(documentName, DocumentErrorType.CORRUPTED, message, {
      severity: ErrorSeverity.HIGH,
      userMessage: `The document ${documentName} appears to be corrupted and cannot be opened.`,
      statusCode: 422,
      context,
      actionLabel: "Choose Another Document",
    });
  }

  getTitle(): string {
    switch (this.DocumentErrorType) {
      case DocumentErrorType.GENERAL_ERROR:
        return "Document Error";
      case DocumentErrorType.LOADING_ERROR:
        return "Document Loading Failed";
      case DocumentErrorType.RENDERING_ERROR:
        return "Document Display Error";
      case DocumentErrorType.CORRUPTED:
        return "Corrupted Document";
      default:
        return "Document Error";
    }
  }

}
