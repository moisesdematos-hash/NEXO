import { useState, useEffect } from 'react';

export type NetworkStatusType = 'online' | 'offline' | 'reconnecting' | 'syncing';

export interface NetworkStatus {
  isOnline: boolean;
  status: NetworkStatusType;
  pendingCount: number;
  lastSyncedAt: Date | null;
  syncError: string | null;
}

// Global state listeners
type Listener = (status: NetworkStatus) => void;
const listeners = new Set<Listener>();

let globalStatus: NetworkStatus = {
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  status: typeof navigator !== 'undefined' && navigator.onLine ? 'online' : 'offline',
  pendingCount: 0,
  lastSyncedAt: null,
  syncError: null,
};

export function setGlobalNetworkStatus(updates: Partial<NetworkStatus>) {
  globalStatus = { ...globalStatus, ...updates };
  listeners.forEach((listener) => listener(globalStatus));
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>(globalStatus);

  useEffect(() => {
    listeners.add(setStatus);

    const handleOnline = () => {
      setGlobalNetworkStatus({
        isOnline: true,
        status: globalStatus.pendingCount > 0 ? 'syncing' : 'online',
        syncError: null,
      });
    };

    const handleOffline = () => {
      setGlobalNetworkStatus({
        isOnline: false,
        status: 'offline',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      listeners.delete(setStatus);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return status;
}
