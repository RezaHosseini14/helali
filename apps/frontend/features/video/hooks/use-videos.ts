'use client';

import { useQuery } from '@tanstack/react-query';

import { videoKeys } from '@/features/video/hooks/video-keys';
import { getVideoStories, getVideos } from '@/features/video/services/video.service';

export { videoKeys };

export function useVideos(page?: number, limit?: number) {
  return useQuery({
    queryKey: videoKeys.list(page, limit),
    queryFn: () => getVideos(page, limit),
    placeholderData: (previousData) => previousData,
  });
}

export function useVideoStories() {
  return useQuery({
    queryKey: videoKeys.stories(),
    queryFn: () => getVideoStories(),
  });
}
