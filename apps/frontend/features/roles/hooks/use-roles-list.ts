'use client';

import { useQuery } from '@tanstack/react-query';

import { roleKeys } from '@/features/roles/hooks/role-keys';
import { rolesService } from '@/features/roles/services/roles.service';

export function useRolesList(enabled = true) {
  return useQuery({
    queryKey: roleKeys.lists(),
    queryFn: () => rolesService.list(),
    enabled,
  });
}
