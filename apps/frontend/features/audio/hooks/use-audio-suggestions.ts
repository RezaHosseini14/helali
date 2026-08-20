'use client';

import { useQuery } from '@tanstack/react-query';

import { audioKeys } from '@/features/audio/hooks/audio-keys';
import { getAudioSuggestions } from '@/features/audio/services/audio.service';

export function useAudioSuggestions(id: number, limit = 5) {
  return useQuery({
    queryKey: audioKeys.suggestions(id),
    queryFn: () => getAudioSuggestions(id, limit),
    enabled: Number.isFinite(id) && id > 0,
    staleTime: 60_000,
  });
}
