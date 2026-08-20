'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { createAppAbility, type AppAbility } from '@helali/shared';

import { useCurrentUser } from '@/features/auth/hooks/use-current-user';

const AbilityContext = createContext<AppAbility | undefined>(undefined);

export function AbilityProvider({ children }: { readonly children: ReactNode }) {
  const { data: user } = useCurrentUser();

  const ability = useMemo(() => {
    if (!user?.role) {
      return createAppAbility({ id: 0, role: 'USER', permissions: [] });
    }

    return createAppAbility({
      id: user.id,
      role: user.role,
      permissions: user.permissions ?? [],
    });
  }, [user?.id, user?.permissions, user?.role]);

  return <AbilityContext.Provider value={ability}>{children}</AbilityContext.Provider>;
}

export function useAppAbility(): AppAbility {
  const ability = useContext(AbilityContext);

  if (!ability) {
    throw new Error('useAppAbility must be used within AbilityProvider');
  }

  return ability;
}
