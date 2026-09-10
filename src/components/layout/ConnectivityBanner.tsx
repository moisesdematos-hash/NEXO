import React from 'react';
import { WifiOff, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { syncEngine } from '../../services/syncEngine';

export const ConnectivityBanner: React.FC = () => {
  const { isOnline, status, pendingCount, syncError } = useNetworkStatus();

  if (isOnline && status === 'online' && pendingCount === 0 && !syncError) {
    return null; // Hidden when completely online & synced
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={`w-full text-xs font-medium px-4 py-2 flex items-center justify-between transition-colors duration-200 border-b ${
        !isOnline
          ? 'bg-amber-500/10 text-amber-900 dark:text-amber-200 border-amber-500/20'
          : status === 'syncing'
          ? 'bg-blue-500/10 text-blue-900 dark:text-blue-200 border-blue-500/20'
          : syncError
          ? 'bg-red-500/10 text-red-900 dark:text-red-200 border-red-500/20'
          : 'bg-emerald-500/10 text-emerald-900 dark:text-emerald-200 border-emerald-500/20'
      }`}
    >
      <div className="flex items-center space-x-2">
        {!isOnline && (
          <>
            <WifiOff className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />
            <span>
              <strong>Modo Offline</strong> — {pendingCount > 0 ? `${pendingCount} alterações salvas localmente ·` : ''} serão sincronizadas quando voltares a estar online.
            </span>
          </>
        )}

        {isOnline && status === 'syncing' && (
          <>
            <RefreshCw className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin shrink-0" aria-hidden="true" />
            <span>
              <strong>A sincronizar...</strong> {pendingCount > 0 ? `(${pendingCount} pendentes)` : ''}
            </span>
          </>
        )}

        {isOnline && syncError && (
          <>
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" aria-hidden="true" />
            <span>
              <strong>Erro na sincronização:</strong> {syncError}
            </span>
          </>
        )}

        {isOnline && status === 'online' && pendingCount === 0 && !syncError && (
          <>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
            <span>Tudo sincronizado com sucesso.</span>
          </>
        )}
      </div>

      {isOnline && (status === 'syncing' || syncError || pendingCount > 0) && (
        <button
          onClick={() => syncEngine.syncPendingMutations()}
          className="ml-3 underline hover:no-underline font-semibold text-xs min-h-[36px] px-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          aria-label="Sincronizar dados agora"
        >
          Sincronizar agora
        </button>
      )}
    </div>
  );
};
