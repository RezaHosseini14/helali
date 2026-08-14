'use client';

import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import type { MouseEvent } from 'react';

import type { RootState } from '@/redux/store';
import { playAudio, togglePlayback } from '@/redux/slices/audioSlice';
import type { AppDispatch } from '@/redux/store';
import type { audioTypes } from 'types/audio.type';
import { cn } from '@/lib/utils';

import ImageWithLoader from '@/components/global/ImageWithLoader';
import AudioSuggestsLoading from './AudioSuggestsLoading';

interface IAudioSuggestsProps {
  audios: audioTypes[];
}

function AudioSuggests({ audios }: IAudioSuggestsProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { queueLoading, currentId, isPlaying, isOpen } = useSelector((state: RootState) => state.audio);

  if (queueLoading) {
    return <AudioSuggestsLoading />;
  }

  const suggestedAudios = audios?.slice(0, 5) ?? [];

  const handleQuickPlay = (event: MouseEvent<HTMLButtonElement>, audio: audioTypes) => {
    event.preventDefault();
    event.stopPropagation();

    if (currentId === audio.id && isOpen) {
      dispatch(togglePlayback());
      return;
    }

    dispatch(playAudio(audio));
  };

  return (
    <aside className="sticky top-24 flex flex-col gap-3">
      <h2 className="px-1 text-sm font-semibold text-foreground">صوت‌های پیشنهادی</h2>

      {suggestedAudios.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-card/60 px-4 py-8 text-center text-sm text-muted-foreground">
          موردی برای نمایش نیست
        </p>
      ) : (
        suggestedAudios.map((audio) => {
          const isThisPlaying = currentId === audio.id && isOpen && isPlaying;

          return (
            <Link
              key={audio.id}
              href={`/audio/${audio.id}`}
              className={cn(
                'group flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-2.5 shadow-sm transition hover:border-primary/30 hover:bg-secondary/60 hover:shadow-md',
                currentId === audio.id && isOpen && 'border-primary/35 ring-2 ring-primary/15',
              )}
            >
              <div className="relative size-18 shrink-0 overflow-hidden rounded-xl bg-muted">
                <ImageWithLoader src={audio.posterPath} alt={audio.title} />
                <div className="absolute inset-0 grid place-content-center bg-mainstructure/0 opacity-0 transition group-hover:bg-mainstructure/45 group-hover:opacity-100">
                  <i className="ki-solid ki-to-right text-2xl text-white" />
                </div>
              </div>

              <div className="min-w-0 flex-1 space-y-1.5">
                <p className="truncate text-sm font-semibold text-foreground transition group-hover:text-primary">
                  {audio.title}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <i className="ki-outline ki-heart" />
                    {audio.like ?? 0}
                  </span>
                  <span className="size-1 rounded-full bg-border" />
                  <span className="inline-flex items-center gap-1">
                    <i className="ki-outline ki-eye" />
                    {audio.view ?? 0}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={(event) => handleQuickPlay(event, audio)}
                aria-label={isThisPlaying ? 'توقف' : 'پخش'}
                className={cn(
                  'grid size-9 shrink-0 place-content-center rounded-full bg-primary/10 text-primary transition hover:bg-primary hover:text-primary-foreground',
                  isThisPlaying && 'bg-primary text-primary-foreground',
                )}
              >
                {isThisPlaying ? (
                  <i className="ki-solid ki-row-vertical text-sm" />
                ) : (
                  <i className="ki-solid ki-to-right text-base translate-x-px" />
                )}
              </button>
            </Link>
          );
        })
      )}
    </aside>
  );
}

export default AudioSuggests;
