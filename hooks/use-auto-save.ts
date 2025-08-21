import { useCallback, useEffect, useRef, useState } from 'react';
import { useDebounce } from './use-debounce';

export interface AutoSaveOptions {
  delay?: number;
  onSave: (data: any) => Promise<void>;
  onError?: (error: Error) => void;
  onSaveStart?: () => void;
  onSaveComplete?: () => void;
  enabled?: boolean;
}

export interface AutoSaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  error: Error | null;
  hasUnsavedChanges: boolean;
}

export function useAutoSave<T>(data: T, options: AutoSaveOptions) {
  const {
    delay = 2000,
    onSave,
    onError,
    onSaveStart,
    onSaveComplete,
    enabled = true,
  } = options;

  const [state, setState] = useState<AutoSaveState>({
    isSaving: false,
    lastSaved: null,
    error: null,
    hasUnsavedChanges: false,
  });

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<T>(data);
  const isInitialRender = useRef(true);

  // Debounced data to trigger auto-save
  const debouncedData = useDebounce(data, delay);

  // Manual save function
  const saveNow = useCallback(async () => {
    if (!enabled || state.isSaving) return;

    try {
      setState(prev => ({ ...prev, isSaving: true, error: null }));
      onSaveStart?.();

      await onSave(data);
      
      setState(prev => ({
        ...prev,
        isSaving: false,
        lastSaved: new Date(),
        hasUnsavedChanges: false,
        error: null,
      }));
      
      lastSavedDataRef.current = data;
      onSaveComplete?.();
    } catch (error) {
      const saveError = error instanceof Error ? error : new Error('Save failed');
      setState(prev => ({
        ...prev,
        isSaving: false,
        error: saveError,
      }));
      onError?.(saveError);
    }
  }, [data, enabled, state.isSaving, onSave, onSaveStart, onSaveComplete, onError]);

  // Auto-save effect
  useEffect(() => {
    if (!enabled || isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    // Check if data has actually changed
    const hasChanged = JSON.stringify(debouncedData) !== JSON.stringify(lastSavedDataRef.current);
    
    if (hasChanged && !state.isSaving) {
      setState(prev => ({ ...prev, hasUnsavedChanges: true }));
      saveNow();
    }
  }, [debouncedData, enabled, state.isSaving, saveNow]);

  // Mark as having unsaved changes when data changes
  useEffect(() => {
    if (!isInitialRender.current) {
      const hasChanged = JSON.stringify(data) !== JSON.stringify(lastSavedDataRef.current);
      if (hasChanged) {
        setState(prev => ({ ...prev, hasUnsavedChanges: true }));
      }
    }
  }, [data]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Reset error function
  const resetError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    saveNow,
    resetError,
  };
}