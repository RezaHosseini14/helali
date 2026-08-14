'use client';

import { useQuery } from '@tanstack/react-query';

import { audioKeys } from '@/features/audio/hooks/audio-keys';
import { getAudioById, getAudios } from '@/features/audio/services/audio.service';

export { audioKeys };

export function useAudios(page?: number, limit?: number) {
  return useQuery({
    queryKey: audioKeys.list(page, limit),
    queryFn: () => getAudios(page, limit),
  });
}

export function useAudio(id: number) {
  return useQuery({
    queryKey: audioKeys.detail(id),
    queryFn: () => getAudioById(id),
    enabled: id > 0,
  });
}
