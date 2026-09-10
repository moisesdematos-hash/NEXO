import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksService, TaskInsert, TaskUpdate } from '../services/tasksService';
import { TaskStatus } from '../types/database.types';

export const TASKS_QUERY_KEY = ['tasks'];

export const useTasks = () => {
  const queryClient = useQueryClient();

  const tasksQuery = useQuery({
    queryKey: TASKS_QUERY_KEY,
    queryFn: () => tasksService.getTasks(),
  });

  const createTaskMutation = useMutation({
    mutationFn: (newTask: Omit<TaskInsert, 'user_id'>) => tasksService.createTask(newTask),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: TaskUpdate }) =>
      tasksService.updateTask(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
  });

  const toggleTaskMutation = useMutation({
    mutationFn: ({ id, currentStatus }: { id: string; currentStatus: TaskStatus }) =>
      tasksService.toggleTaskStatus(id, currentStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => tasksService.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
  });

  return {
    tasks: tasksQuery.data ?? [],
    isLoading: tasksQuery.isLoading,
    isError: tasksQuery.isError,
    error: tasksQuery.error,
    refetch: tasksQuery.refetch,
    createTask: createTaskMutation.mutateAsync,
    updateTask: updateTaskMutation.mutateAsync,
    toggleTask: toggleTaskMutation.mutateAsync,
    deleteTask: deleteTaskMutation.mutateAsync,
    isCreating: createTaskMutation.isPending,
  };
};
