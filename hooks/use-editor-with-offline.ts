import { useCallback, useEffect, useState } from 'react';
import { useOfflineStorage } from './use-offline-storage';
import { useEditorAutoSave } from './use-editor-auto-save';
import { resolveConflict, hasConflicts, createConflictData } from '@/lib/utils/conflict-resolution';
import type { EditorContent } from '@/components/editor/types';
import type { ConflictResolution } from '@/lib/utils/conflict-resolution';

export interface EditorWithOfflineOptions {
  noteId?: string;
  title?: string;
  autoSaveDelay?: number;
  syncDelay?: number;
  enabled?: boolean;
  onError?: (error: Error) => void;
  onConflict?: (resolution: ConflictResolution<EditorContent>) => void;
  onSync?: () => void;
}

export interface EditorWithOfflineState {
  content: EditorContent | null;
  isOnline: boolean;
  isSaving: boolean;
  isSyncing: boolean;
  hasUnsavedChanges: boolean;
  hasPendingChanges: boolean;
  lastSaved: Date | null;
  lastSynced: Date | null;
  saveError: Error | null;
  syncError: Error | null;
  conflictResolution: ConflictResolution<EditorContent> | null;
}

export function useEditorWithOffline(
  initialContent: EditorContent | null,
  options: EditorWithOfflineOptions
) {
  const {
    noteId,
    title,
    autoSaveDelay = 2000,
    syncDelay = 1000,
    enabled = true,
    onError,
    onConflict,
    onSync,
  } = options;

  const [state, setState] = useState<EditorWithOfflineState>({
    content: initialContent,
    isOnline: true,
    isSaving: false,
    isSyncing: false,
    hasUnsavedChanges: false,
    hasPendingChanges: false,
    lastSaved: null,
    lastSynced: null,
    saveError: null,
    syncError: null,
    conflictResolution: null,
  });

  // Generate storage key based on noteId
  const storageKey = noteId ? `editor-content-${noteId}` : 'editor-content-temp';

  // Offline storage hook
  const offlineStorage = useOfflineStorage(
    state.content ? { content: state.content, title } : null,
    {
      key: storageKey,
      syncDelay,
      enabled: enabled && !!state.content,
      onSync: async (data) => {
        if (!noteId) return;

        // Fetch current server state to check for conflicts
        const response = await fetch(`/api/notes/${noteId}`);
        if (response.ok) {
          const serverData = await response.json();
          const serverContent = serverData.data.content;

          // Check for conflicts
          if (hasConflicts(data.content, serverContent)) {
            const conflictData = createConflictData(data.content, serverContent);
            const resolution = resolveConflict(conflictData, 'merge-content');
            
            setState(prev => ({ ...prev, conflictResolution: resolution }));
            onConflict?.(resolution);

            // Use resolved content for sync
            data.content = resolution.resolved;
          }
        }

        // Sync with server
        const syncResponse = await fetch(`/api/notes/${noteId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!syncResponse.ok) {
          const errorData = await syncResponse.json().catch(() => ({}));
          throw new Error(errorData.error || 'Sync failed');
        }

        onSync?.();
      },
      onSyncError: (error) => {
        setState(prev => ({ ...prev, syncError: error }));
        onError?.(error);
      },
    }
  );

  // Auto-save hook (for online saves)
  const autoSave = useEditorAutoSave(
    { content: state.content || { type: 'doc' }, title },
    {
      noteId,
      delay: autoSaveDelay,
      enabled: enabled && offlineStorage.isOnline && !!state.content,
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
      },
      onError: (error) => {
        setState(prev => ({ ...prev, isSaving: false, saveError: error }));
        onError?.(error);
      },
    }
  );

  // Update state from offline storage
  useEffect(() => {
    setState(prev => ({
      ...prev,
      isOnline: offlineStorage.isOnline,
      isSyncing: offlineStorage.isSyncing,
      hasPendingChanges: offlineStorage.hasPendingChanges,
      lastSynced: offlineStorage.lastSynced,
      syncError: offlineStorage.syncError,
    }));
  }, [
    offlineStorage.isOnline,
    offlineStorage.isSyncing,
    offlineStorage.hasPendingChanges,
    offlineStorage.lastSynced,
    offlineStorage.syncError,
  ]);

  // Load from localStorage on mount if no initial content
  useEffect(() => {
    if (!initialContent && enabled) {
      const stored = offlineStorage.loadFromLocalStorage();
      if (stored?.content) {
        setState(prev => ({ ...prev, content: stored.content }));
      }
    }
  }, [initialContent, enabled, offlineStorage]);

  // Update content
  const updateContent = useCallback((content: EditorContent) => {
    setState(prev => ({ 
      ...prev, 
      content, 
      hasUnsavedChanges: true,
      conflictResolution: null // Clear any previous conflict resolution
    }));
  }, []);

  // Manual save
  const saveNow = useCallback(async () => {
    if (offlineStorage.isOnline) {
      await autoSave.saveNow();
    } else {
      // Just mark as having pending changes when offline
      setState(prev => ({ ...prev, hasPendingChanges: true }));
    }
  }, [offlineStorage.isOnline, autoSave]);

  // Manual sync
  const syncNow = useCallback(async () => {
    await offlineStorage.syncWithServer();
  }, [offlineStorage]);

  // Clear conflict resolution
  const clearConflictResolution = useCallback(() => {
    setState(prev => ({ ...prev, conflictResolution: null }));
  }, []);

  // Reset errors
  const resetErrors = useCallback(() => {
    setState(prev => ({ ...prev, saveError: null, syncError: null }));
    autoSave.resetError();
    offlineStorage.resetSyncError();
  }, [autoSave, offlineStorage]);

  return {
    ...state,
    updateContent,
    saveNow,
    syncNow,
    clearConflictResolution,
    resetErrors,
  };
}