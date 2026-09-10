import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsService, EventInsert, EventUpdate } from '../services/eventsService';

export const EVENTS_QUERY_KEY = ['events'];

export const useEvents = () => {
  const queryClient = useQueryClient();

  const eventsQuery = useQuery({
    queryKey: EVENTS_QUERY_KEY,
    queryFn: () => eventsService.getEvents(),
  });

  const createEventMutation = useMutation({
    mutationFn: (newEvent: Omit<EventInsert, 'user_id'>) => eventsService.createEvent(newEvent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENTS_QUERY_KEY });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: EventUpdate }) =>
      eventsService.updateEvent(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENTS_QUERY_KEY });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: (id: string) => eventsService.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENTS_QUERY_KEY });
    },
  });

  return {
    events: eventsQuery.data ?? [],
    isLoading: eventsQuery.isLoading,
    isError: eventsQuery.isError,
    error: eventsQuery.error,
    refetch: eventsQuery.refetch,
    createEvent: createEventMutation.mutateAsync,
    updateEvent: updateEventMutation.mutateAsync,
    deleteEvent: deleteEventMutation.mutateAsync,
    isCreating: createEventMutation.isPending,
  };
};
