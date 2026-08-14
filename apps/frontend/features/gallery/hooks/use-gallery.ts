'use client';

import { useQuery } from '@tanstack/react-query';

import { galleryKeys } from '@/features/gallery/hooks/gallery-keys';
import { getFeaturedGallery, getGallery } from '@/features/gallery/services/gallery.service';

export { galleryKeys };

export function useGallery(page?: number, limit?: number) {
  return useQuery({
    queryKey: galleryKeys.list(page, limit),
    queryFn: () => getGallery(page, limit),
    placeholderData: (previousData) => previousData,
  });
}

export function useGalleryFeatured() {
  return useQuery({
    queryKey: galleryKeys.featured(),
    queryFn: getFeaturedGallery,
  });
}
