// NEXO IndexedDB Offline Storage Engine
const DB_NAME = 'NEXO_OfflineDB';
const DB_VERSION = 1;

export interface PendingMutation {
  id: string;
  user_id: string;
  table_name: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  payload: Record<string, any>;
  timestamp: number;
  status: 'pending' | 'syncing' | 'failed';
  error?: string;
  retry_count: number;
}

export interface UserCachedTable {
  key: string; // `${user_id}:${table_name}`
  user_id: string;
  table_name: string;
  data: any[];
  timestamp: number;
}

class OfflineStore {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private memoryCache = new Map<string, any[]>();

  private isIndexedDBAvailable(): boolean {
    return typeof window !== 'undefined' && typeof indexedDB !== 'undefined';
  }

  private getDB(): Promise<IDBDatabase> {
    if (!this.isIndexedDBAvailable()) {
      return Promise.reject(new Error('indexedDB not available'));
    }
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('user_cache')) {
          const cacheStore = db.createObjectStore('user_cache', { keyPath: 'key' });
          cacheStore.createIndex('user_id', 'user_id', { unique: false });
        }

        if (!db.objectStoreNames.contains('pending_mutations')) {
          const mutStore = db.createObjectStore('pending_mutations', { keyPath: 'id' });
          mutStore.createIndex('user_id', 'user_id', { unique: false });
          mutStore.createIndex('status', 'status', { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  // --- USER CACHE OPERATIONS ---
  async saveUserCache(userId: string, tableName: string, data: any[]): Promise<void> {
    const key = `${userId}:${tableName}`;
    this.memoryCache.set(key, data);

    if (!this.isIndexedDBAvailable()) return;

    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('user_cache', 'readwrite');
        const store = tx.objectStore('user_cache');
        const entry: UserCachedTable = {
          key,
          user_id: userId,
          table_name: tableName,
          data,
          timestamp: Date.now(),
        };
        const req = store.put(entry);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      // Memory fallback active
    }
  }

  async getUserCache<T = any>(userId: string, tableName: string): Promise<T[] | null> {
    const key = `${userId}:${tableName}`;
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key) as T[];
    }

    if (!this.isIndexedDBAvailable()) return null;

    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction('user_cache', 'readonly');
        const store = tx.objectStore('user_cache');
        const req = store.get(key);
        req.onsuccess = () => {
          const result = req.result as UserCachedTable | undefined;
          if (result?.data) {
            this.memoryCache.set(key, result.data);
            resolve(result.data as T[]);
          } else {
            resolve(null);
          }
        };
        req.onerror = () => resolve(null);
      });
    } catch (e) {
      return null;
    }
  }

  // --- PENDING MUTATIONS OPERATIONS ---
  async addPendingMutation(mutation: Omit<PendingMutation, 'id' | 'timestamp' | 'status' | 'retry_count'>): Promise<PendingMutation> {
    const db = await this.getDB();
    const fullMutation: PendingMutation = {
      ...mutation,
      id: `pending-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      status: 'pending',
      retry_count: 0,
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction('pending_mutations', 'readwrite');
      const store = tx.objectStore('pending_mutations');
      const req = store.add(fullMutation);
      req.onsuccess = () => resolve(fullMutation);
      req.onerror = () => reject(req.error);
    });
  }

  async getPendingMutations(userId: string): Promise<PendingMutation[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('pending_mutations', 'readonly');
      const store = tx.objectStore('pending_mutations');
      const index = store.index('user_id');
      const req = index.getAll(userId);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async removePendingMutation(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('pending_mutations', 'readwrite');
      const store = tx.objectStore('pending_mutations');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async updatePendingMutationStatus(id: string, status: 'pending' | 'syncing' | 'failed', error?: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('pending_mutations', 'readwrite');
      const store = tx.objectStore('pending_mutations');
      const getReq = store.get(id);
      getReq.onsuccess = () => {
        const item = getReq.result as PendingMutation | undefined;
        if (!item) return resolve();
        item.status = status;
        if (error) item.error = error;
        if (status === 'failed') item.retry_count += 1;
        const putReq = store.put(item);
        putReq.onsuccess = () => resolve();
        putReq.onerror = () => reject(putReq.error);
      };
      getReq.onerror = () => reject(getReq.error);
    });
  }

  // --- SECURITY & LOGOUT ISOLATION ---
  async clearUserData(userId: string): Promise<void> {
    const db = await this.getDB();

    // Clear user cache
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('user_cache', 'readwrite');
      const store = tx.objectStore('user_cache');
      const index = store.index('user_id');
      const req = index.openCursor(IDBKeyRange.only(userId));
      req.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      req.onerror = () => reject(req.error);
    });

    // Clear pending mutations
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('pending_mutations', 'readwrite');
      const store = tx.objectStore('pending_mutations');
      const index = store.index('user_id');
      const req = index.openCursor(IDBKeyRange.only(userId));
      req.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      req.onerror = () => reject(req.error);
    });
  }

  async clearAllOfflineData(): Promise<void> {
    const db = await this.getDB();
    const tx1 = db.transaction('user_cache', 'readwrite');
    tx1.objectStore('user_cache').clear();
    const tx2 = db.transaction('pending_mutations', 'readwrite');
    tx2.objectStore('pending_mutations').clear();
  }
}

export const offlineStore = new OfflineStore();
