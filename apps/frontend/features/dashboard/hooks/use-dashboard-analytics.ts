import { useQuery } from '@tanstack/react-query';

import { useAuthSession } from '@/features/auth/hooks/use-auth-session';
import { dashboardKeys } from '@/features/dashboard/hooks/dashboard-keys';
import {
  getAnalyticsByCategory,
  getAnalyticsTimeseries,
  getAnalyticsTop,
  getTweetAnalytics,
} from '@/features/dashboard/services/dashboard.service';

export function useAnalyticsTimeseries(entityType: string = 'all') {
  const { isSessionReady, isAuthenticated } = useAuthSession();

  return useQuery({
    queryKey: dashboardKeys.timeseries(entityType),
    queryFn: () => getAnalyticsTimeseries({ entityType }),
    enabled: isSessionReady && isAuthenticated,
    staleTime: 45_000,
  });
}

export function useAnalyticsTop(
  entityType: string = 'all',
  metric: 'views' | 'likes' = 'views',
) {
  const { isSessionReady, isAuthenticated } = useAuthSession();

  return useQuery({
    queryKey: dashboardKeys.top(entityType, metric),
    queryFn: () => getAnalyticsTop({ entityType, metric, limit: 10 }),
    enabled: isSessionReady && isAuthenticated,
    staleTime: 45_000,
  });
}

export function useAnalyticsByCategory(entityType: 'audio' | 'video') {
  const { isSessionReady, isAuthenticated } = useAuthSession();

  return useQuery({
    queryKey: dashboardKeys.byCategory(entityType),
    queryFn: () => getAnalyticsByCategory({ entityType }),
    enabled: isSessionReady && isAuthenticated,
    staleTime: 45_000,
  });
}

export function useTweetAnalytics() {
  const { isSessionReady, isAuthenticated } = useAuthSession();

  return useQuery({
    queryKey: dashboardKeys.tweets(),
    queryFn: () => getTweetAnalytics(),
    enabled: isSessionReady && isAuthenticated,
    staleTime: 45_000,
  });
}
