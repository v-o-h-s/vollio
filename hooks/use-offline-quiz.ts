import { useState, useEffect, useCallback } from 'react';
import { serviceWorkerManager, type OfflineStatus, type SyncStatus } from '@/lib/utils/service-worker';

export interface OfflineQuizData {
  id: string;
  title: string;
  questions: any[];
  metadata: {
    difficulty: string;
    questionCount: number;
    sourceDocuments: string[];
    cachedAt: string;
  };
}

export interface OfflineAttempt {
  id: string;
  quizId: string;
  answers: Record<string, any>;
  score: number;
  timeSpent: number;
  completedAt: string;
  synced: boolean;
}

export interface UseOfflineQuizReturn {
  // Status
  isOnline: boolean;
  isOfflineSupported: boolean;
  offlineStatus: OfflineStatus | null;
  syncStatus: SyncStatus | null;
  
  // Cached data
  cachedQuizzes: OfflineQuizData[];
  pendingAttempts: OfflineAttempt[];
  
  // Actions
  cacheQuizForOffline: (quizData: any) => Promise<void>;
  submitOfflineAttempt: (attempt: Omit<OfflineAttempt, 'id' | 'synced'>) => Promise<void>;
  syncPendingAttempts: () => Promise<void>;
  clearOfflineData: () => Promise<void>;
  
  // Loading states
  isCaching: boolean;
  isSyncing: boolean;
  isClearing: boolean;
}

export function useOfflineQuiz(): UseOfflineQuizReturn {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineStatus, setOfflineStatus] = useState<OfflineStatus | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [cachedQuizzes, setCachedQuizzes] = useState<OfflineQuizData[]>([]);
  const [pendingAttempts, setPendingAttempts] = useState<OfflineAttempt[]>([]);
  
  const [isCaching, setIsCaching] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const isOfflineSupported = serviceWorkerManager.isServiceWorkerSupported();

  // Update online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Setup service worker callbacks
  useEffect(() => {
    if (!isOfflineSupported) return;

    const unsubscribeOfflineStatus = serviceWorkerManager.onOfflineStatus(setOfflineStatus);
    const unsubscribeSyncStatus = serviceWorkerManager.onSyncStatus(setSyncStatus);

    // Initial status check
    serviceWorkerManager.getOfflineStatus().then(setOfflineStatus);

    return () => {
      unsubscribeOfflineStatus();
      unsubscribeSyncStatus();
    };
  }, [isOfflineSupported]);

  // Load cached data from IndexedDB
  useEffect(() => {
    loadCachedData();
  }, []);

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && pendingAttempts.length > 0) {
      console.log('🔄 Connection restored, auto-syncing pending attempts...');
      syncPendingAttempts();
    }
  }, [isOnline, pendingAttempts.length]);

  /**
   * Load cached quizzes and pending attempts from IndexedDB
   */
  const loadCachedData = useCallback(async () => {
    try {
      const db = await openOfflineDB();
      
      // Load cached quizzes
      const quizTransaction = db.transaction(['offline-quizzes'], 'readonly');
      const quizStore = quizTransaction.objectStore('offline-quizzes');
      const quizzes = await getAllFromStore(quizStore);
      setCachedQuizzes(quizzes);

      // Load pending attempts
      const attemptTransaction = db.transaction(['offline-attempts'], 'readonly');
      const attemptStore = attemptTransaction.objectStore('offline-attempts');
      const attempts = await getAllFromStore(attemptStore);
      setPendingAttempts(attempts.filter(attempt => !attempt.synced));

    } catch (error) {
      console.error('❌ Failed to load cached data:', error);
    }
  }, []);

  /**
   * Cache quiz data for offline use
   */
  const cacheQuizForOffline = useCallback(async (quizData: any) => {
    if (!isOfflineSupported) {
      throw new Error('Offline functionality not supported');
    }

    setIsCaching(true);

    try {
      // Cache in service worker
      await serviceWorkerManager.cacheQuizData(quizData);

      // Store in IndexedDB
      const offlineQuiz: OfflineQuizData = {
        id: quizData.id,
        title: quizData.title,
        questions: quizData.questions || [],
        metadata: {
          difficulty: quizData.difficulty,
          questionCount: quizData.questionCount || quizData.questions?.length || 0,
          sourceDocuments: quizData.sourceDocumentIds || [],
          cachedAt: new Date().toISOString()
        }
      };

      const db = await openOfflineDB();
      const transaction = db.transaction(['offline-quizzes'], 'readwrite');
      const store = transaction.objectStore('offline-quizzes');
      await store.put(offlineQuiz);

      // Update local state
      setCachedQuizzes(prev => {
        const existing = prev.find(q => q.id === offlineQuiz.id);
        if (existing) {
          return prev.map(q => q.id === offlineQuiz.id ? offlineQuiz : q);
        }
        return [...prev, offlineQuiz];
      });

      console.log('💾 Quiz cached for offline use:', quizData.title);
    } catch (error) {
      console.error('❌ Failed to cache quiz:', error);
      throw error;
    } finally {
      setIsCaching(false);
    }
  }, [isOfflineSupported]);

  /**
   * Submit quiz attempt for offline storage
   */
  const submitOfflineAttempt = useCallback(async (attempt: Omit<OfflineAttempt, 'id' | 'synced'>) => {
    try {
      const offlineAttempt: OfflineAttempt = {
        ...attempt,
        id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        synced: false
      };

      // Store in IndexedDB
      const db = await openOfflineDB();
      const transaction = db.transaction(['offline-attempts'], 'readwrite');
      const store = transaction.objectStore('offline-attempts');
      await store.add(offlineAttempt);

      // Update local state
      setPendingAttempts(prev => [...prev, offlineAttempt]);

      console.log('💾 Quiz attempt stored offline:', offlineAttempt.id);

      // Try to sync immediately if online
      if (isOnline) {
        syncPendingAttempts();
      }
    } catch (error) {
      console.error('❌ Failed to store offline attempt:', error);
      throw error;
    }
  }, [isOnline]);

  /**
   * Sync pending attempts to server
   */
  const syncPendingAttempts = useCallback(async () => {
    if (!isOnline || pendingAttempts.length === 0) {
      return;
    }

    setIsSyncing(true);

    try {
      const db = await openOfflineDB();
      const transaction = db.transaction(['offline-attempts'], 'readwrite');
      const store = transaction.objectStore('offline-attempts');

      let syncedCount = 0;
      let failedCount = 0;

      for (const attempt of pendingAttempts) {
        if (attempt.synced) continue;

        try {
          // Submit to server
          const response = await fetch('/api/quiz/attempts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              quiz_id: attempt.quizId,
              answers: attempt.answers,
              score: attempt.score,
              time_taken: attempt.timeSpent,
              completed_at: attempt.completedAt
            })
          });

          if (response.ok) {
            // Mark as synced in IndexedDB
            const syncedAttempt = { ...attempt, synced: true };
            await store.put(syncedAttempt);
            syncedCount++;
            
            console.log('✅ Synced offline attempt:', attempt.id);
          } else {
            console.warn('⚠️ Failed to sync attempt:', attempt.id, response.status);
            failedCount++;
          }
        } catch (error) {
          console.error('❌ Error syncing attempt:', attempt.id, error);
          failedCount++;
        }
      }

      // Update local state
      if (syncedCount > 0) {
        setPendingAttempts(prev => prev.filter(attempt => !attempt.synced));
        
        // Trigger background sync for any remaining attempts
        if (failedCount > 0) {
          await serviceWorkerManager.requestBackgroundSync();
        }
      }

      console.log(`🔄 Sync completed: ${syncedCount} synced, ${failedCount} failed`);
    } catch (error) {
      console.error('❌ Sync failed:', error);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, pendingAttempts]);

  /**
   * Clear all offline data
   */
  const clearOfflineData = useCallback(async () => {
    setIsClearing(true);

    try {
      // Clear service worker cache
      await serviceWorkerManager.clearOfflineCache();

      // Clear IndexedDB
      const db = await openOfflineDB();
      
      const quizTransaction = db.transaction(['offline-quizzes'], 'readwrite');
      await quizTransaction.objectStore('offline-quizzes').clear();
      
      const attemptTransaction = db.transaction(['offline-attempts'], 'readwrite');
      await attemptTransaction.objectStore('offline-attempts').clear();

      // Update local state
      setCachedQuizzes([]);
      setPendingAttempts([]);

      console.log('🗑️ Offline data cleared');
    } catch (error) {
      console.error('❌ Failed to clear offline data:', error);
      throw error;
    } finally {
      setIsClearing(false);
    }
  }, []);

  return {
    // Status
    isOnline,
    isOfflineSupported,
    offlineStatus,
    syncStatus,
    
    // Cached data
    cachedQuizzes,
    pendingAttempts,
    
    // Actions
    cacheQuizForOffline,
    submitOfflineAttempt,
    syncPendingAttempts,
    clearOfflineData,
    
    // Loading states
    isCaching,
    isSyncing,
    isClearing
  };
}

/**
 * Open IndexedDB for offline storage
 */
function openOfflineDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('NotoOfflineDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object stores
      if (!db.objectStoreNames.contains('offline-quizzes')) {
        db.createObjectStore('offline-quizzes', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('offline-attempts')) {
        const attemptsStore = db.createObjectStore('offline-attempts', { keyPath: 'id' });
        attemptsStore.createIndex('synced', 'synced', { unique: false });
        attemptsStore.createIndex('quizId', 'quizId', { unique: false });
      }
    };
  });
}

/**
 * Get all records from an IndexedDB object store
 */
function getAllFromStore(store: IDBObjectStore): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}