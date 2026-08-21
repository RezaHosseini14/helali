import { cache } from 'react';

import { getApiBaseUrl } from '@/services/api-base-url';

interface IAudioPayload {
  id: number;
  title: string;
  text?: string;
  posterPath?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface IVideoPayload {
  id: number;
  title: string;
  text?: string;
  posterPath?: string;
  createdAt?: string;
  updatedAt?: string;
  durationSec?: number | null;
}

interface IApiEnvelope<T> {
  data?: T;
}

async function fetchPublicJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${getApiBaseUrl()}${path}`, {
      next: { revalidate: 120 },
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      return null;
    }

    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export const getPublicAudio = cache(async (id: number): Promise<IAudioPayload | null> => {
  if (!Number.isFinite(id) || id <= 0) {
    return null;
  }

  const body = await fetchPublicJson<IApiEnvelope<{ audio?: IAudioPayload }>>(`/audio/${id}`);
  return body?.data?.audio ?? null;
});

export const getPublicVideo = cache(async (id: number): Promise<IVideoPayload | null> => {
  if (!Number.isFinite(id) || id <= 0) {
    return null;
  }

  const body = await fetchPublicJson<IApiEnvelope<{ video?: IVideoPayload }>>(`/video/${id}`);
  return body?.data?.video ?? null;
});

async function collectIds(
  listPath: string,
  pick: (item: { id: number }) => number,
): Promise<number[]> {
  const ids: number[] = [];
  const limit = 100;
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages && page <= 50) {
    const body = await fetchPublicJson<
      IApiEnvelope<{
        audios?: { id: number }[];
        videos?: { id: number }[];
        totalPages?: number;
      }>
    >(`${listPath}?page=${page}&limit=${limit}`);

    const chunk = body?.data?.audios ?? body?.data?.videos ?? [];
    for (const item of chunk) {
      ids.push(pick(item));
    }

    totalPages = body?.data?.totalPages ?? 1;
    page += 1;

    if (chunk.length === 0) {
      break;
    }
  }

  return ids;
}

export async function listPublicAudioIds(): Promise<number[]> {
  return collectIds('/audio', (item) => item.id);
}

export async function listPublicVideoIds(): Promise<number[]> {
  return collectIds('/video', (item) => item.id);
}
