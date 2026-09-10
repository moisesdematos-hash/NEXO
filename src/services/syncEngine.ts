import { supabase } from '../lib/supabase';
import { offlineStore, PendingMutation } from '../lib/offlineStore';
import { setGlobalNetworkStatus } from '../hooks/useNetworkStatus';
import { QueryClient } from '@tanstack/react-query';

export class SyncEngine {
  private isSyncing = false;
  private queryClient: QueryClient | null = null;

  setQueryClient(client: QueryClient) {
    this.queryClient = client;
  }

  async syncPendingMutations(): Promise<{ synced: number; failed: number }> {
    if (this.isSyncing) return { synced: 0, failed: 0 };
    if (typeof navigator !== 'undefined' && !navigator.onLine) return { synced: 0, failed: 0 };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { synced: 0, failed: 0 };

    this.isSyncing = true;
    setGlobalNetworkStatus({ status: 'syncing' });

    let syncedCount = 0;
    let failedCount = 0;
    let lastError: string | null = null;

    try {
      const pendingList = await offlineStore.getPendingMutations(user.id);
      setGlobalNetworkStatus({ pendingCount: pendingList.length });

      if (pendingList.length === 0) {
        setGlobalNetworkStatus({
          status: 'online',
          pendingCount: 0,
          lastSyncedAt: new Date(),
          syncError: undefined,
        });
        this.isSyncing = false;
        return { synced: 0, failed: 0 };
      }

      // Sort by timestamp ascending to preserve sequence order
      pendingList.sort((a, b) => a.timestamp - b.timestamp);

      for (const mutation of pendingList) {
        if (mutation.retry_count >= 5) {
          console.warn(`[SyncEngine] Skipping mutation ${mutation.id} after 5 failed attempts.`);
          failedCount++;
          continue;
        }

        try {
          await offlineStore.updatePendingMutationStatus(mutation.id, 'syncing');
          await this.executeMutation(mutation, user.id);
          await offlineStore.removePendingMutation(mutation.id);
          syncedCount++;

          // Invalidate React Query cache for modified table
          if (this.queryClient) {
            this.queryClient.invalidateQueries({ queryKey: [mutation.table_name] });
          }
        } catch (err: any) {
          failedCount++;
          lastError = err?.message || 'Erro desconhecido ao sincronizar';
          console.error(`[SyncEngine] Error syncing mutation ${mutation.id}:`, err);
          await offlineStore.updatePendingMutationStatus(mutation.id, 'failed', lastError || undefined);
        }
      }

      const remainingPending = await offlineStore.getPendingMutations(user.id);
      setGlobalNetworkStatus({
        status: 'online',
        pendingCount: remainingPending.length,
        lastSyncedAt: new Date(),
        syncError: failedCount > 0 ? `${failedCount} operações pendentes` : undefined,
      });

    } catch (err: any) {
      console.error('[SyncEngine] Global sync error:', err);
      setGlobalNetworkStatus({
        status: 'online',
        syncError: err?.message || 'Erro na sincronização',
      });
    } finally {
      this.isSyncing = false;
    }

    return { synced: syncedCount, failed: failedCount };
  }

  private async executeMutation(mutation: PendingMutation, userId: string): Promise<void> {
    const { table_name, operation, payload, timestamp } = mutation;

    // Clean client-side temporary IDs if payload has a temporary string ID
    const payloadToExecute = { ...payload };
    const tempId = payloadToExecute.id && String(payloadToExecute.id).startsWith('temp-') ? payloadToExecute.id : null;
    if (tempId) {
      delete payloadToExecute.id;
    }

    if (operation === 'INSERT') {
      const { data, error } = await (supabase as any)
        .from(table_name)
        .insert(payloadToExecute)
        .select()
        .single();

      if (error) throw error;

      // Temporary ID Reconciliation & Duplicate Prevention
      if (tempId && data?.id) {
        const currentCache = (await offlineStore.getUserCache(userId, table_name)) || [];
        const reconciledCache = currentCache.map((item: any) =>
          item.id === tempId ? { ...item, ...data } : item
        );
        await offlineStore.saveUserCache(userId, table_name, reconciledCache);
      }
    } else if (operation === 'UPDATE') {
      const { id, ...updates } = payloadToExecute;
      if (!id) throw new Error('Update mutation missing record ID');

      // CONFLICT HANDLING STRATEGY (Timestamp Reconciliation & Concurrency Check)
      const { data: serverRecord } = await (supabase as any)
        .from(table_name)
        .select('updated_at')
        .eq('id', id)
        .single();

      if (serverRecord && serverRecord.updated_at) {
        const serverTimestamp = new Date(serverRecord.updated_at).getTime();
        // If server version is newer than offline edit, log conflict notice and perform last-write-wins merge
        if (serverTimestamp > timestamp) {
          console.warn(`[SyncEngine] Conflict detected on ${table_name}:${id}. Server version is newer (${serverRecord.updated_at}). Applying timestamp merge.`);
        }
      }

      const { error } = await (supabase as any)
        .from(table_name)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    } else if (operation === 'DELETE') {
      const id = payloadToExecute.id;
      if (!id) throw new Error('Delete mutation missing record ID');
      const { error } = await (supabase as any)
        .from(table_name)
        .delete()
        .eq('id', id);

      if (error) throw error;
    }
  }
}

export const syncEngine = new SyncEngine();
