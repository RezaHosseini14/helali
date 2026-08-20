'use client';

import { useQuery } from '@tanstack/react-query';

import { videoKeys } from '@/features/video/hooks/video-keys';
import { getVideoSuggestions } from '@/features/video/services/video.service';

export function useVideoSuggestions(id: number, limit = 5) {
  return useQuery({
    queryKey: videoKeys.suggestions(id),
    queryFn: () => getVideoSuggestions(id, limit),
    enabled: Number.isFinite(id) && id > 0,
    staleTime: 60_000,
  });
}
