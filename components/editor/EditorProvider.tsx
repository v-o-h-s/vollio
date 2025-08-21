'use client';

import React, { createContext, useContext, useCallback, useState, useRef } from 'react';
import type { Editor } from '@tiptap/react';
import type { EditorContent } from './types';
import { useEditorAutoSave } from '@/hooks/use-editor-auto-save';

interface EditorState {
  editor: Editor | null;
  content: EditorContent | null;
  isLoading: boolean;
  error: string | null;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  saveError: Error | null;
}

interface EditorContextValue extends EditorState {
  setEditor: (editor: Editor | null) => void;
  updateContent: (content: EditorContent) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  markAsSaved: () => void;
  markAsUnsaved: () => void;
  resetEditor: () => void;
  saveNow: () => Promise<void>;
  resetSaveError: () => void;
}

const EditorContext = createContext<EditorContextValue | null>(null);

interface EditorProviderProps {
  children: React.ReactNode;
  initialContent?: EditorContent;
  noteId?: string;
  title?: string;
  autoSaveEnabled?: boolean;
  autoSaveDelay?: number;
  onError?: (error: string) => void;
  onSave?: (content: EditorContent) => void;
}

export function EditorProvider({ 
  children, 
  initialContent,
  noteId,
  title,
  autoSaveEnabled = true,
  autoSaveDelay = 2000,
  onError,
  onSave
}: EditorProviderProps) {
  const [state, setState] = useState<EditorState>({
    editor: null,
    content: initialContent || null,
    isLoading: false,
    error: null,
    hasUnsavedChanges: false,
    isSaving: false,
    lastSaved: null,
    saveError: null,
  });

  const errorTimeoutRef = useRef<NodeJS.Timeout|null>(null);

  // Auto-save functionality
  const autoSaveState = useEditorAutoSave(
    { content: state.content || { type: 'doc' }, title },
    {
      noteId,
      delay: autoSaveDelay,
      enabled: autoSaveEnabled && !!state.content,
      onSaveStart: () => {
        setState(prev => ({ ...prev, isSaving: true, saveError: null }));
      },
      onSaveComplete: () => {
        setState(prev => ({ 
          ...prev, 
          isSaving: false, 
          hasUnsavedChanges: false,
          lastSaved: new Date(),
          saveError: null 
        }));
        onSave?.(state.content!);
      },
      onError: (error) => {
        setState(prev => ({ ...prev, isSaving: false, saveError: error }));
        onError?.(error.message);
      },
    }
  );

  const setEditor = useCallback((editor: Editor | null) => {
    setState(prev => ({ ...prev, editor }));
  }, []);

  const updateContent = useCallback((content: EditorContent) => {
    setState(prev => ({ 
      ...prev, 
      content,
      hasUnsavedChanges: true 
    }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
    
    if (error) {
      onError?.(error);
      
      // Auto-clear error after 5 seconds
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
      errorTimeoutRef.current = setTimeout(() => {
        setState(prev => ({ ...prev, error: null }));
      }, 5000);
    }
  }, [onError]);

  const clearError = useCallback(() => {
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const markAsSaved = useCallback(() => {
    setState(prev => ({ ...prev, hasUnsavedChanges: false }));
  }, []);

  const markAsUnsaved = useCallback(() => {
    setState(prev => ({ ...prev, hasUnsavedChanges: true }));
  }, []);

  const resetEditor = useCallback(() => {
    setState({
      editor: null,
      content: initialContent || null,
      isLoading: false,
      error: null,
      hasUnsavedChanges: false,
      isSaving: false,
      lastSaved: null,
      saveError: null,
    });
  }, [initialContent]);

  const resetSaveError = useCallback(() => {
    setState(prev => ({ ...prev, saveError: null }));
    autoSaveState.resetError();
  }, [autoSaveState]);

  const contextValue: EditorContextValue = {
    ...state,
    isSaving: autoSaveState.isSaving,
    lastSaved: autoSaveState.lastSaved,
    saveError: autoSaveState.error,
    setEditor,
    updateContent,
    setLoading,
    setError,
    clearError,
    markAsSaved,
    markAsUnsaved,
    resetEditor,
    saveNow: autoSaveState.saveNow,
    resetSaveError,
  };

  return (
    <EditorContext.Provider value={contextValue}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditorContext() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditorContext must be used within an EditorProvider');
  }
  return context;
}

// Hook for error recovery mechanisms
export function useEditorErrorRecovery() {
  const { error, clearError, resetEditor, setError } = useEditorContext();

  const retryOperation = useCallback(async (operation: () => Promise<void>) => {
    try {
      clearError();
      await operation();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
    }
  }, [clearError, setError]);

  const recoverFromError = useCallback(() => {
    clearError();
    resetEditor();
  }, [clearError, resetEditor]);

  return {
    error,
    retryOperation,
    recoverFromError,
    clearError,
  };
}