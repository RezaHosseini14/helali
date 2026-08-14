'use client';

import { useCallback, useRef } from 'react';

import { viewAudio } from '@/features/audio/services/audio.service';
import { viewVideo } from '@/features/video/services/video.service';

export type MediaViewKind = 'audio' | 'video';

interface ITrackMediaViewOptions {
  readonly onCounted?: (views: number) => void;
}

function storageKey(kind: MediaViewKind, id: number): string {
  return `helali:media-view:${kind}:${id}`;
}

function hasLocalView(kind: MediaViewKind, id: number): boolean {
  try {
    return window.localStorage.getItem(storageKey(kind, id)) === '1';
  } catch {
    return false;
  }
}

function markLocalView(kind: MediaViewKind, id: number): void {
  try {
    window.localStorage.setItem(storageKey(kind, id), '1');
  } catch {
    // private mode / quota — server Redis still dedupes
  }
}

/**
 * Tracks a unique media view on first meaningful play.
 * Soft-dedupes in localStorage; server enforces Redis fingerprint TTL.
 */
export function useTrackMediaView(
  kind: MediaViewKind,
  id: number,
  options?: ITrackMediaViewOptions,
) {
  const inFlightRef = useRef(false);
  const onCounted = options?.onCounted;

  return useCallback(() => {
    if (!Number.isFinite(id) || id <= 0 || inFlightRef.current) {
      return;
    }

    if (hasLocalView(kind, id)) {
      return;
    }

    inFlightRef.current = true;

    const request = kind === 'audio' ? viewAudio(id) : viewVideo(id);

    void request
      .then((result) => {
        markLocalView(kind, id);

        if (result.counted) {
          onCounted?.(result.views);
        }
      })
      .catch(() => {
        inFlightRef.current = false;
      });
  }, [kind, id, onCounted]);
}
