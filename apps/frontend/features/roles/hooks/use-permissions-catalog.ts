'use client';

import { useQuery } from '@tanstack/react-query';

import { roleKeys } from '@/features/roles/hooks/role-keys';
import { rolesService } from '@/features/roles/services/roles.service';

export function usePermissionsCatalog(enabled = true) {
  return useQuery({
    queryKey: roleKeys.permissions(),
    queryFn: () => rolesService.listPermissions(),
    enabled,
  });
}
