import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useSupabaseRealtime(familyId?: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Selective realtime channel subscription for family shared data
    const channelName = familyId ? `family-${familyId}` : 'user-realtime';
    const channel = supabase.channel(channelName);

    channel
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'family_members' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['family'] });
          queryClient.invalidateQueries({ queryKey: ['family_members'] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['tasks'] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['events'] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lists' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['lists'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [familyId, queryClient]);
}
