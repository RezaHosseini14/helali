'use client';

import { useQuery } from '@tanstack/react-query';

import { useAuthSession } from '@/features/auth/hooks/use-auth-session';
import { getMe } from '@/features/auth/services/auth.service';

export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
};

export function useCurrentUser() {
  const { isSessionReady, isAuthenticated } = useAuthSession();

  return useQuery({
    queryKey: authKeys.me(),
    queryFn: getMe,
    enabled: isSessionReady && isAuthenticated,
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
