import { supabase } from '../lib/supabase';
import { Database } from '../types/database.types';
import { offlineStore } from '../lib/offlineStore';
import { setGlobalNetworkStatus } from '../hooks/useNetworkStatus';

export type EventRow = Database['public']['Tables']['events']['Row'];
export type EventInsert = Database['public']['Tables']['events']['Insert'];
export type EventUpdate = Database['public']['Tables']['events']['Update'];

export const eventsService = {
  async getEvents(): Promise<EventRow[]> {
    const { data: { user } } = await supabase.auth.getUser();

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      if (user) {
        const cached = await offlineStore.getUserCache<EventRow>(user.id, 'events');
        if (cached) return cached;
      }
      return [];
    }

    try {
      const { data, error } = await (supabase as any)
        .from('events')
        .select('*')
        .order('start_time', { ascending: true });

      if (error) throw error;
      const eventsList = (data || []) as EventRow[];

      if (user) {
        await offlineStore.saveUserCache(user.id, 'events', eventsList);
      }

      return eventsList;
    } catch (err) {
      if (user) {
        const cached = await offlineStore.getUserCache<EventRow>(user.id, 'events');
        if (cached) return cached;
      }
      throw err;
    }
  },

  async createEvent(event: Omit<EventInsert, 'user_id'>): Promise<EventRow> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilizador não autenticado');

    const newEvent: EventInsert = {
      ...event,
      user_id: user.id,
      is_private: event.is_private ?? true,
    };

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      const tempId = `temp-${Date.now()}`;
      const tempRecord: EventRow = {
        id: tempId,
        user_id: user.id,
        family_id: newEvent.family_id ?? null,
        is_private: newEvent.is_private ?? true,
        title: newEvent.title,
        description: newEvent.description ?? null,
        location: newEvent.location ?? null,
        start_time: newEvent.start_time,
        end_time: newEvent.end_time,
        is_all_day: newEvent.is_all_day ?? false,
        created_at: new Date().toISOString(),
      };

      await offlineStore.addPendingMutation({
        user_id: user.id,
        table_name: 'events',
        operation: 'INSERT',
        payload: newEvent,
      });

      const current = (await offlineStore.getUserCache<EventRow>(user.id, 'events')) || [];
      await offlineStore.saveUserCache(user.id, 'events', [...current, tempRecord]);
      setGlobalNetworkStatus({ status: 'offline', pendingCount: (await offlineStore.getPendingMutations(user.id)).length });

      return tempRecord;
    }

    const { data, error } = await (supabase as any)
      .from('events')
      .insert(newEvent)
      .select()
      .single();

    if (error) throw error;
    return data as EventRow;
  },

  async updateEvent(id: string, updates: EventUpdate): Promise<EventRow> {
    const { data: { user } } = await supabase.auth.getUser();

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      if (user) {
        await offlineStore.addPendingMutation({
          user_id: user.id,
          table_name: 'events',
          operation: 'UPDATE',
          payload: { id, ...updates },
        });

        const current = (await offlineStore.getUserCache<EventRow>(user.id, 'events')) || [];
        const updated = current.map((e) => (e.id === id ? { ...e, ...updates } : e));
        await offlineStore.saveUserCache(user.id, 'events', updated);
        setGlobalNetworkStatus({ status: 'offline', pendingCount: (await offlineStore.getPendingMutations(user.id)).length });

        return updated.find((e) => e.id === id) as EventRow;
      }
    }

    const { data, error } = await (supabase as any)
      .from('events')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as EventRow;
  },

  async deleteEvent(id: string): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      if (user) {
        await offlineStore.addPendingMutation({
          user_id: user.id,
          table_name: 'events',
          operation: 'DELETE',
          payload: { id },
        });

        const current = (await offlineStore.getUserCache<EventRow>(user.id, 'events')) || [];
        const filtered = current.filter((e) => e.id !== id);
        await offlineStore.saveUserCache(user.id, 'events', filtered);
        setGlobalNetworkStatus({ status: 'offline', pendingCount: (await offlineStore.getPendingMutations(user.id)).length });
      }
      return id;
    }

    const { error } = await (supabase as any)
      .from('events')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return id;
  },
};
