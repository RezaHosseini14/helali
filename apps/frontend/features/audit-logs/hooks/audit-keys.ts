export const auditKeys = {
  all: ['audit-logs'] as const,
  lists: () => [...auditKeys.all, 'list'] as const,
  list: (page: number, limit: number) => [...auditKeys.lists(), page, limit] as const,
};
