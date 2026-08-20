export const tweetKeys = {
  all: ['tweets'] as const,
  lists: () => [...tweetKeys.all, 'list'] as const,
  list: (limit?: number) => [...tweetKeys.lists(), limit] as const,
  adminLists: () => [...tweetKeys.all, 'admin'] as const,
  adminList: (page: number, limit: number) =>
    [...tweetKeys.adminLists(), page, limit] as const,
};
