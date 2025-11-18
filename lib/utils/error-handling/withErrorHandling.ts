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
enum ErrorType {
    AUTH = "AUTH ERROR",
    AI = "AI ERROR",
    VALIDATION = "VALIDATION ERROR",
    STORAGE = "STORAGE ERROR",
    DATABASE = "DATABASE ERROR",
    NETWORK = "NETWORK ERROR",
    FILE = "FILE ERROR",
    GENERAL = "GENERAL ERROR",
    UNKNOWN = "UNKNOWN ERROR"
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
                        severity: error.severity,
                        timestamp: error.timestamp,
                        actionLabel: error.actionLabel,
                        context: error.context,
                    },
                });
            }

            if (error instanceof AIError) {
                return res.status(error.statusCode).json({
                    success: false,
                    errorType: ErrorType.AI,
                    errorSubType: error.aiErrorType,
                    error: {
                        userMessage: error.userMessage,
                        message: error.message,
                        actionLabel: error.actionLabel,
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
                        message: error.message,
                        severity: error.severity,
                        timestamp: error.timestamp,
                        context: error.context,
                        actionLabel: error.actionLabel,
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
                        message: error.message,
                        severity: error.severity,
                        timestamp: error.timestamp,
                        context: error.context,
                        actionLabel: error.actionLabel,
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
                        message: error.message,
                        severity: error.severity,
                        timestamp: error.timestamp,
                        context: error.context,
                        actionLabel: error.actionLabel,
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
                        message: error.message,
                        severity: error.severity,
                        timestamp: error.timestamp,
                        context: error.context,
                        actionLabel: error.actionLabel,
                    },
                });
            }

            if (error instanceof FileError) {
                return res.status(error.statusCode).json({
                    success: false,
                    errorType: ErrorType.FILE,
                    errorSubType: error.FileErrorType,
                    fileName: error.FileName,
                    error: {
                        userMessage: error.userMessage,
                        message: error.message,
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
                        message: error.message,
                        severity: error.severity,
                        timestamp: error.timestamp,
                        context: error.context,
                        actionLabel: error.actionLabel,
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
                        message: error.message,
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

