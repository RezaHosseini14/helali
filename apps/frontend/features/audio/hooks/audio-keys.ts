export const audioKeys = {
  all: ['audio'] as const,
  lists: () => [...audioKeys.all, 'list'] as const,
  list: (page?: number, limit?: number) => [...audioKeys.lists(), page, limit] as const,
  details: () => [...audioKeys.all, 'detail'] as const,
  detail: (id: number) => [...audioKeys.details(), id] as const,
  suggestions: (id: number) => [...audioKeys.all, 'suggestions', id] as const,
};
