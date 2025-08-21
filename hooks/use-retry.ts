import { useCallback, useState, useRef } from 'react';

export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  onRetry?: (attempt: number, error: Error) => void;
  onMaxAttemptsReached?: (error: Error) => void;
}

export interface RetryState {
  isRetrying: boolean;
  attempt: number;
  lastError: Error | null;
  canRetry: boolean;
}

export function useRetry(options: RetryOptions = {}) {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    onRetry,
    onMaxAttemptsReached,
  } = options;

  const [state, setState] = useState<RetryState>({
    isRetrying: false,
    attempt: 0,
    lastError: null,
    canRetry: true,
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const calculateDelay = useCallback((attempt: number) => {
    const delay = initialDelay * Math.pow(backoffFactor, attempt - 1);
    return Math.min(delay, maxDelay);
  }, [initialDelay, backoffFactor, maxDelay]);

  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>
  ): Promise<T> => {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        setState(prev => ({
          ...prev,
          isRetrying: attempt > 1,
          attempt,
          canRetry: attempt < maxAttempts,
        }));

        const result = await operation();
        
        // Success - reset state
        setState({
          isRetrying: false,
          attempt: 0,
          lastError: null,
          canRetry: true,
        });

        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        setState(prev => ({
          ...prev,
          lastError,
          canRetry: attempt < maxAttempts,
        }));

        if (attempt < maxAttempts) {
          onRetry?.(attempt, lastError);
          
          // Wait before retrying
          const delay = calculateDelay(attempt);
          await new Promise(resolve => {
            timeoutRef.current = setTimeout(resolve, delay);
          });
        } else {
          // Max attempts reached
          setState(prev => ({
            ...prev,
            isRetrying: false,
            canRetry: false,
          }));
          
          onMaxAttemptsReached?.(lastError);
        }
      }
    }

    throw lastError!;
  }, [maxAttempts, onRetry, onMaxAttemptsReached, calculateDelay]);

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    setState({
      isRetrying: false,
      attempt: 0,
      lastError: null,
      canRetry: true,
    });
  }, []);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    setState(prev => ({
      ...prev,
      isRetrying: false,
      canRetry: false,
    }));
  }, []);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return {
    ...state,
    executeWithRetry,
    reset,
    cancel,
    cleanup,
  };
}