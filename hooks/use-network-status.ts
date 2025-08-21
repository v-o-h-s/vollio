import { useEffect, useState, useCallback } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  isSlowConnection: boolean;
  connectionType: string | null;
  effectiveType: string | null;
  downlink: number | null;
  rtt: number | null;
}

export interface NetworkStatusOptions {
  onOnline?: () => void;
  onOffline?: () => void;
  onSlowConnection?: () => void;
  slowConnectionThreshold?: number; // RTT in ms
}

export function useNetworkStatus(options: NetworkStatusOptions = {}) {
  const {
    onOnline,
    onOffline,
    onSlowConnection,
    slowConnectionThreshold = 1000,
  } = options;

  const [status, setStatus] = useState<NetworkStatus>(() => {
    if (typeof navigator === 'undefined') {
      return {
        isOnline: true,
        isSlowConnection: false,
        connectionType: null,
        effectiveType: null,
        downlink: null,
        rtt: null,
      };
    }

    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    return {
      isOnline: navigator.onLine,
      isSlowConnection: connection ? connection.rtt > slowConnectionThreshold : false,
      connectionType: connection?.type || null,
      effectiveType: connection?.effectiveType || null,
      downlink: connection?.downlink || null,
      rtt: connection?.rtt || null,
    };
  });

  const updateNetworkStatus = useCallback(() => {
    if (typeof navigator === 'undefined') return;

    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    const newStatus: NetworkStatus = {
      isOnline: navigator.onLine,
      isSlowConnection: connection ? connection.rtt > slowConnectionThreshold : false,
      connectionType: connection?.type || null,
      effectiveType: connection?.effectiveType || null,
      downlink: connection?.downlink || null,
      rtt: connection?.rtt || null,
    };

    setStatus(prevStatus => {
      // Trigger callbacks for status changes
      if (prevStatus.isOnline !== newStatus.isOnline) {
        if (newStatus.isOnline) {
          onOnline?.();
        } else {
          onOffline?.();
        }
      }

      if (!prevStatus.isSlowConnection && newStatus.isSlowConnection) {
        onSlowConnection?.();
      }

      return newStatus;
    });
  }, [slowConnectionThreshold, onOnline, onOffline, onSlowConnection]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => updateNetworkStatus();
    const handleOffline = () => updateNetworkStatus();
    const handleConnectionChange = () => updateNetworkStatus();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for connection changes if supported
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, [updateNetworkStatus]);

  // Test network connectivity
  const testConnectivity = useCallback(async (): Promise<boolean> => {
    if (!navigator.onLine) return false;

    try {
      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }, []);

  return {
    ...status,
    testConnectivity,
    updateNetworkStatus,
  };
}