/**
 * Comprehensive error handling hooks
 */

import { useState, useCallback, useRef, useEffect } from "react";
import {
  AppError,
  ErrorType,
  RetryConfig,
  DEFAULT_RETRY_CONFIG,
  ErrorRecoveryAction,
  ErrorNotificationOptions,
} from "@/lib/types/errors";
import {
  mapErrorToAppError,
  withRetry,
  logError,
  createUploadErrorContext,
  createPDFErrorContext,
  createNetworkErrorContext,
} from "@/lib/utils/error-handling/frontend-error-handling";

// Error state interface
interface ErrorState {
  error: AppError | null;
  isRetrying: boolean;
  retryCount: number;
  lastRetryAt: Date | null;
}

// Error handling hook
export function useErrorHandler() {
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isRetrying: false,
    retryCount: 0,
    lastRetryAt: null,
  });

  const handleError = useCallback((error: any, context?: any) => {
    const appError = mapErrorToAppError(error, context);
    logError(appError);

    setErrorState((prev) => ({
      ...prev,
      error: appError,
    }));

    return appError;
  }, []);

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isRetrying: false,
      retryCount: 0,
      lastRetryAt: null,
    });
  }, []);

  const retry = useCallback(
    async (operation: () => Promise<any>) => {
      if (!errorState.error?.retryable) {
        throw new Error("Error is not retryable");
      }

      setErrorState((prev) => ({
        ...prev,
        isRetrying: true,
        retryCount: prev.retryCount + 1,
        lastRetryAt: new Date(),
      }));

      try {
        const result = await operation();
        clearError();
        return result;
      } catch (error) {
        const appError = handleError(error);
        throw appError;
      } finally {
        setErrorState((prev) => ({
          ...prev,
          isRetrying: false,
        }));
      }
    },
    [errorState.error, handleError, clearError]
  );

  return {
    error: errorState.error,
    isRetrying: errorState.isRetrying,
    retryCount: errorState.retryCount,
    lastRetryAt: errorState.lastRetryAt,
    handleError,
    clearError,
    retry,
  };
}

// Retry hook with exponential backoff
export function useRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  dependencies: any[] = []
) {
  const [state, setState] = useState<{
    data: T | null;
    error: AppError | null;
    isLoading: boolean;
    isRetrying: boolean;
    retryCount: number;
  }>({
    data: null,
    error: null,
    isLoading: false,
    isRetrying: false,
    retryCount: 0,
  });

  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(
    async (isRetry = false) => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      setState((prev) => ({
        ...prev,
        isLoading: !isRetry,
        isRetrying: isRetry,
        error: null,
      }));

      try {
        const result = await withRetry(operation, retryConfig);

        setState((prev) => ({
          ...prev,
          data: result,
          error: null,
          isLoading: false,
          isRetrying: false,
        }));

        return result;
      } catch (error) {
        const appError = mapErrorToAppError(error);
        logError(appError);

        setState((prev) => ({
          ...prev,
          error: appError,
          isLoading: false,
          isRetrying: false,
          retryCount: prev.retryCount + 1,
        }));

        throw appError;
      }
    },
    [operation, retryConfig]
  );

  const retry = useCallback(() => {
    return execute(true);
  }, [execute]);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setState({
      data: null,
      error: null,
      isLoading: false,
      isRetrying: false,
      retryCount: 0,
    });
  }, []);

  // Auto-execute on dependency changes
  useEffect(() => {
    execute();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, dependencies);

  return {
    ...state,
    execute,
    retry,
    reset,
    canRetry:
      state.error?.retryable && state.retryCount < retryConfig.maxRetries,
  };
}

// Upload error handling hook
export function useUploadErrorHandler() {
  const { handleError, clearError, retry, ...errorState } = useErrorHandler();

  const handleUploadError = useCallback(
    (
      error: any,
      fileName: string,
      fileSize: number,
      fileType: string,
      uploadProgress?: number
    ) => {
      const context = createUploadErrorContext(
        fileName,
        fileSize,
        fileType,
        uploadProgress
      );
      return handleError(error, context);
    },
    [handleError]
  );

  const getRecoveryActions = useCallback(
    (fileName: string): ErrorRecoveryAction[] => {
      return [
        {
          label: "Choose Different File",
          action: () => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".pdf";
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) {
                // Trigger file selection callback
                console.log("New file selected:", file.name);
              }
            };
            input.click();
          },
        },
        {
          label: "Check File Size",
          action: () => {
            alert(
              `Current file: ${fileName}\nMaximum allowed size: 50MB\nTry compressing your PDF or selecting a smaller file.`
            );
          },
        },
      ];
    },
    []
  );

  return {
    ...errorState,
    handleUploadError,
    getRecoveryActions,
    clearError,
    retry,
  };
}

// PDF error handling hook
export function usePDFErrorHandler() {
  const { handleError, clearError, retry, ...errorState } = useErrorHandler();

  const handlePDFError = useCallback(
    (
      error: any,
      operation: "load" | "render" | "annotate" | "save",
      pdfId?: string,
      fileName?: string,
      pageNumber?: number
    ) => {
      const context = createPDFErrorContext(
        operation,
        pdfId,
        fileName,
        pageNumber
      );
      return handleError(error, context);
    },
    [handleError]
  );

  const getRecoveryActions = useCallback(
    (
      operation: "load" | "render" | "annotate" | "save",
      pdfId?: string
    ): ErrorRecoveryAction[] => {
      const actions: ErrorRecoveryAction[] = [];

      if (operation === "load") {
        actions.push(
          {
            label: "Try Different PDF",
            action: () => window.history.back(),
          },
          {
            label: "Upload New PDF",
            action: () => {
              window.location.href = "/dashboard";
            },
          }
        );
      } else if (operation === "render") {
        actions.push(
          {
            label: "Refresh Page",
            action: () => window.location.reload(),
            primary: true,
          },
          {
            label: "Go Back",
            action: () => window.history.back(),
          }
        );
      } else if (operation === "annotate" || operation === "save") {
        actions.push({
          label: "Try Again",
          action: () => {
            // This would be handled by the component
            console.log("Retrying annotation operation");
          },
          primary: true,
        });
      }

      return actions;
    },
    []
  );

  return {
    ...errorState,
    handlePDFError,
    getRecoveryActions,
    clearError,
    retry,
  };
}

// Network error handling hook
export function useNetworkErrorHandler() {
  const { handleError, clearError, retry, ...errorState } = useErrorHandler();

  const handleNetworkError = useCallback(
    (error: any, url: string, method: string, retryAttempt?: number) => {
      const context = createNetworkErrorContext(url, method, retryAttempt);
      return handleError(error, context);
    },
    [handleError]
  );

  const getRecoveryActions = useCallback((): ErrorRecoveryAction[] => {
    return [
      {
        label: "Check Connection",
        action: () => {
          if (navigator.onLine) {
            alert(
              "Your internet connection appears to be working. The issue might be with our servers."
            );
          } else {
            alert(
              "You appear to be offline. Please check your internet connection."
            );
          }
        },
      },
      {
        label: "Refresh Page",
        action: () => window.location.reload(),
      },
    ];
  }, []);

  return {
    ...errorState,
    handleNetworkError,
    getRecoveryActions,
    clearError,
    retry,
  };
}

// Global error handler hook for unhandled errors
export function useGlobalErrorHandler() {
  const { handleError } = useErrorHandler();

  useEffect(() => {
    const handleUnhandledError = (event: ErrorEvent) => {
      handleError(event.error, {
        component: "Global",
        action: "unhandled_error",
        url: window.location.href,
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      handleError(event.reason, {
        component: "Global",
        action: "unhandled_promise_rejection",
        url: window.location.href,
      });
    };

    window.addEventListener("error", handleUnhandledError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleUnhandledError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
    };
  }, [handleError]);
}

// Error recovery hook
export function useErrorRecovery() {
  const [recoveryState, setRecoveryState] = useState<{
    isRecovering: boolean;
    recoveryAttempts: number;
    lastRecoveryAt: Date | null;
  }>({
    isRecovering: false,
    recoveryAttempts: 0,
    lastRecoveryAt: null,
  });

  const attemptRecovery = useCallback(
    async (recoveryAction: () => Promise<void>, maxAttempts = 3) => {
      if (recoveryState.recoveryAttempts >= maxAttempts) {
        throw new Error("Maximum recovery attempts exceeded");
      }

      setRecoveryState((prev) => ({
        ...prev,
        isRecovering: true,
        recoveryAttempts: prev.recoveryAttempts + 1,
        lastRecoveryAt: new Date(),
      }));

      try {
        await recoveryAction();

        // Reset recovery state on success
        setRecoveryState({
          isRecovering: false,
          recoveryAttempts: 0,
          lastRecoveryAt: null,
        });
      } catch (error) {
        setRecoveryState((prev) => ({
          ...prev,
          isRecovering: false,
        }));
        throw error;
      }
    },
    [recoveryState.recoveryAttempts]
  );

  const resetRecovery = useCallback(() => {
    setRecoveryState({
      isRecovering: false,
      recoveryAttempts: 0,
      lastRecoveryAt: null,
    });
  }, []);

  return {
    ...recoveryState,
    attemptRecovery,
    resetRecovery,
    canAttemptRecovery: recoveryState.recoveryAttempts < 3,
  };
}
