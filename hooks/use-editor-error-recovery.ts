import { useState, useCallback } from "react";

interface UseEditorErrorRecoveryOptions {
  maxRetries?: number;
  onRecovery?: () => void;
  onMaxRetriesReached?: () => void;
}

interface UseEditorErrorRecoveryReturn {
  hasError: boolean;
  errorMessage: string | null;
  retryCount: number;
  canRetry: boolean;
  handleError: (error: Error) => void;
  handleRecovery: () => void;
  reset: () => void;
}

export function useEditorErrorRecovery({
  maxRetries = 3,
  onRecovery,
  onMaxRetriesReached,
}: UseEditorErrorRecoveryOptions = {}): UseEditorErrorRecoveryReturn {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const canRetry = retryCount < maxRetries;

  const handleError = useCallback((error: Error) => {
    console.error("Editor error:", error);
    setHasError(true);
    setErrorMessage(error.message || "An unexpected error occurred");
  }, []);

  const handleRecovery = useCallback(() => {
    if (!canRetry) {
      onMaxRetriesReached?.();
      return;
    }

    setRetryCount(prev => prev + 1);
    setHasError(false);
    setErrorMessage(null);
    onRecovery?.();
  }, [canRetry, onRecovery, onMaxRetriesReached]);

  const reset = useCallback(() => {
    setHasError(false);
    setErrorMessage(null);
    setRetryCount(0);
  }, []);

  return {
    hasError,
    errorMessage,
    retryCount,
    canRetry,
    handleError,
    handleRecovery,
    reset,
  };
}