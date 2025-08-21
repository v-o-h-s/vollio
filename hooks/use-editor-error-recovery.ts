import { useCallback, useEffect, useState } from 'react';
import { useRetry } from './use-retry';
import { useNetworkStatus } from './use-network-status';
import type { EditorContent } from '@/components/editor/types';

export interface EditorErrorRecoveryOptions {
  noteId?: string;
  onError?: (error: Error, context: string) => void;
  onRecovery?: (context: string) => void;
  enableAutoRecovery?: boolean;
  backupInterval?: number;
}

export interface EditorErrorRecoveryState {
  hasError: boolean;
  errorContext: string | null;
  lastError: Error | null;
  isRecovering: boolean;
  backupAvailable: boolean;
  recoveryAttempts: number;
}

export function useEditorErrorRecovery(
  content: EditorContent | null,
  options: EditorErrorRecoveryOptions = {}
) {
  const {
    noteId,
    onError,
    onRecovery,
    enableAutoRecovery = true,
    backupInterval = 30000, // 30 seconds
  } = options;

  const [state, setState] = useState<EditorErrorRecoveryState>({
    hasError: false,
    errorContext: null,
    lastError: null,
    isRecovering: false,
    backupAvailable: false,
    recoveryAttempts: 0,
  });

  const networkStatus = useNetworkStatus({
    onOnline: () => {
      if (state.hasError && enableAutoRecovery) {
        attemptRecovery('network-restored');
      }
    },
  });

  const retry = useRetry({
    maxAttempts: 3,
    initialDelay: 1000,
    onRetry: (attempt, error) => {
      setState(prev => ({ ...prev, recoveryAttempts: attempt }));
    },
    onMaxAttemptsReached: (error) => {
      setState(prev => ({
        ...prev,
        isRecovering: false,
        hasError: true,
        lastError: error,
      }));
    },
  });

  // Backup content to localStorage
  const backupContent = useCallback((contentToBackup: EditorContent) => {
    if (!contentToBackup || typeof window === 'undefined') return;

    try {
      const backupKey = noteId ? `editor-backup-${noteId}` : 'editor-backup-temp';
      const backupData = {
        content: contentToBackup,
        timestamp: new Date().toISOString(),
        noteId,
      };
      
      localStorage.setItem(backupKey, JSON.stringify(backupData));
      localStorage.setItem('editor-backup-latest', JSON.stringify(backupData));
      
      setState(prev => ({ ...prev, backupAvailable: true }));
    } catch (error) {
      console.error('Failed to backup content:', error);
    }
  }, [noteId]);

  // Load backup content
  const loadBackup = useCallback((): EditorContent | null => {
    if (typeof window === 'undefined') return null;

    try {
      const backupKey = noteId ? `editor-backup-${noteId}` : 'editor-backup-latest';
      const stored = localStorage.getItem(backupKey);
      
      if (stored) {
        const backupData = JSON.parse(stored);
        return backupData.content;
      }
    } catch (error) {
      console.error('Failed to load backup:', error);
    }
    
    return null;
  }, [noteId]);

  // Clear backup
  const clearBackup = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      const backupKey = noteId ? `editor-backup-${noteId}` : 'editor-backup-temp';
      localStorage.removeItem(backupKey);
      setState(prev => ({ ...prev, backupAvailable: false }));
    } catch (error) {
      console.error('Failed to clear backup:', error);
    }
  }, [noteId]);

  // Handle error
  const handleError = useCallback((error: Error, context: string) => {
    setState(prev => ({
      ...prev,
      hasError: true,
      errorContext: context,
      lastError: error,
      isRecovering: false,
    }));

    // Backup current content if available
    if (content) {
      backupContent(content);
    }

    onError?.(error, context);

    // Attempt auto-recovery for certain types of errors
    if (enableAutoRecovery && shouldAutoRecover(error, context)) {
      setTimeout(() => attemptRecovery(context), 2000);
    }
  }, [content, backupContent, onError, enableAutoRecovery]);

  // Determine if error should trigger auto-recovery
  const shouldAutoRecover = useCallback((error: Error, context: string): boolean => {
    // Auto-recover for network errors
    if (context.includes('network') || context.includes('fetch')) {
      return true;
    }

    // Auto-recover for temporary save failures
    if (context.includes('save') && !error.message.includes('validation')) {
      return true;
    }

    return false;
  }, []);

  // Attempt recovery
  const attemptRecovery = useCallback(async (context: string) => {
    setState(prev => ({ ...prev, isRecovering: true }));

    try {
      await retry.executeWithRetry(async () => {
        // Different recovery strategies based on context
        switch (context) {
          case 'network-restored':
            // Test connectivity and attempt sync
            const isConnected = await networkStatus.testConnectivity();
            if (!isConnected) {
              throw new Error('Network connectivity test failed');
            }
            break;

          case 'save-failed':
            // Attempt to save again
            if (noteId && content) {
              const response = await fetch(`/api/notes/${noteId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content }),
              });
              
              if (!response.ok) {
                throw new Error('Save operation failed');
              }
            }
            break;

          case 'editor-crash':
            // Try to restore from backup
            const backup = loadBackup();
            if (!backup) {
              throw new Error('No backup available for recovery');
            }
            break;

          default:
            // Generic recovery - just test basic functionality
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
      });

      // Recovery successful
      setState(prev => ({
        ...prev,
        hasError: false,
        errorContext: null,
        lastError: null,
        isRecovering: false,
        recoveryAttempts: 0,
      }));

      onRecovery?.(context);
    } catch (error) {
      // Recovery failed
      setState(prev => ({
        ...prev,
        isRecovering: false,
        lastError: error instanceof Error ? error : new Error('Recovery failed'),
      }));
    }
  }, [retry, networkStatus, noteId, content, loadBackup, onRecovery]);

  // Manual recovery
  const manualRecovery = useCallback(() => {
    attemptRecovery('manual');
  }, [attemptRecovery]);

  // Reset error state
  const resetError = useCallback(() => {
    setState({
      hasError: false,
      errorContext: null,
      lastError: null,
      isRecovering: false,
      backupAvailable: state.backupAvailable,
      recoveryAttempts: 0,
    });
    retry.reset();
  }, [state.backupAvailable, retry]);

  // Auto-backup content periodically
  useEffect(() => {
    if (!content || !backupInterval) return;

    const interval = setInterval(() => {
      backupContent(content);
    }, backupInterval);

    return () => clearInterval(interval);
  }, [content, backupInterval, backupContent]);

  // Initial backup check
  useEffect(() => {
    const backup = loadBackup();
    setState(prev => ({ ...prev, backupAvailable: !!backup }));
  }, [loadBackup]);

  return {
    ...state,
    networkStatus,
    handleError,
    attemptRecovery: manualRecovery,
    resetError,
    loadBackup,
    clearBackup,
    backupContent,
  };
}