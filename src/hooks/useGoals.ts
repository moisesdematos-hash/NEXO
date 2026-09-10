import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { goalsService, GoalInsert, GoalUpdate } from '../services/goalsService';

export const GOALS_QUERY_KEY = ['goals'];

export const useGoals = () => {
  const queryClient = useQueryClient();

  const goalsQuery = useQuery({
    queryKey: GOALS_QUERY_KEY,
    queryFn: () => goalsService.getGoals(),
  });

  const createGoalMutation = useMutation({
    mutationFn: (newGoal: Omit<GoalInsert, 'user_id'>) => goalsService.createGoal(newGoal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOALS_QUERY_KEY });
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: GoalUpdate }) =>
      goalsService.updateGoal(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOALS_QUERY_KEY });
    },
  });

  const updateProgressMutation = useMutation({
    mutationFn: ({ id, currentValue, targetValue }: { id: string; currentValue: number; targetValue: number }) =>
      goalsService.updateProgress(id, currentValue, targetValue),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOALS_QUERY_KEY });
    },
  });

  const toggleCompleteMutation = useMutation({
    mutationFn: ({ id, currentlyCompleted }: { id: string; currentlyCompleted: boolean }) =>
      goalsService.updateGoal(id, { is_completed: !currentlyCompleted }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOALS_QUERY_KEY });
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: (id: string) => goalsService.deleteGoal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOALS_QUERY_KEY });
    },
  });

  return {
    goals: goalsQuery.data ?? [],
    isLoading: goalsQuery.isLoading,
    isError: goalsQuery.isError,
    refetch: goalsQuery.refetch,
    createGoal: createGoalMutation.mutateAsync,
    updateGoal: updateGoalMutation.mutateAsync,
    updateProgress: updateProgressMutation.mutateAsync,
    toggleComplete: toggleCompleteMutation.mutateAsync,
    deleteGoal: deleteGoalMutation.mutateAsync,
    isCreating: createGoalMutation.isPending,
  };
};
