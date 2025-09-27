import { useCallback, useState } from "react";
import { useToastActions } from "@/components/ui/toast";
import {
  mapErrorToAppError,
  withRetry,
} from "@/lib/utils/error-handling";
import {
  ErrorType,
  type AppError,
  type ErrorContext,
} from "@/lib/types/errors";

interface QuizErrorHandlingOptions {
  context?: string;
  showToast?: boolean;
  retryable?: boolean;
  maxRetries?: number;
}

interface QuizErrorState {
  error: AppError | null;
  isRetrying: boolean;
  retryCount: number;
}

export function useQuizErrorHandling(options: QuizErrorHandlingOptions = {}) {
  const {
    context = "quiz",
    showToast = true,
    retryable = true,
    maxRetries = 3,
  } = options;

  const [errorState, setErrorState] = useState<QuizErrorState>({
    error: null,
    isRetrying: false,
    retryCount: 0,
  });

  const toast = useToastActions();

  // Handle different types of quiz errors
  const handleError = useCallback(
    (error: any, errorContext?: ErrorContext) => {
      const appError = mapErrorToAppError(error, {
        component: "QuizComponent",
        action: context,
        ...errorContext,
      });

      setErrorState((prev) => ({
        ...prev,
        error: appError,
        isRetrying: false,
      }));

      if (showToast) {
        // Show appropriate toast based on error type
        switch (appError.type) {
          case ErrorType.NETWORK_ERROR:
            toast.error(
              "Connection Error",
              "Please check your internet connection and try again.",
              {
                label: "Retry",
                onClick: () => window.location.reload(),
              }
            );
            break;

          case ErrorType.TIMEOUT_ERROR:
            toast.error(
              "Request Timeout",
              "The operation took too long. Please try again with simpler parameters.",
              retryable
                ? {
                    label: "Try Again",
                    onClick: () =>
                      setErrorState((prev) => ({ ...prev, error: null })),
                  }
                : undefined
            );
            break;

          case ErrorType.RATE_LIMIT_ERROR:
            toast.warning(
              "Rate Limit Exceeded",
              "Please wait a moment before trying again.",
              {
                label: "Understood",
                onClick: () => {},
              }
            );
            break;

          case ErrorType.VALIDATION_ERROR:
            toast.warning("Invalid Input", appError.userMessage, {
              label: "Fix Input",
              onClick: () =>
                setErrorState((prev) => ({ ...prev, error: null })),
            });
            break;

          case ErrorType.AUTHENTICATION_ERROR:
            toast.error(
              "Authentication Required",
              "Please sign in to continue.",
              {
                label: "Sign In",
                onClick: () => (window.location.href = "/sign-in"),
              }
            );
            break;

          case ErrorType.AUTHORIZATION_ERROR:
            toast.error(
              "Access Denied",
              "You don't have permission to perform this action.",
              {
                label: "Go Back",
                onClick: () => window.history.back(),
              }
            );
            break;

          case ErrorType.STORAGE_QUOTA_EXCEEDED:
            toast.error(
              "Storage Limit Reached",
              "Please delete some files or upgrade your plan.",
              {
                label: "Manage Files",
                onClick: () => (window.location.href = "/dashboard/pdfs"),
              }
            );
            break;

          case ErrorType.FILE_TOO_LARGE:
            toast.error(
              "File Too Large",
              "Please select a smaller PDF file (max 50MB).",
              {
                label: "Choose File",
                onClick: () =>
                  setErrorState((prev) => ({ ...prev, error: null })),
              }
            );
            break;

          case ErrorType.INVALID_FILE_TYPE:
            toast.error(
              "Invalid File Type",
              "Please select a valid PDF file.",
              {
                label: "Choose PDF",
                onClick: () =>
                  setErrorState((prev) => ({ ...prev, error: null })),
              }
            );
            break;

          case ErrorType.EXTERNAL_SERVICE_ERROR:
            if (appError.message.includes("AI service")) {
              toast.error(
                "AI Service Error",
                "The AI service is temporarily unavailable. Please try again later.",
                {
                  label: "Try Later",
                  onClick: () =>
                    setErrorState((prev) => ({ ...prev, error: null })),
                }
              );
            } else {
              toast.error(
                "Service Error",
                "An external service is temporarily unavailable.",
                retryable
                  ? {
                      label: "Retry",
                      onClick: () =>
                        setErrorState((prev) => ({ ...prev, error: null })),
                    }
                  : undefined
              );
            }
            break;

          case ErrorType.PROCESSING_ERROR:
            if (appError.message.includes("document")) {
              toast.error(
                "Document Processing Failed",
                "Unable to process the document. Please try with a different file or contact support.",
                {
                  label: "Try Different File",
                  onClick: () =>
                    setErrorState((prev) => ({ ...prev, error: null })),
                }
              );
            } else {
              toast.error(
                "Processing Error",
                appError.userMessage,
                retryable
                  ? {
                      label: "Try Again",
                      onClick: () =>
                        setErrorState((prev) => ({ ...prev, error: null })),
                    }
                  : undefined
              );
            }
            break;

          case ErrorType.DATABASE_ERROR:
            toast.error(
              "Database Error",
              "Unable to save your data. Please try again.",
              {
                label: "Retry",
                onClick: () => window.location.reload(),
              }
            );
            break;

          default:
            toast.error(
              "Unexpected Error",
              appError.userMessage || "Something went wrong. Please try again.",
              retryable
                ? {
                    label: "Try Again",
                    onClick: () =>
                      setErrorState((prev) => ({ ...prev, error: null })),
                  }
                : undefined
            );
        }
      }

      return appError;
    },
    [context, showToast, retryable, toast]
  );

  // Execute operation with error handling and retry logic
  const executeWithErrorHandling = useCallback(
    async <T>(
      operation: () => Promise<T>,
      operationContext?: ErrorContext
    ): Promise<T> => {
      try {
        setErrorState((prev) => ({ ...prev, error: null, isRetrying: false }));

        if (retryable && maxRetries > 0) {
          return await withRetry(operation, { maxRetries }, operationContext);
        } else {
          return await operation();
        }
      } catch (error) {
        handleError(error, operationContext);
        throw error;
      }
    },
    [handleError, retryable, maxRetries]
  );

  // Retry the last failed operation
  const retry = useCallback(
    async <T>(
      operation: () => Promise<T>,
      operationContext?: ErrorContext
    ): Promise<T | null> => {
      if (!retryable || errorState.retryCount >= maxRetries) {
        return null;
      }

      setErrorState((prev) => ({
        ...prev,
        isRetrying: true,
        retryCount: prev.retryCount + 1,
      }));

      try {
        const result = await operation();
        setErrorState((prev) => ({
          ...prev,
          error: null,
          isRetrying: false,
        }));

        if (showToast) {
          toast.success("Success", "Operation completed successfully.");
        }

        return result;
      } catch (error) {
        setErrorState((prev) => ({
          ...prev,
          isRetrying: false,
        }));
        handleError(error, operationContext);
        return null;
      }
    },
    [
      retryable,
      maxRetries,
      errorState.retryCount,
      showToast,
      handleError,
      toast,
    ]
  );

  // Clear error state
  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isRetrying: false,
      retryCount: 0,
    });
  }, []);

  // Create specific error handlers for common quiz operations
  const handleQuizGenerationError = useCallback(
    (error: any) => {
      return handleError(error, {
        component: "QuizGenerator",
        action: "generate_quiz",
      });
    },
    [handleError]
  );

  const handleDocumentProcessingError = useCallback(
    (error: any, documentName?: string) => {
      return handleError(error, {
        component: "DocumentProcessor",
        action: "process_document",
        fileName: documentName,
      });
    },
    [handleError]
  );

  const handleQuizSubmissionError = useCallback(
    (error: any, quizId?: string) => {
      return handleError(error, {
        component: "QuizPlayer",
        action: "submit_quiz",
        quizId,
      });
    },
    [handleError]
  );

  const handleQuizLoadingError = useCallback(
    (error: any, quizId?: string) => {
      return handleError(error, {
        component: "QuizPlayer",
        action: "load_quiz",
        quizId,
      });
    },
    [handleError]
  );

  return {
    // Error state
    error: errorState.error,
    isRetrying: errorState.isRetrying,
    retryCount: errorState.retryCount,
    canRetry: retryable && errorState.retryCount < maxRetries,

    // Generic handlers
    handleError,
    executeWithErrorHandling,
    retry,
    clearError,

    // Specific handlers
    handleQuizGenerationError,
    handleDocumentProcessingError,
    handleQuizSubmissionError,
    handleQuizLoadingError,

    // Utility functions
    isNetworkError: errorState.error?.type === ErrorType.NETWORK_ERROR,
    isValidationError: errorState.error?.type === ErrorType.VALIDATION_ERROR,
    isAuthError: [
      ErrorType.AUTHENTICATION_ERROR,
      ErrorType.AUTHORIZATION_ERROR,
    ].includes(errorState.error?.type as ErrorType),
    isRetryableError: errorState.error?.retryable ?? false,
  };
}

// Specialized hooks for different quiz contexts
export function useQuizGenerationErrorHandling() {
  return useQuizErrorHandling({
    context: "quiz_generation",
    retryable: true,
    maxRetries: 2,
  });
}

export function useDocumentProcessingErrorHandling() {
  return useQuizErrorHandling({
    context: "document_processing",
    retryable: true,
    maxRetries: 3,
  });
}

export function useQuizPlayerErrorHandling() {
  return useQuizErrorHandling({
    context: "quiz_player",
    retryable: true,
    maxRetries: 2,
  });
}

export function useQuizResultsErrorHandling() {
  return useQuizErrorHandling({
    context: "quiz_results",
    retryable: false,
  });
}
