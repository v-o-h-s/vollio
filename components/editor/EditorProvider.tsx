'use client';

import React, { createContext, useContext, useCallback, useState, useRef } from 'react';
import type { Editor } from '@tiptap/react';
import type { JSONContent } from '@/lib/types';

interface EditorState {
  editor: Editor | null;
  content: JSONContent | null;
  isLoading: boolean;
  error: string | null;
}

interface EditorContextValue extends EditorState {
  setEditor: (editor: Editor | null) => void;
  updateContent: (content: JSONContent) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  resetEditor: () => void;
}

const EditorContext = createContext<EditorContextValue | null>(null);

interface EditorProviderProps {
  children: React.ReactNode;
  initialContent?: JSONContent;
  onError?: (error: string) => void;
}

export function EditorProvider({ 
  children, 
  initialContent,
  onError,
}: EditorProviderProps) {
  const [state, setState] = useState<EditorState>({
    editor: null,
    content: initialContent || null,
    isLoading: false,
    error: null,
  });

  const errorTimeoutRef = useRef<NodeJS.Timeout|null>(null);

  const setEditor = useCallback((editor: Editor | null) => {
    setState(prev => ({ ...prev, editor }));
  }, []);

  const updateContent = useCallback((content: JSONContent) => {
    setState(prev => ({ 
      ...prev, 
      content
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



  const resetEditor = useCallback(() => {
    setState({
      editor: null,
      content: initialContent || null,
      isLoading: false,
      error: null,
    });
  }, [initialContent]);

  const contextValue: EditorContextValue = {
    ...state,
    setEditor,
    updateContent,
    setLoading,
    setError,
    clearError,
    resetEditor,
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