import { useCallback } from 'react';
import { useAutoSave } from './use-auto-save';
import type { EditorContent } from '@/components/editor/types';

export interface EditorAutoSaveOptions {
  noteId?: string;
  delay?: number;
  onError?: (error: Error) => void;
  onSaveStart?: () => void;
  onSaveComplete?: () => void;
  enabled?: boolean;
}

export interface EditorSaveData {
  content: EditorContent;
  title?: string;
}

export function useEditorAutoSave(
  data: EditorSaveData,
  options: EditorAutoSaveOptions
) {
  const {
    noteId,
    delay = 2000,
    onError,
    onSaveStart,
    onSaveComplete,
    enabled = true,
  } = options;

  const saveToAPI = useCallback(async (saveData: EditorSaveData) => {
    if (!noteId) {
      throw new Error('Note ID is required for saving');
    }

    const response = await fetch(`/api/notes/${noteId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: saveData.content,
        title: saveData.title,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Save failed with status ${response.status}`);
    }

    return response.json();
  }, [noteId]);

  return useAutoSave(data, {
    delay,
    onSave: saveToAPI,
    onError,
    onSaveStart,
    onSaveComplete,
    enabled: enabled && !!noteId,
  });
}