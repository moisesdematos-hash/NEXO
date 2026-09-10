import { supabase } from '../lib/supabase';
import { Database } from '../types/database.types';
import { offlineStore } from '../lib/offlineStore';
import { setGlobalNetworkStatus } from '../hooks/useNetworkStatus';

export type ListRow = Database['public']['Tables']['lists']['Row'];
export type ListInsert = Database['public']['Tables']['lists']['Insert'];

export type ListItemRow = Database['public']['Tables']['list_items']['Row'];
export type ListItemInsert = Database['public']['Tables']['list_items']['Insert'];

export const listsService = {
  async getLists(): Promise<ListRow[]> {
    const { data: { user } } = await supabase.auth.getUser();

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      if (user) {
        const cached = await offlineStore.getUserCache<ListRow>(user.id, 'lists');
        if (cached) return cached;
      }
      return [];
    }

    try {
      const { data, error } = await (supabase as any)
        .from('lists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const listsData = (data || []) as ListRow[];

      if (user) {
        await offlineStore.saveUserCache(user.id, 'lists', listsData);
      }

      return listsData;
    } catch (err) {
      if (user) {
        const cached = await offlineStore.getUserCache<ListRow>(user.id, 'lists');
        if (cached) return cached;
      }
      throw err;
    }
  },

  async createList(list: Omit<ListInsert, 'user_id'>): Promise<ListRow> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilizador não autenticado');

    const newList: ListInsert = {
      ...list,
      user_id: user.id,
      is_private: list.is_private ?? true,
    };

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      const tempId = `temp-${Date.now()}`;
      const tempRecord: ListRow = {
        id: tempId,
        user_id: user.id,
        family_id: newList.family_id ?? null,
        is_private: newList.is_private ?? true,
        title: newList.title,
        category: newList.category ?? null,
        created_at: new Date().toISOString(),
      };

      await offlineStore.addPendingMutation({
        user_id: user.id,
        table_name: 'lists',
        operation: 'INSERT',
        payload: newList,
      });

      const current = (await offlineStore.getUserCache<ListRow>(user.id, 'lists')) || [];
      await offlineStore.saveUserCache(user.id, 'lists', [tempRecord, ...current]);
      setGlobalNetworkStatus({ status: 'offline', pendingCount: (await offlineStore.getPendingMutations(user.id)).length });

      return tempRecord;
    }

    const { data, error } = await (supabase as any)
      .from('lists')
      .insert(newList)
      .select()
      .single();

    if (error) throw error;
    return data as ListRow;
  },

  async deleteList(id: string): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      if (user) {
        await offlineStore.addPendingMutation({
          user_id: user.id,
          table_name: 'lists',
          operation: 'DELETE',
          payload: { id },
        });

        const current = (await offlineStore.getUserCache<ListRow>(user.id, 'lists')) || [];
        const filtered = current.filter((l) => l.id !== id);
        await offlineStore.saveUserCache(user.id, 'lists', filtered);
        setGlobalNetworkStatus({ status: 'offline', pendingCount: (await offlineStore.getPendingMutations(user.id)).length });
      }
      return id;
    }

    const { error } = await (supabase as any)
      .from('lists')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return id;
  },

  async getListItems(listId: string): Promise<ListItemRow[]> {
    const { data: { user } } = await supabase.auth.getUser();

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      if (user) {
        const cached = await offlineStore.getUserCache<ListItemRow>(user.id, `list_items_${listId}`);
        if (cached) return cached;
      }
      return [];
    }

    try {
      const { data, error } = await (supabase as any)
        .from('list_items')
        .select('*')
        .eq('list_id', listId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      const items = (data || []) as ListItemRow[];

      if (user) {
        await offlineStore.saveUserCache(user.id, `list_items_${listId}`, items);
      }

      return items;
    } catch (err) {
      if (user) {
        const cached = await offlineStore.getUserCache<ListItemRow>(user.id, `list_items_${listId}`);
        if (cached) return cached;
      }
      throw err;
    }
  },

  async addListItem(item: ListItemInsert): Promise<ListItemRow> {
    const { data: { user } } = await supabase.auth.getUser();

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      if (user) {
        const tempId = `temp-${Date.now()}`;
        const tempRecord: ListItemRow = {
          id: tempId,
          list_id: item.list_id,
          content: item.content,
          is_completed: item.is_completed ?? false,
          created_at: new Date().toISOString(),
        };

        await offlineStore.addPendingMutation({
          user_id: user.id,
          table_name: 'list_items',
          operation: 'INSERT',
          payload: item,
        });

        const cacheKey = `list_items_${item.list_id}`;
        const current = (await offlineStore.getUserCache<ListItemRow>(user.id, cacheKey)) || [];
        await offlineStore.saveUserCache(user.id, cacheKey, [...current, tempRecord]);
        setGlobalNetworkStatus({ status: 'offline', pendingCount: (await offlineStore.getPendingMutations(user.id)).length });

        return tempRecord;
      }
    }

    const { data, error } = await (supabase as any)
      .from('list_items')
      .insert(item)
      .select()
      .single();

    if (error) throw error;
    return data as ListItemRow;
  },

  async toggleListItem(id: string, isCompleted: boolean): Promise<ListItemRow> {
    const { data: { user } } = await supabase.auth.getUser();

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      if (user) {
        await offlineStore.addPendingMutation({
          user_id: user.id,
          table_name: 'list_items',
          operation: 'UPDATE',
          payload: { id, is_completed: !isCompleted },
        });

        setGlobalNetworkStatus({ status: 'offline', pendingCount: (await offlineStore.getPendingMutations(user.id)).length });
        return { id, is_completed: !isCompleted } as ListItemRow;
      }
    }

    const { data, error } = await (supabase as any)
      .from('list_items')
      .update({ is_completed: !isCompleted })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ListItemRow;
  },

  async deleteListItem(id: string): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      if (user) {
        await offlineStore.addPendingMutation({
          user_id: user.id,
          table_name: 'list_items',
          operation: 'DELETE',
          payload: { id },
        });
        setGlobalNetworkStatus({ status: 'offline', pendingCount: (await offlineStore.getPendingMutations(user.id)).length });
      }
      return id;
    }

    const { error } = await (supabase as any)
      .from('list_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return id;
  },
};
