import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listsService, ListInsert, ListItemInsert } from '../services/listsService';

export const LISTS_QUERY_KEY = ['lists'];
export const LIST_ITEMS_QUERY_KEY = (listId: string) => ['list_items', listId];

export const useLists = () => {
  const queryClient = useQueryClient();

  const listsQuery = useQuery({
    queryKey: LISTS_QUERY_KEY,
    queryFn: () => listsService.getLists(),
  });

  const createListMutation = useMutation({
    mutationFn: (newList: Omit<ListInsert, 'user_id'>) => listsService.createList(newList),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LISTS_QUERY_KEY });
    },
  });

  const deleteListMutation = useMutation({
    mutationFn: (id: string) => listsService.deleteList(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LISTS_QUERY_KEY });
    },
  });

  return {
    lists: listsQuery.data ?? [],
    isLoading: listsQuery.isLoading,
    isError: listsQuery.isError,
    error: listsQuery.error,
    refetch: listsQuery.refetch,
    createList: createListMutation.mutateAsync,
    deleteList: deleteListMutation.mutateAsync,
    isCreating: createListMutation.isPending,
  };
};

export const useListItems = (listId: string) => {
  const queryClient = useQueryClient();

  const itemsQuery = useQuery({
    queryKey: LIST_ITEMS_QUERY_KEY(listId),
    queryFn: () => listsService.getListItems(listId),
    enabled: Boolean(listId),
  });

  const addItemMutation = useMutation({
    mutationFn: (newItem: ListItemInsert) => listsService.addListItem(newItem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LIST_ITEMS_QUERY_KEY(listId) });
    },
  });

  const toggleItemMutation = useMutation({
    mutationFn: ({ id, isCompleted }: { id: string; isCompleted: boolean }) =>
      listsService.toggleListItem(id, isCompleted),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LIST_ITEMS_QUERY_KEY(listId) });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id: string) => listsService.deleteListItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LIST_ITEMS_QUERY_KEY(listId) });
    },
  });

  return {
    items: itemsQuery.data ?? [],
    isLoading: itemsQuery.isLoading,
    isError: itemsQuery.isError,
    addItem: addItemMutation.mutateAsync,
    toggleItem: toggleItemMutation.mutateAsync,
    deleteItem: deleteItemMutation.mutateAsync,
  };
};
