import { BaseAppError, ErrorSeverity } from "../BaseAppError";

export enum FileErrorType {
  GENERAL_ERROR = "GENERAL_ERROR",
  LOADING_ERROR = "LOADING_ERROR",
  RENDERING_ERROR = "RENDERING_ERROR",
  CORRUPTED = "CORRUPTED",

}

/**
 * File errors
 * Use static factory methods to create specific error types
 */
export class FileError extends BaseAppError {
  public readonly FileErrorType: FileErrorType;
  public readonly FileName: string
  private constructor(
    FileName: string,
    FileErrorType: FileErrorType,
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
    this.FileErrorType = FileErrorType;
    this.FileName = FileName
  }

  /**
   * Create a general File error
   */
  static general(
    message: string = "File error",
    fileName: string = "file",
    context?: any,
  ): FileError {
    return new FileError(fileName, FileErrorType.GENERAL_ERROR, message, {
      severity: ErrorSeverity.MEDIUM,
      userMessage: `There was an error with the file ${fileName}.`,
      statusCode: 422,
      context,
      actionLabel: "Retry",
    });
  }

  /**
   * Create a loading error
   */
  static loadingError(
    message: string = "File loading failed",
    fileName: string = "file",
    context?: any,
  ): FileError {
    return new FileError(fileName, FileErrorType.LOADING_ERROR, message, {
      severity: ErrorSeverity.MEDIUM,
      userMessage: `Unable to load the file ${fileName}. The file might be corrupted.`,
      statusCode: 422,
      context,
      actionLabel: "Retry Loading",
    });
  }



  /**
   * Create a corrupted file error
   */
  static corrupted(
    message: string = "File file is corrupted",
    fileName: string = "file",
    context?: any ,
  ): FileError {
    return new FileError(fileName, FileErrorType.CORRUPTED, message, {
      severity: ErrorSeverity.HIGH,
      userMessage: `The file ${fileName} appears to be corrupted and cannot be opened.`,
      statusCode: 422,
      context,
      actionLabel: "Choose Another File",
    });
  }

  getTitle(): string {
    switch (this.FileErrorType) {
      case FileErrorType.GENERAL_ERROR:
        return "File Error";
      case FileErrorType.LOADING_ERROR:
        return "File Loading Failed";
      case FileErrorType.RENDERING_ERROR:
        return "File Display Error";
      case FileErrorType.CORRUPTED:
        return "Corrupted File";
      default:
        return "File Error";
    }
  }

}
