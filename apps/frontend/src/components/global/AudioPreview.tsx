'use client';

import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import type { MouseEvent } from 'react';

import { playAudio, togglePlayback } from '@/redux/slices/audioSlice';
import type { AppDispatch, RootState } from '@/redux/store';
import { cn } from '@/lib/utils';
import type { audioTypes } from 'types/audio.type';

import ImageWithLoader from './ImageWithLoader';

function AudioPreview(props: audioTypes) {
  const dispatch = useDispatch<AppDispatch>();
  const { currentId, isPlaying, isOpen } = useSelector((state: RootState) => state.audio);
  const isThisTrack = currentId === props.id && isOpen;
  const isThisPlaying = isThisTrack && isPlaying;

  const handleQuickPlay = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (isThisTrack) {
      dispatch(togglePlayback());
      return;
    }

    dispatch(playAudio(props));
  };

  return (
    <Link
      href={`/audio/${props.id}`}
      className={cn(
        'group relative col-span-12 flex items-center gap-3 overflow-hidden rounded-2xl border border-border/60 bg-card p-2.5 text-foreground shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary hover:text-primary-foreground hover:shadow-mainshadow sm:col-span-6 lg:col-span-4 xl:col-span-3',
        isThisTrack && 'border-primary/40 ring-2 ring-primary/15',
      )}
    >
      <div className="relative aspect-square size-[4.75rem] shrink-0 overflow-hidden rounded-xl bg-muted shadow-md sm:size-20">
        <ImageWithLoader
          imageClassName="transition-transform duration-300 group-hover:scale-110"
          src={props.posterPath}
          alt={props.title}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <span className="truncate text-right text-sm font-bold sm:text-base">{props.title}</span>
        <div className="flex items-center gap-2 text-xs opacity-80 sm:text-sm">
          <span className="inline-flex items-center gap-1">
            <span>{props.like ?? 0}</span>
            <i className="ki-outline ki-heart" />
          </span>
          <span className="h-3 w-px bg-current opacity-30" />
          <span className="inline-flex items-center gap-1">
            <span>{props.view ?? 0}</span>
            <i className="ki-outline ki-eye" />
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleQuickPlay}
        aria-label={isThisPlaying ? 'توقف' : 'پخش'}
        className={cn(
          'grid size-10 shrink-0 place-content-center rounded-full bg-primary/10 text-xl transition group-hover:bg-white/25',
          isThisPlaying && 'bg-primary text-primary-foreground',
        )}
      >
        {isThisPlaying ? (
          <i className="ki-solid ki-row-vertical text-base" />
        ) : (
          <i className="ki-solid ki-to-right" />
        )}
      </button>
    </Link>
  );
}

export default AudioPreview;
