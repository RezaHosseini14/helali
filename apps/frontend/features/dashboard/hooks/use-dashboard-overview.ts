'use client';

import { useQuery } from '@tanstack/react-query';

import { useAuthSession } from '@/features/auth/hooks/use-auth-session';
import { dashboardKeys } from '@/features/dashboard/hooks/dashboard-keys';
import { getDashboardOverview } from '@/features/dashboard/services/dashboard.service';

export function useDashboardOverview() {
  const { isSessionReady, isAuthenticated } = useAuthSession();

  return useQuery({
    queryKey: dashboardKeys.overview(),
    queryFn: getDashboardOverview,
    enabled: isSessionReady && isAuthenticated,
    staleTime: 45_000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
}
