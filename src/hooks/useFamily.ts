import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { familyService } from '../services/familyService';

export const MY_FAMILY_KEY = ['my_family'];
export const FAMILY_MEMBERS_KEY = (familyId: string) => ['family_members', familyId];

export const useFamily = () => {
  const queryClient = useQueryClient();

  const familyQuery = useQuery({
    queryKey: MY_FAMILY_KEY,
    queryFn: () => familyService.getMyFamilyGroup(),
  });

  const familyId = familyQuery.data?.id ?? '';

  const membersQuery = useQuery({
    queryKey: FAMILY_MEMBERS_KEY(familyId),
    queryFn: () => familyService.getFamilyMembers(familyId),
    enabled: Boolean(familyId),
  });

  const createFamilyMutation = useMutation({
    mutationFn: (name: string) => familyService.createFamilyGroup(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MY_FAMILY_KEY });
    },
  });

  const joinFamilyMutation = useMutation({
    mutationFn: (inviteCode: string) => familyService.joinFamilyByInviteCode(inviteCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MY_FAMILY_KEY });
    },
  });

  const leaveFamilyMutation = useMutation({
    mutationFn: (famId: string) => familyService.leaveFamily(famId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MY_FAMILY_KEY });
    },
  });

  return {
    family: familyQuery.data,
    members: membersQuery.data ?? [],
    isLoading: familyQuery.isLoading || membersQuery.isLoading,
    isError: familyQuery.isError,
    refetch: familyQuery.refetch,
    createFamily: createFamilyMutation.mutateAsync,
    joinFamily: joinFamilyMutation.mutateAsync,
    leaveFamily: leaveFamilyMutation.mutateAsync,
    isCreating: createFamilyMutation.isPending,
    isJoining: joinFamilyMutation.isPending,
  };
};
