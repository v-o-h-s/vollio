import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { BaseAppError } from "./BaseAppError";
import { GeneralError } from "./GeneralError";
import { AuthError, AuthErrorType } from "./AuthError";
import { AIError, AIErrorType } from "./AIError";
import { ValidationError, ValidationErrorType } from "./files/ValidationError";
import { StorageError, StorageErrorType } from "./files/StorageError";
import { DatabaseError, DatabaseErrorType } from "./DatabaseError";
import { NetworkError, NetworkErrorType } from "./NetworkError";
import { FileError, FileErrorType } from "./files/FileError";
import { Logger } from "../logger";
enum ErrorType{
    AUTH="AUTH ERROR",
    AI="AI ERROR",
    VALIDATION="VALIDATION ERROR",
    STORAGE="STORAGE ERROR",
    DATABASE="DATABASE ERROR",
    NETWORK="NETWORK ERROR",
    FILE="FILE ERROR",
    GENERAL="GENERAL ERROR",
    UNKNOWN="UNKNOWN ERROR"
}
/**
 * Higher-order function to wrap API handlers with error handling
 * 
 * Usage:
 * ```typescript
 * export default withErrorHandler(async (req, res) => {
 *   // Your API logic
 *   throw AuthError.authenticationRequired();
 * });
 * ```
 */
export function withErrorHandler(handler: NextApiHandler) {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        try {
            await handler(req, res);
        } catch (error: unknown) {
            Logger.error("API error caught", error);

            // Handle specific error types
            if (error instanceof AuthError) {
                return res.status(error.statusCode).json({
                    success: false,
                    errorType: ErrorType.AUTH,
                    errorSubType: error.authErrorType,
                    error: {
                        userMessage: error.userMessage,
                        technicalMessage: error.technicalMessage,
                        severity: error.severity,
                        timestamp: error.timestamp,
                        context: error.context,
                    },
                });
            }

            if (error instanceof AIError) {
                return res.status(error.statusCode).json({
                    success: false,
                    errorType:  ErrorType.AI,
                    errorSubType: error.aiErrorType,
                    error: {
                        userMessage: error.userMessage,
                        technicalMessage: error.technicalMessage,
                        severity: error.severity,
                        timestamp: error.timestamp,
                        context: error.context,
                    },
                });
            }

            if (error instanceof ValidationError) {
                return res.status(error.statusCode).json({
                    success: false,
                    errorType: ErrorType.VALIDATION,
                    errorSubType: error.validationErrorType,
                    error: {
                        userMessage: error.userMessage,
                        technicalMessage: error.technicalMessage,
                        severity: error.severity,
                        timestamp: error.timestamp,
                        context: error.context,
                    },
                });
            }

            if (error instanceof StorageError) {
                return res.status(error.statusCode).json({
                    success: false,
                    errorType: ErrorType.STORAGE,
                    errorSubType: error.storageErrorType,
                    error: {
                        userMessage: error.userMessage,
                        technicalMessage: error.technicalMessage,
                        severity: error.severity,
                        timestamp: error.timestamp,
                        context: error.context,
                    },
                });
            }

            if (error instanceof DatabaseError) {
                return res.status(error.statusCode).json({
                    success: false,
                    errorType: ErrorType.DATABASE,
                    errorSubType: error.databaseErrorType,
                    error: {
                        userMessage: error.userMessage,
                        technicalMessage: error.technicalMessage,
                        severity: error.severity,
                        timestamp: error.timestamp,
                        context: error.context,
                    },
                });
            }

            if (error instanceof NetworkError) {
                return res.status(error.statusCode).json({
                    success: false,
                    errorType: ErrorType.NETWORK,
                    errorSubType: error.networkErrorType,
                    error: {
                        userMessage: error.userMessage,
                        technicalMessage: error.technicalMessage,
                        severity: error.severity,
                        timestamp: error.timestamp,
                        context: error.context,
                    },
                });
            }

            if (error instanceof FileError) {
                return res.status(error.statusCode).json({
                    success: false,
                    errorType: ErrorType.FILE,
                    errorSubType: error.fileErrorType,
                    fileName: error.fileName,
                    error: {
                        userMessage: error.userMessage,
                        technicalMessage: error.technicalMessage,
                        severity: error.severity,
                        timestamp: error.timestamp,
                        context: error.context,
                    },
                });
            }

            if (error instanceof GeneralError) {
                return res.status(error.statusCode).json({
                    success: false,
                    errorType: ErrorType.GENERAL,
                    errorSubType: error.generalErrorType,
                    error: {
                        userMessage: error.userMessage,
                        technicalMessage: error.technicalMessage,
                        severity: error.severity,
                        timestamp: error.timestamp,
                        context: error.context,
                    },
                });
            }

            // Handle standard JavaScript errors
            if (error instanceof Error) {
                const appError = GeneralError.unknown(error.message, undefined, error);
                return res.status(appError.statusCode).json({
                    success: false,
                    errorType: ErrorType.GENERAL,
                    errorSubType: appError.generalErrorType,
                    error: {
                        userMessage: appError.userMessage,
                        technicalMessage: error.message,
                        severity: appError.severity,
                        timestamp: appError.timestamp,
                    },
                });
            }

            // Handle unknown error types
            const unknownError = GeneralError.unknown("An unexpected error occurred");
            return res.status(unknownError.statusCode).json({
                success: false,
                errorType: ErrorType.UNKNOWN,
                error: {
                    userMessage: unknownError.userMessage,
                    severity: unknownError.severity,
                    timestamp: unknownError.timestamp,
                },
            });
        }
    };
}

/**
 * Async error boundary for use in try-catch blocks
 * 
 * Usage:
 * ```typescript
 * try {
 *   await someAsyncOperation();
 * } catch (error) {
 *   throw handleAsyncError(error);
 * }
 * ```
 */
export function handleAsyncError(error: unknown): BaseAppError {
    if (error instanceof BaseAppError) {
        return error;
    }

    if (error instanceof Error) {
        return GeneralError.unknown(error.message, undefined, error);
    }

    return GeneralError.unknown(String(error));
}

