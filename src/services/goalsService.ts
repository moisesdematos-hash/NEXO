import { supabase } from '../lib/supabase';
import { Database } from '../types/database.types';
import { offlineStore } from '../lib/offlineStore';
import { setGlobalNetworkStatus } from '../hooks/useNetworkStatus';

export type GoalRow = Database['public']['Tables']['goals']['Row'];
export type GoalInsert = Database['public']['Tables']['goals']['Insert'];
export type GoalUpdate = Database['public']['Tables']['goals']['Update'];

export const goalsService = {
  async getGoals(): Promise<GoalRow[]> {
    const { data: { user } } = await supabase.auth.getUser();

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      if (user) {
        const cached = await offlineStore.getUserCache<GoalRow>(user.id, 'goals');
        if (cached) return cached;
      }
      return [];
    }

    try {
      const { data, error } = await (supabase as any)
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const goalsList = (data || []) as GoalRow[];

      if (user) {
        await offlineStore.saveUserCache(user.id, 'goals', goalsList);
      }

      return goalsList;
    } catch (err) {
      if (user) {
        const cached = await offlineStore.getUserCache<GoalRow>(user.id, 'goals');
        if (cached) return cached;
      }
      throw err;
    }
  },

  async createGoal(goal: Omit<GoalInsert, 'user_id'>): Promise<GoalRow> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilizador não autenticado');

    const newGoal: GoalInsert = {
      ...goal,
      user_id: user.id,
      current_value: goal.current_value ?? 0,
      target_value: goal.target_value ?? 100,
      is_completed: false,
    };

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      const tempId = `temp-${Date.now()}`;
      const tempRecord: GoalRow = {
        id: tempId,
        user_id: user.id,
        title: newGoal.title,
        description: newGoal.description ?? null,
        target_value: newGoal.target_value ?? 100,
        current_value: newGoal.current_value ?? 0,
        unit: newGoal.unit ?? '%',
        deadline: newGoal.deadline ?? null,
        is_completed: false,
        created_at: new Date().toISOString(),
      };

      await offlineStore.addPendingMutation({
        user_id: user.id,
        table_name: 'goals',
        operation: 'INSERT',
        payload: newGoal,
      });

      const current = (await offlineStore.getUserCache<GoalRow>(user.id, 'goals')) || [];
      await offlineStore.saveUserCache(user.id, 'goals', [tempRecord, ...current]);
      setGlobalNetworkStatus({ status: 'offline', pendingCount: (await offlineStore.getPendingMutations(user.id)).length });

      return tempRecord;
    }

    const { data, error } = await (supabase as any)
      .from('goals')
      .insert(newGoal)
      .select()
      .single();

    if (error) throw error;
    return data as GoalRow;
  },

  async updateGoal(id: string, updates: GoalUpdate): Promise<GoalRow> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilizador não autenticado');

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      await offlineStore.addPendingMutation({
        user_id: user.id,
        table_name: 'goals',
        operation: 'UPDATE',
        payload: { id, ...updates },
      });

      const current = (await offlineStore.getUserCache<GoalRow>(user.id, 'goals')) || [];
      const updated = current.map((g) => (g.id === id ? { ...g, ...updates } : g));
      await offlineStore.saveUserCache(user.id, 'goals', updated);
      setGlobalNetworkStatus({ status: 'offline', pendingCount: (await offlineStore.getPendingMutations(user.id)).length });

      return updated.find((g) => g.id === id) as GoalRow;
    }

    const { data, error } = await (supabase as any)
      .from('goals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as GoalRow;
  },

  async updateProgress(id: string, currentValue: number, targetValue: number): Promise<GoalRow> {
    const isCompleted = currentValue >= targetValue;
    return this.updateGoal(id, {
      current_value: currentValue,
      is_completed: isCompleted,
    });
  },

  async deleteGoal(id: string): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      if (user) {
        await offlineStore.addPendingMutation({
          user_id: user.id,
          table_name: 'goals',
          operation: 'DELETE',
          payload: { id },
        });

        const current = (await offlineStore.getUserCache<GoalRow>(user.id, 'goals')) || [];
        const filtered = current.filter((g) => g.id !== id);
        await offlineStore.saveUserCache(user.id, 'goals', filtered);
        setGlobalNetworkStatus({ status: 'offline', pendingCount: (await offlineStore.getPendingMutations(user.id)).length });
      }
      return id;
    }

    const { error } = await (supabase as any)
      .from('goals')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return id;
  },
};
