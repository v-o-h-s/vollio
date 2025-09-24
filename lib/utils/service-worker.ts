/**
 * Service Worker registration and management utilities
 */

export interface OfflineStatus {
  isOnline: boolean;
  isServiceWorkerSupported: boolean;
  isServiceWorkerRegistered: boolean;
  cacheSize: number;
  pendingSyncCount: number;
}

export interface SyncStatus {
  type: 'SYNC_COMPLETE' | 'SYNC_FAILED' | 'SYNC_PROGRESS';
  syncedCount?: number;
  failedCount?: number;
  totalCount?: number;
  error?: string;
}

export class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private syncCallbacks: ((status: SyncStatus) => void)[] = [];
  private offlineStatusCallbacks: ((status: OfflineStatus) => void)[] = [];

  constructor() {
    this.setupEventListeners();
  }

  /**
   * Register service worker
   */
  async registerServiceWorker(): Promise<boolean> {
    if (!this.isServiceWorkerSupported()) {
      console.warn('⚠️ Service Worker not supported in this browser');
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('✅ Service Worker registered successfully');

      // Handle updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration!.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('🔄 New Service Worker available, reload to update');
              this.notifyUpdate();
            }
          });
        }
      });

      // Setup message handling
      navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage.bind(this));

      return true;
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      return false;
    }
  }

  /**
   * Unregister service worker
   */
  async unregisterServiceWorker(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const result = await this.registration.unregister();
      console.log('🗑️ Service Worker unregistered');
      this.registration = null;
      return result;
    } catch (error) {
      console.error('❌ Service Worker unregistration failed:', error);
      return false;
    }
  }

  /**
   * Check if service worker is supported
   */
  isServiceWorkerSupported(): boolean {
    return 'serviceWorker' in navigator;
  }

  /**
   * Check if service worker is registered
   */
  isServiceWorkerRegistered(): boolean {
    return this.registration !== null;
  }

  /**
   * Cache quiz data for offline use
   */
  async cacheQuizData(quizData: any): Promise<void> {
    if (!this.registration || !this.registration.active) {
      console.warn('⚠️ Service Worker not active, cannot cache quiz data');
      return;
    }

    this.registration.active.postMessage({
      type: 'CACHE_QUIZ_DATA',
      data: quizData
    });

    console.log('💾 Requested quiz data caching:', quizData.id);
  }

  /**
   * Get offline status
   */
  async getOfflineStatus(): Promise<OfflineStatus> {
    const baseStatus: OfflineStatus = {
      isOnline: navigator.onLine,
      isServiceWorkerSupported: this.isServiceWorkerSupported(),
      isServiceWorkerRegistered: this.isServiceWorkerRegistered(),
      cacheSize: 0,
      pendingSyncCount: 0
    };

    if (!this.registration || !this.registration.active) {
      return baseStatus;
    }

    try {
      const response = await this.sendMessageToServiceWorker({
        type: 'GET_OFFLINE_STATUS'
      });

      return {
        ...baseStatus,
        cacheSize: response.cacheSize || 0,
        pendingSyncCount: response.pendingSyncCount || 0
      };
    } catch (error) {
      console.warn('⚠️ Failed to get offline status from Service Worker:', error);
      return baseStatus;
    }
  }

  /**
   * Clear offline cache
   */
  async clearOfflineCache(): Promise<void> {
    if (!this.registration || !this.registration.active) {
      console.warn('⚠️ Service Worker not active, cannot clear cache');
      return;
    }

    this.registration.active.postMessage({
      type: 'CLEAR_OFFLINE_CACHE'
    });

    console.log('🗑️ Requested offline cache clearing');
  }

  /**
   * Request background sync for offline data
   */
  async requestBackgroundSync(tag: string = 'quiz-attempts-sync'): Promise<void> {
    if (!this.registration) {
      console.warn('⚠️ Service Worker not registered, cannot request background sync');
      return;
    }

    try {
      await this.registration.sync.register(tag);
      console.log('🔄 Background sync requested:', tag);
    } catch (error) {
      console.error('❌ Background sync request failed:', error);
    }
  }

  /**
   * Add sync status callback
   */
  onSyncStatus(callback: (status: SyncStatus) => void): () => void {
    this.syncCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.syncCallbacks.indexOf(callback);
      if (index > -1) {
        this.syncCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Add offline status callback
   */
  onOfflineStatus(callback: (status: OfflineStatus) => void): () => void {
    this.offlineStatusCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.offlineStatusCallbacks.indexOf(callback);
      if (index > -1) {
        this.offlineStatusCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Online/offline status
    window.addEventListener('online', () => {
      console.log('🌐 Connection restored');
      this.notifyOfflineStatusChange();
      this.requestBackgroundSync();
    });

    window.addEventListener('offline', () => {
      console.log('🔌 Connection lost - entering offline mode');
      this.notifyOfflineStatusChange();
    });

    // Page visibility for sync triggers
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && navigator.onLine) {
        this.requestBackgroundSync();
      }
    });
  }

  /**
   * Handle messages from service worker
   */
  private handleServiceWorkerMessage(event: MessageEvent): void {
    const { type, syncedCount, failedCount, totalCount, error } = event.data;

    switch (type) {
      case 'SYNC_COMPLETE':
        console.log(`✅ Background sync completed: ${syncedCount} items synced`);
        this.notifySyncStatus({
          type: 'SYNC_COMPLETE',
          syncedCount,
          failedCount,
          totalCount
        });
        break;

      case 'SYNC_FAILED':
        console.error('❌ Background sync failed:', error);
        this.notifySyncStatus({
          type: 'SYNC_FAILED',
          error
        });
        break;

      case 'SYNC_PROGRESS':
        console.log(`🔄 Background sync progress: ${syncedCount}/${totalCount}`);
        this.notifySyncStatus({
          type: 'SYNC_PROGRESS',
          syncedCount,
          totalCount
        });
        break;
    }
  }

  /**
   * Send message to service worker and wait for response
   */
  private sendMessageToServiceWorker(message: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.registration || !this.registration.active) {
        reject(new Error('Service Worker not active'));
        return;
      }

      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data);
      };

      messageChannel.port1.onerror = (error) => {
        reject(error);
      };

      this.registration.active.postMessage(message, [messageChannel.port2]);

      // Timeout after 5 seconds
      setTimeout(() => {
        reject(new Error('Service Worker message timeout'));
      }, 5000);
    });
  }

  /**
   * Notify sync status callbacks
   */
  private notifySyncStatus(status: SyncStatus): void {
    this.syncCallbacks.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('❌ Sync callback error:', error);
      }
    });
  }

  /**
   * Notify offline status callbacks
   */
  private async notifyOfflineStatusChange(): Promise<void> {
    try {
      const status = await this.getOfflineStatus();
      this.offlineStatusCallbacks.forEach(callback => {
        try {
          callback(status);
        } catch (error) {
          console.error('❌ Offline status callback error:', error);
        }
      });
    } catch (error) {
      console.error('❌ Failed to get offline status:', error);
    }
  }

  /**
   * Notify about service worker update
   */
  private notifyUpdate(): void {
    // You can implement a toast notification or modal here
    console.log('🔄 Service Worker update available');
    
    // Optionally show update notification to user
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Noto Update Available', {
        body: 'A new version is available. Refresh to update.',
        icon: '/favicon.ico',
        tag: 'app-update'
      });
    }
  }

  /**
   * Check for service worker updates
   */
  async checkForUpdates(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      await this.registration.update();
      return true;
    } catch (error) {
      console.error('❌ Service Worker update check failed:', error);
      return false;
    }
  }

  /**
   * Get service worker state
   */
  getServiceWorkerState(): string {
    if (!this.registration) {
      return 'not-registered';
    }

    if (this.registration.installing) {
      return 'installing';
    }

    if (this.registration.waiting) {
      return 'waiting';
    }

    if (this.registration.active) {
      return 'active';
    }

    return 'unknown';
  }
}

// Export singleton instance
export const serviceWorkerManager = new ServiceWorkerManager();

// Auto-register service worker in production
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  serviceWorkerManager.registerServiceWorker().catch(error => {
    console.error('❌ Failed to register Service Worker:', error);
  });
}