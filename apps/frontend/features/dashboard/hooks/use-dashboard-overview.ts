'use client';

import { useQuery } from '@tanstack/react-query';

import { useAuthSession } from '@/features/auth/hooks/use-auth-session';
import { getDashboardOverview } from '@/features/dashboard/services/dashboard.service';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  overview: () => [...dashboardKeys.all, 'overview'] as const,
};

export function useDashboardOverview() {
  const { isSessionReady, isAuthenticated } = useAuthSession();

  return useQuery({
    queryKey: dashboardKeys.overview(),
    queryFn: getDashboardOverview,
    enabled: isSessionReady && isAuthenticated,
    staleTime: 45_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
