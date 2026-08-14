'use client';

import { useEffect, useState } from 'react';

import { Icon } from '@iconify/react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

import type { audioTypes } from 'types/audio.type';

import { darkenColor, getAverageColor } from 'utils/functions';

import ImageWithLoader from '@/components/global/ImageWithLoader';
import ShareButton from '@/components/global/ShareButton';
import DownloadButton from '@/components/global/DownloadButton';
import RelatedMediaLink from '@/components/pages/front/RelatedMediaLink';
import AudioDetailsLoading from './AudioDetailsLoading';

interface IAudioDetailsProps {
  audio?: audioTypes;
  handlePlay: () => void;
  isPlaying: boolean;
  isActive: boolean;
  isLoading: boolean;
}

function AudioDetails(props: IAudioDetailsProps) {
  const [bgColor, setBgColor] = useState('#164842');
  const [bgColorDarken, setBgColorDarken] = useState('#0f6e61');

  useEffect(() => {
    if (!props.audio?.posterPath) {
      return;
    }

    getAverageColor(props.audio.posterPath)
      .then((color) => {
        setBgColor(color);
        setBgColorDarken(darkenColor(color, 35));
      })
      .catch(() => {
        setBgColor('#164842');
        setBgColorDarken('#0f6e61');
      });
  }, [props.audio?.posterPath]);

  if (props.isLoading || !props.audio) {
    return <AudioDetailsLoading />;
  }

  return (
    <article
      id="audio-details"
      className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-mainshadow"
    >
      <div
        className="relative overflow-hidden px-5 pb-6 pt-8 sm:px-8 sm:pb-8 sm:pt-10"
        style={{
          background: `linear-gradient(155deg, ${bgColor} 0%, ${bgColorDarken} 100%)`,
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.18),transparent_50%)]" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 size-56 rounded-full bg-white/10 blur-3xl" />

        <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-end sm:gap-8">
          <div className="relative shrink-0">
            <div className="absolute -inset-1 rounded-[1.35rem] bg-white/25 blur-sm" />
            <div className="relative size-48 overflow-hidden rounded-2xl bg-white/10 p-1.5 shadow-2xl ring-1 ring-white/30 sm:size-52">
              <div className="relative size-full overflow-hidden rounded-[0.9rem]">
                <ImageWithLoader
                  imageClassName="rounded-[0.9rem]"
                  src={props.audio?.posterPath}
                  alt={props.audio?.title}
                />
              </div>
            </div>
          </div>

          <div className="flex w-full flex-1 flex-col items-center gap-4 text-center sm:items-start sm:pb-1 sm:text-right">
            <Badge
              variant="secondary"
              className="border-0 bg-white/15 text-white backdrop-blur-sm hover:bg-white/20"
            >
              صوت
            </Badge>

            <h1 className="potk max-w-xl text-2xl leading-snug text-white sm:text-3xl lg:text-4xl">
              {props.audio?.title}
            </h1>

            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-sm text-white/95 backdrop-blur-sm">
                <i className="ki-outline ki-heart text-base" />
                {props.audio?.like ?? 0}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-sm text-white/95 backdrop-blur-sm">
                <i className="ki-outline ki-eye text-base" />
                {props.audio?.view ?? 0}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-1 sm:justify-start">
              <button
                type="button"
                onClick={props.handlePlay}
                aria-label={props.isPlaying ? 'توقف' : 'پخش'}
                className={cn(
                  'grid size-14 place-content-center rounded-full bg-white text-mainstructure shadow-lg transition',
                  'hover:scale-105 hover:bg-[#f7faf9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
                  props.isActive && 'ring-4 ring-white/35',
                )}
              >
                {props.isPlaying ? (
                  <i className="ki-solid ki-row-vertical text-xl" />
                ) : (
                  <i className="ki-solid ki-to-right text-2xl translate-x-px" />
                )}
              </button>

              <span className="text-sm font-medium text-white/90">
                {props.isPlaying ? 'در حال پخش' : props.isActive ? 'متوقف شده' : 'پخش صوت'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-5 px-5 py-5 sm:px-8 sm:py-6">
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border/50 bg-secondary/40 p-2 sm:gap-2.5 sm:p-2.5">
          <DownloadButton link={props.audio.path} />
          <ShareButton title={props.audio.title} text={props.audio.title} />
          <Button
            type="button"
            size="sm"
            aria-label="پسندیدن"
            className={cn(
              'h-10 gap-2 rounded-full border border-rose-200/80 bg-rose-50 px-4 text-rose-600 shadow-none',
              'hover:border-rose-300 hover:bg-rose-500 hover:text-white',
              'transition-all duration-200',
            )}
          >
            <Icon icon="solar:heart-bold-duotone" className="size-5" />
            <span className="font-medium tabular-nums">{props.audio.like ?? 0}</span>
          </Button>
          <span
            className={cn(
              'inline-flex h-10 items-center gap-2 rounded-full border border-border/70 bg-card px-4',
              'text-sm font-medium text-muted-foreground',
            )}
          >
            <Icon icon="solar:eye-bold-duotone" className="size-5 text-primary/80" />
            <span className="tabular-nums">{props.audio.view ?? 0}</span>
            <span className="hidden sm:inline">بازدید</span>
          </span>
        </div>

        {props.audio.relatedVideo ? (
          <RelatedMediaLink kind="video" media={props.audio.relatedVideo} />
        ) : null}

        {props.audio?.text ? (
          <>
            <Separator />
            <div className="mx-auto max-w-2xl space-y-3 text-center">
              <p className="text-sm font-semibold tracking-wide text-primary">متن شعر</p>
              <p className="whitespace-pre-line text-base leading-8 text-muted-foreground sm:text-lg sm:leading-9">
                {props.audio.text}
              </p>
            </div>
          </>
        ) : null}
      </div>
    </article>
  );
}

export default AudioDetails;
