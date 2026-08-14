'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import type { MouseEvent } from 'react';

import ImageWithLoader from '@/components/global/ImageWithLoader';
import { playAudio, togglePlayback } from '@/redux/slices/audioSlice';
import type { AppDispatch, RootState } from '@/redux/store';
import { cn } from '@/lib/utils';
import type { audioTypes } from 'types/audio.type';

import { AUDIO_CARD_COL_CLASS } from '@/components/pages/front/audiosPage/audio-cards-grid';

interface IAudioCardProps extends audioTypes {
  readonly index?: number;
}

function AudioCard({ index = 0, ...props }: IAudioCardProps) {
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
    <motion.article
      className={cn(AUDIO_CARD_COL_CLASS, 'overflow-visible pt-5')}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.65,
        delay: Math.min(index * 0.08, 0.48),
        ease: 'easeInOut',
      }}
    >
      <Link
        href={`/audio/${props.id}`}
        className={cn(
          'pattern group relative flex h-[4.5rem] items-end justify-between rounded-2xl bg-primary/10 p-2 !text-foreground backdrop-blur-lg transition duration-300 hover:bg-primary hover:!text-primary-foreground',
          isThisTrack && 'bg-primary/85 !text-primary-foreground ring-2 ring-primary/30',
        )}
      >
        <div className="flex min-w-0 flex-1 items-end gap-2">
          <div className="relative -mt-5 aspect-square size-20 shrink-0 overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-black/5">
            <ImageWithLoader
              imageClassName="transition-transform duration-300 group-hover:scale-110"
              src={props.posterPath}
              alt={props.title}
            />
            {isThisPlaying ? (
              <span className="pointer-events-none absolute inset-x-2 bottom-2 flex h-3 items-end justify-center gap-0.5">
                <span className="w-0.5 animate-pulse rounded-full bg-primary" style={{ height: '45%' }} />
                <span className="w-0.5 animate-pulse rounded-full bg-primary" style={{ height: '85%' }} />
                <span className="w-0.5 animate-pulse rounded-full bg-primary" style={{ height: '60%' }} />
              </span>
            ) : null}
          </div>

          <div className="flex h-full min-w-0 flex-1 flex-col justify-end gap-2 pb-0.5">
            <span className="truncate text-right text-sm font-bold sm:text-base">{props.title}</span>
            <div className="flex items-center gap-2 text-sm tabular-nums opacity-90">
              <span className="inline-flex items-center gap-1 px-1">
                <i className="ki-outline ki-heart" />
                {props.like ?? 0}
              </span>
              <span
                className={cn(
                  'h-3 w-px bg-primary/40 transition group-hover:bg-white/80',
                  isThisTrack && 'bg-white/70',
                )}
              />
              <span className="inline-flex items-center gap-1 px-1">
                <i className="ki-outline ki-eye" />
                {props.view ?? 0}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleQuickPlay}
          aria-label={isThisPlaying ? 'توقف' : 'پخش'}
          className={cn(
            'mb-0.5 grid size-11 shrink-0 place-content-center rounded-full bg-primary/10 text-xl backdrop-blur-sm transition duration-300 group-hover:bg-white/50 group-hover:text-primary',
            isThisPlaying && 'bg-white/60 text-primary',
          )}
        >
          {isThisPlaying ? (
            <i className="ki-solid ki-row-vertical text-lg" />
          ) : (
            <i className="ki-solid ki-to-right text-2xl" />
          )}
        </button>
      </Link>
    </motion.article>
  );
}

export default AudioCard;
