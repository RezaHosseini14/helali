'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { likeAudio } from '@/features/audio/services/audio.service';
import { likeVideo } from '@/features/video/services/video.service';

export type MediaLikeKind = 'audio' | 'video';

interface ITrackMediaLikeOptions {
  readonly initialLikes?: number;
  readonly onCounted?: (likes: number) => void;
}

function storageKey(kind: MediaLikeKind, id: number): string {
  return `helali:media-like:${kind}:${id}`;
}

function hasLocalLike(kind: MediaLikeKind, id: number): boolean {
  try {
    return window.localStorage.getItem(storageKey(kind, id)) === '1';
  } catch {
    return false;
  }
}

function markLocalLike(kind: MediaLikeKind, id: number): void {
  try {
    window.localStorage.setItem(storageKey(kind, id), '1');
  } catch {
    // private mode / quota — server Redis still dedupes
  }
}

export function useTrackMediaLike(
  kind: MediaLikeKind,
  id: number,
  options?: ITrackMediaLikeOptions,
) {
  const inFlightRef = useRef(false);
  const onCounted = options?.onCounted;
  const [likes, setLikes] = useState(options?.initialLikes ?? 0);
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    setHasLiked(hasLocalLike(kind, id));
  }, [kind, id]);

  useEffect(() => {
    if (typeof options?.initialLikes === 'number') {
      setLikes(options.initialLikes);
    }
  }, [options?.initialLikes]);

  const like = useCallback(() => {
    if (!Number.isFinite(id) || id <= 0 || inFlightRef.current || hasLiked) {
      return;
    }

    if (hasLocalLike(kind, id)) {
      setHasLiked(true);
      return;
    }

    inFlightRef.current = true;

    const request = kind === 'audio' ? likeAudio(id) : likeVideo(id);

    void request
      .then((result) => {
        markLocalLike(kind, id);
        setHasLiked(true);
        setLikes(result.likes);
        inFlightRef.current = false;

        if (result.counted) {
          onCounted?.(result.likes);
        }
      })
      .catch(() => {
        inFlightRef.current = false;
      });
  }, [kind, id, hasLiked, onCounted]);

  return { like, likes, hasLiked };
}
