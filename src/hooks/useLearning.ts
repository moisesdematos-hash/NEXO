import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  learningService,
  LearningObjectiveInsert,
  LearningPlanInsert,
  LearningItemInsert,
} from '../services/learningService';

export const LEARNING_OBJECTIVES_KEY = ['learning_objectives'];
export const LEARNING_PLANS_KEY = (objectiveId: string) => ['learning_plans', objectiveId];
export const LEARNING_ITEMS_KEY = (planId: string) => ['learning_items', planId];

export const useLearning = () => {
  const queryClient = useQueryClient();

  const objectivesQuery = useQuery({
    queryKey: LEARNING_OBJECTIVES_KEY,
    queryFn: () => learningService.getObjectives(),
  });

  const createObjectiveMutation = useMutation({
    mutationFn: (obj: Omit<LearningObjectiveInsert, 'user_id'>) => learningService.createObjective(obj),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEARNING_OBJECTIVES_KEY });
    },
  });

  const deleteObjectiveMutation = useMutation({
    mutationFn: (id: string) => learningService.deleteObjective(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEARNING_OBJECTIVES_KEY });
    },
  });

  return {
    objectives: objectivesQuery.data ?? [],
    isLoading: objectivesQuery.isLoading,
    isError: objectivesQuery.isError,
    refetch: objectivesQuery.refetch,
    createObjective: createObjectiveMutation.mutateAsync,
    deleteObjective: deleteObjectiveMutation.mutateAsync,
    isCreating: createObjectiveMutation.isPending,
  };
};

export const useLearningPlans = (objectiveId: string) => {
  const queryClient = useQueryClient();

  const plansQuery = useQuery({
    queryKey: LEARNING_PLANS_KEY(objectiveId),
    queryFn: () => learningService.getPlans(objectiveId),
    enabled: Boolean(objectiveId),
  });

  const createPlanMutation = useMutation({
    mutationFn: (plan: LearningPlanInsert) => learningService.createPlan(plan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEARNING_PLANS_KEY(objectiveId) });
    },
  });

  return {
    plans: plansQuery.data ?? [],
    isLoading: plansQuery.isLoading,
    createPlan: createPlanMutation.mutateAsync,
  };
};

export const useLearningItems = (objectiveId: string, planId: string) => {
  const queryClient = useQueryClient();

  const itemsQuery = useQuery({
    queryKey: LEARNING_ITEMS_KEY(planId),
    queryFn: () => learningService.getItems(planId),
    enabled: Boolean(planId),
  });

  const addItemMutation = useMutation({
    mutationFn: (item: LearningItemInsert) => learningService.addItem(item),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: LEARNING_ITEMS_KEY(planId) });
      await learningService.recalculateProgress(objectiveId);
      queryClient.invalidateQueries({ queryKey: LEARNING_OBJECTIVES_KEY });
    },
  });

  const toggleItemMutation = useMutation({
    mutationFn: ({ id, isCompleted }: { id: string; isCompleted: boolean }) =>
      learningService.toggleItem(id, isCompleted),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: LEARNING_ITEMS_KEY(planId) });
      await learningService.recalculateProgress(objectiveId);
      queryClient.invalidateQueries({ queryKey: LEARNING_OBJECTIVES_KEY });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id: string) => learningService.deleteItem(id),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: LEARNING_ITEMS_KEY(planId) });
      await learningService.recalculateProgress(objectiveId);
      queryClient.invalidateQueries({ queryKey: LEARNING_OBJECTIVES_KEY });
    },
  });

  return {
    items: itemsQuery.data ?? [],
    isLoading: itemsQuery.isLoading,
    addItem: addItemMutation.mutateAsync,
    toggleItem: toggleItemMutation.mutateAsync,
    deleteItem: deleteItemMutation.mutateAsync,
  };
};
