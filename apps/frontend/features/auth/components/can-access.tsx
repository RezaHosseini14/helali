'use client';

import type { ReactNode } from 'react';

import type { AppActions, AppSubjects } from '@helali/shared';

import { useAppAbility } from '@/features/auth/context/ability-provider';

interface ICanAccessProps {
  readonly I: AppActions;
  readonly a: AppSubjects;
  readonly children: ReactNode;
  readonly fallback?: ReactNode;
}

export function CanAccess({ I, a, children, fallback = null }: ICanAccessProps) {
  const ability = useAppAbility();

  if (!ability.can(I, a)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
