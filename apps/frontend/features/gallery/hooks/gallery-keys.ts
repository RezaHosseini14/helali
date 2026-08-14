export const galleryKeys = {
  all: ['gallery'] as const,
  lists: () => [...galleryKeys.all, 'list'] as const,
  list: (page?: number, limit?: number) => [...galleryKeys.lists(), page, limit] as const,
  featured: () => [...galleryKeys.all, 'featured'] as const,
};
