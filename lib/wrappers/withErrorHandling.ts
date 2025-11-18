import { NextRequest, NextResponse } from "next/server";
import { ZodSchema } from "zod";
import { BaseAppError } from "../utils/error-handling/BaseAppError";
import { GeneralError } from "../utils/error-handling/GeneralError";
import { AuthError } from "../utils/error-handling/AuthError";
import { AIError } from "../utils/error-handling/AIError";
import { FileValidationError } from "../utils/error-handling/files/FileValidationError";
import { StorageError } from "../utils/error-handling/StorageError";
import { FileError } from "../utils/error-handling/files/FileError";
import { DatabaseError } from "../utils/error-handling/DatabaseError";
import { NetworkError } from "../utils/error-handling/NetworkError";
import { ValidationError } from "../utils/error-handling/ValidationError";
import { withValidation } from "./withValidation";
import { Logger } from "../utils/logger";

/**
 * Higher-order function to wrap API handlers with error handling
 * For Next.js App Router (uses NextRequest/NextResponse)
 * 
 * Usage:
 * ```typescript
 * export const GET = withErrorHandler(async (req) => {
 *   // Your API logic
 *   throw AuthError.authenticationRequired();
 * });
 * ```
 */
export function withErrorHandling(
    handler: (request: NextRequest) => Promise<NextResponse>
) {
    return async (request: NextRequest): Promise<NextResponse> => {
        try {
            return await handler(request);
        } catch (error: unknown) {
            Logger.error("API error caught", error);

            // Handle AuthError
            if (error instanceof AuthError) {
                return NextResponse.json(
                    {
                        success: false,
                        errorType: "AUTH_ERROR",
                        errorSubType: error.authErrorType,
                        error: {
                            userMessage: error.userMessage,
                            severity: error.severity,
                            timestamp: error.timestamp,
                            actionLabel: error.actionLabel,
                            context: error.context,
                        },
                    },
                    { status: error.statusCode }
                );
            }

            // Handle AIError
            if (error instanceof AIError) {
                return NextResponse.json(
                    {
                        success: false,
                        errorType: "AI_ERROR",
                        errorSubType: error.aiErrorType,
                        error: {
                            userMessage: error.userMessage,
                            message: error.message,
                            actionLabel: error.actionLabel,
                            severity: error.severity,
                            timestamp: error.timestamp,
                            context: error.context,
                        },
                    },
                    { status: error.statusCode }
                );
            }

            // Handle ValidationError
            if (error instanceof FileValidationError) {
                return NextResponse.json(
                    {
                        success: false,
                        errorType: "VALIDATION_ERROR",
                        errorSubType: error.FileValidationErrorType,
                        error: {
                            userMessage: error.userMessage,
                            message: error.message,
                            severity: error.severity,
                            timestamp: error.timestamp,
                            context: error.context,
                            actionLabel: error.actionLabel,
                        },
                    },
                    { status: error.statusCode }
                );
            }

            // Handle Zod ValidationError
            if (error instanceof ValidationError) {
                return NextResponse.json(
                    {
                        success: false,
                        errorType: "VALIDATION_ERROR",
                        error: {
                            userMessage: error.userMessage,
                            message: error.message,
                            severity: error.severity,
                            timestamp: error.timestamp,
                            context: error.context,
                            actionLabel: error.actionLabel,
                        },
                    },
                    { status: error.statusCode }
                );
            }

            // Handle StorageError
            if (error instanceof StorageError) {
                return NextResponse.json(
                    {
                        success: false,
                        errorType: "STORAGE_ERROR",
                        errorSubType: error.storageErrorType,
                        error: {
                            userMessage: error.userMessage,
                            message: error.message,
                            severity: error.severity,
                            timestamp: error.timestamp,
                            context: error.context,
                            actionLabel: error.actionLabel,
                        },
                    },
                    { status: error.statusCode }
                );
            }

            // Handle FileError
            if (error instanceof FileError) {
                return NextResponse.json(
                    {
                        success: false,
                        errorType: "FILE_ERROR",
                        errorSubType: error.FileErrorType,
                        error: {
                            userMessage: error.userMessage,
                            message: error.message,
                            severity: error.severity,
                            timestamp: error.timestamp,
                            context: error.context,
                            actionLabel: error.actionLabel,
                        },
                    },
                    { status: error.statusCode }
                );
            }

            // Handle DatabaseError
            if (error instanceof DatabaseError) {
                return NextResponse.json(
                    {
                        success: false,
                        errorType: "DATABASE_ERROR",
                        errorSubType: error.databaseErrorType,
                        error: {
                            userMessage: error.userMessage,
                            message: error.message,
                            severity: error.severity,
                            timestamp: error.timestamp,
                            context: error.context,
                            actionLabel: error.actionLabel,
                        },
                    },
                    { status: error.statusCode }
                );
            }

            // Handle NetworkError
            if (error instanceof NetworkError) {
                return NextResponse.json(
                    {
                        success: false,
                        errorType: "NETWORK_ERROR",
                        errorSubType: error.networkErrorType,
                        error: {
                            userMessage: error.userMessage,
                            message: error.message,
                            severity: error.severity,
                            timestamp: error.timestamp,
                            context: error.context,
                            actionLabel: error.actionLabel,
                        },
                    },
                    { status: error.statusCode }
                );
            }

            // Handle GeneralError
            if (error instanceof GeneralError) {
                return NextResponse.json(
                    {
                        success: false,
                        errorType: "GENERAL_ERROR",
                        errorSubType: error.generalErrorType,
                        error: {
                            userMessage: error.userMessage,
                            message: error.message,
                            severity: error.severity,
                            timestamp: error.timestamp,
                            context: error.context,
                            actionLabel: error.actionLabel,
                        },
                    },
                    { status: error.statusCode }
                );
            }

            // Handle BaseAppError (catch-all for any error extending BaseAppError)
            if (error instanceof BaseAppError) {
                return NextResponse.json(
                    {
                        success: false,
                        errorType: "GENERAL_ERROR",
                        error: {
                            userMessage: error.userMessage,
                            message: error.message,
                            severity: error.severity,
                            timestamp: error.timestamp,
                            context: error.context,
                        },
                    },
                    { status: error.statusCode }
                );
            }

            // Handle standard JavaScript errors
            if (error instanceof Error) {
                const appError = GeneralError.unknown(error.message, undefined, error);
                return NextResponse.json(
                    {
                        success: false,
                        errorType: "GENERAL_ERROR",
                        errorSubType: appError.generalErrorType,
                        error: {
                            userMessage: appError.userMessage,
                            message: error.message,
                            severity: appError.severity,
                            timestamp: appError.timestamp,
                            context: appError.context,
                        },
                    },
                    { status: appError.statusCode }
                );
            }

            // Handle unknown error types
            const unknownError = GeneralError.unknown("An unexpected error occurred");
            return NextResponse.json(
                {
                    success: false,
                    errorType: "UNKNOWN_ERROR",
                    error: {
                        userMessage: unknownError.userMessage,
                        severity: unknownError.severity,
                        timestamp: unknownError.timestamp,
                    },
                },
                { status: unknownError.statusCode }
            );
        }
    };
}

