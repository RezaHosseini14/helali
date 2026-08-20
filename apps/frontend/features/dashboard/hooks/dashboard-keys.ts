export const dashboardKeys = {
  all: ['dashboard'] as const,
  overview: () => [...dashboardKeys.all, 'overview'] as const,
  timeseries: (entityType: string) =>
    [...dashboardKeys.all, 'timeseries', entityType] as const,
  top: (entityType: string, metric: string) =>
    [...dashboardKeys.all, 'top', entityType, metric] as const,
  byCategory: (entityType: string) =>
    [...dashboardKeys.all, 'by-category', entityType] as const,
  tweets: () => [...dashboardKeys.all, 'tweets'] as const,
};
