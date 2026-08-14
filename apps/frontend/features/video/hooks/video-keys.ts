export const videoKeys = {
  all: ['video'] as const,
  lists: () => [...videoKeys.all, 'list'] as const,
  list: (page?: number, limit?: number) => [...videoKeys.lists(), page, limit] as const,
  stories: () => [...videoKeys.all, 'stories'] as const,
};
