'use client';

import type { ReactNode } from 'react';

import type { AppActions, AppSubjects } from '@helali/shared';

import { DataTableActionSlot } from '@/components/data-table/data-table-action-placeholder';
import { useAppAbility } from '@/features/auth/context/ability-provider';

interface ICanAccessProps {
  readonly I: AppActions;
  readonly a: AppSubjects;
  readonly children: ReactNode;
  readonly fallback?: ReactNode;
  /** Keep IconButton-sized space when denied (table action columns). */
  readonly preserveSlot?: boolean;
}

export function CanAccess({
  I,
  a,
  children,
  fallback = null,
  preserveSlot = false,
}: ICanAccessProps) {
  const ability = useAppAbility();
  const allowed = ability.can(I, a);

  if (preserveSlot) {
    return (
      <DataTableActionSlot>
        {allowed ? children : fallback}
      </DataTableActionSlot>
    );
  }

  if (!allowed) {
    return fallback;
  }

  return children;
}
