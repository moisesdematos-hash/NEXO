import { supabase } from '../lib/supabase';
import { Database, TaskStatus } from '../types/database.types';
import { offlineStore } from '../lib/offlineStore';
import { setGlobalNetworkStatus } from '../hooks/useNetworkStatus';

export type TaskRow = Database['public']['Tables']['tasks']['Row'];
export type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
export type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

export const tasksService = {
  async getTasks(): Promise<TaskRow[]> {
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || 'guest-local-user';

    if ((typeof navigator !== 'undefined' && !navigator.onLine) || !user) {
      const cached = await offlineStore.getUserCache<TaskRow>(userId, 'tasks');
      if (cached) return cached;
      return [];
    }

    try {
      const { data, error } = await (supabase as any)
        .from('tasks')
        .select('*')
        .order('due_date', { ascending: true, nullsFirst: false });

      if (error) throw error;
      const tasksList = (data || []) as TaskRow[];

      await offlineStore.saveUserCache(userId, 'tasks', tasksList);

      return tasksList;
    } catch (err) {
      const cached = await offlineStore.getUserCache<TaskRow>(userId, 'tasks');
      if (cached) return cached;
      return [];
    }
  },

  async createTask(task: Omit<TaskInsert, 'user_id'>): Promise<TaskRow> {
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || 'guest-local-user';

    const newTask: TaskInsert = {
      ...task,
      user_id: userId,
      is_private: task.is_private ?? true,
    };

    if ((typeof navigator !== 'undefined' && !navigator.onLine) || !user) {
      const tempId = `temp-${Date.now()}`;
      const tempRecord: TaskRow = {
        id: tempId,
        user_id: userId,
        family_id: newTask.family_id ?? null,
        is_private: newTask.is_private ?? true,
        title: newTask.title,
        description: newTask.description ?? null,
        priority: newTask.priority ?? 'medium',
        status: newTask.status ?? 'pending',
        due_date: newTask.due_date ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (user) {
        await offlineStore.addPendingMutation({
          user_id: userId,
          table_name: 'tasks',
          operation: 'INSERT',
          payload: newTask,
        });
      }

      const current = (await offlineStore.getUserCache<TaskRow>(userId, 'tasks')) || [];
      const updated = [tempRecord, ...current];
      await offlineStore.saveUserCache(userId, 'tasks', updated);
      return tempRecord;
    }

    try {
      const { data, error } = await (supabase as any)
        .from('tasks')
        .insert(newTask)
        .select()
        .single();

      if (error) throw error;
      return data as TaskRow;
    } catch (err) {
      // Offline fallback
      const tempId = `temp-${Date.now()}`;
      const tempRecord: TaskRow = {
        id: tempId,
        user_id: userId,
        family_id: newTask.family_id ?? null,
        is_private: newTask.is_private ?? true,
        title: newTask.title,
        description: newTask.description ?? null,
        priority: newTask.priority ?? 'medium',
        status: newTask.status ?? 'pending',
        due_date: newTask.due_date ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const current = (await offlineStore.getUserCache<TaskRow>(userId, 'tasks')) || [];
      const updated = [tempRecord, ...current];
      await offlineStore.saveUserCache(userId, 'tasks', updated);
      return tempRecord;
    }
  },

  async updateTask(id: string, updates: TaskUpdate): Promise<TaskRow> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilizador não autenticado');

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      await offlineStore.addPendingMutation({
        user_id: user.id,
        table_name: 'tasks',
        operation: 'UPDATE',
        payload: { id, ...updates },
      });

      const current = (await offlineStore.getUserCache<TaskRow>(user.id, 'tasks')) || [];
      const updated = current.map((t) => (t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t));
      await offlineStore.saveUserCache(user.id, 'tasks', updated);
      setGlobalNetworkStatus({ status: 'offline', pendingCount: (await offlineStore.getPendingMutations(user.id)).length });

      return updated.find((t) => t.id === id) as TaskRow;
    }

    const { data, error } = await (supabase as any)
      .from('tasks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as TaskRow;
  },

  async toggleTaskStatus(id: string, currentStatus: TaskStatus) {
    const nextStatus: TaskStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    return this.updateTask(id, { status: nextStatus });
  },

  async deleteTask(id: string): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      if (user) {
        await offlineStore.addPendingMutation({
          user_id: user.id,
          table_name: 'tasks',
          operation: 'DELETE',
          payload: { id },
        });

        const current = (await offlineStore.getUserCache<TaskRow>(user.id, 'tasks')) || [];
        const filtered = current.filter((t) => t.id !== id);
        await offlineStore.saveUserCache(user.id, 'tasks', filtered);
        setGlobalNetworkStatus({ status: 'offline', pendingCount: (await offlineStore.getPendingMutations(user.id)).length });
      }
      return id;
    }

    const { error } = await (supabase as any)
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return id;
  },
};
