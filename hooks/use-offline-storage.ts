import { useCallback, useEffect, useState } from 'react';
import { useDebounce } from './use-debounce';

export interface OfflineStorageOptions {
  key: string;
  syncDelay?: number;
  onSync?: (data: any) => Promise<void>;
  onSyncError?: (error: Error) => void;
  enabled?: boolean;
}

export interface OfflineStorageState {
  isOnline: boolean;
  isSyncing: boolean;
  hasPendingChanges: boolean;
  lastSynced: Date | null;
  syncError: Error | null;
}

export function useOfflineStorage<T>(
  data: T,
  options: OfflineStorageOptions
) {
  const {
    key,
    syncDelay = 1000,
    onSync,
    onSyncError,
    enabled = true,
  } = options;

  const [state, setState] = useState<OfflineStorageState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSyncing: false,
    hasPendingChanges: false,
    lastSynced: null,
    syncError: null,
  });

  const debouncedData = useDebounce(data, syncDelay);

  // Save to localStorage
  const saveToLocalStorage = useCallback((dataToSave: T) => {
    if (!enabled || typeof window === 'undefined') return;

    try {
      const storageData = {
        data: dataToSave,
        timestamp: new Date().toISOString(),
        synced: state.isOnline,
      };
      localStorage.setItem(key, JSON.stringify(storageData));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }, [key, enabled, state.isOnline]);

  // Load from localStorage
  const loadFromLocalStorage = useCallback((): T | null => {
    if (!enabled || typeof window === 'undefined') return null;

    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      const storageData = JSON.parse(stored);
      return storageData.data;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return null;
    }
  }, [key, enabled]);

  // Get pending changes from localStorage
  const getPendingChanges = useCallback((): T | null => {
    if (!enabled || typeof window === 'undefined') return null;

    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      const storageData = JSON.parse(stored);
      return storageData.synced ? null : storageData.data;
    } catch (error) {
      console.error('Failed to get pending changes:', error);
      return null;
    }
  }, [key, enabled]);

  // Mark as synced in localStorage
  const markAsSynced = useCallback(() => {
    if (!enabled || typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(key);
      if (!stored) return;

      const storageData = JSON.parse(stored);
      storageData.synced = true;
      storageData.lastSynced = new Date().toISOString();
      localStorage.setItem(key, JSON.stringify(storageData));

      setState(prev => ({
        ...prev,
        hasPendingChanges: false,
        lastSynced: new Date(),
        syncError: null,
      }));
    } catch (error) {
      console.error('Failed to mark as synced:', error);
    }
  }, [key, enabled]);

  // Sync with server
  const syncWithServer = useCallback(async () => {
    if (!enabled || !onSync || state.isSyncing) return;

    const pendingData = getPendingChanges();
    if (!pendingData) return;

    try {
      setState(prev => ({ ...prev, isSyncing: true, syncError: null }));
      await onSync(pendingData);
      markAsSynced();
    } catch (error) {
      const syncError = error instanceof Error ? error : new Error('Sync failed');
      setState(prev => ({ ...prev, isSyncing: false, syncError }));
      onSyncError?.(syncError);
    } finally {
      setState(prev => ({ ...prev, isSyncing: false }));
    }
  }, [enabled, onSync, state.isSyncing, getPendingChanges, markAsSynced, onSyncError]);

  // Handle online/offline status
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }));
      // Attempt to sync when coming back online
      setTimeout(syncWithServer, 1000);
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncWithServer]);

  // Save to localStorage when data changes
  useEffect(() => {
    if (data !== null && data !== undefined) {
      saveToLocalStorage(data);
      if (!state.isOnline) {
        setState(prev => ({ ...prev, hasPendingChanges: true }));
      }
    }
  }, [debouncedData, saveToLocalStorage, state.isOnline]);

  // Auto-sync when online
  useEffect(() => {
    if (state.isOnline && state.hasPendingChanges && !state.isSyncing) {
      syncWithServer();
    }
  }, [state.isOnline, state.hasPendingChanges, state.isSyncing, syncWithServer]);

  // Clear localStorage
  const clearLocalStorage = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
    setState(prev => ({ ...prev, hasPendingChanges: false }));
  }, [key]);

  // Reset sync error
  const resetSyncError = useCallback(() => {
    setState(prev => ({ ...prev, syncError: null }));
  }, []);

  return {
    ...state,
    loadFromLocalStorage,
    getPendingChanges,
    syncWithServer,
    clearLocalStorage,
    resetSyncError,
  };
}