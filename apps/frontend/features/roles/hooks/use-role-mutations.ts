'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { ICreateRoleInput, IUpdateRoleInput } from '@helali/shared';

import { roleKeys } from '@/features/roles/hooks/role-keys';
import { rolesService } from '@/features/roles/services/roles.service';

export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ICreateRoleInput) => rolesService.create(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: roleKeys.all });
    },
  });
}

export function useUpdateRole(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: IUpdateRoleInput) => rolesService.update(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: roleKeys.all });
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => rolesService.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: roleKeys.all });
    },
  });
}
