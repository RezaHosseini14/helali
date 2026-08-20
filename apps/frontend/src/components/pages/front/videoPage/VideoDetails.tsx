'use client';

import { Icon } from '@iconify/react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

import DownloadButton from '@/components/global/DownloadButton';
import ShareButton from '@/components/global/ShareButton';
import VideoPlayer from '@/components/global/VideoPlayer';
import RelatedMediaLink from '@/components/pages/front/RelatedMediaLink';
import { resolveVideoPlaybackSource } from '@/lib/video-playback';
import type { videoTypes } from 'types/video.type';
import VideoDetailsLoading from './VideoDetailsLoading';

interface IVideoDetailsProps {
  video?: videoTypes;
  isLoading: boolean;
  onPlay?: () => void;
  onLike?: () => void;
  likes?: number;
  hasLiked?: boolean;
}

function VideoDetails(props: IVideoDetailsProps) {
  if (props.isLoading || !props.video) {
    return <VideoDetailsLoading />;
  }

  const playback = resolveVideoPlaybackSource(props.video);

  return (
    <article className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-mainshadow">
      <div className="aspect-video w-full overflow-hidden bg-mainstructure">
        <VideoPlayer
          variant="plain"
          src={playback.src}
          mimeType={playback.mimeType}
          poster={props.video.posterPath}
          title={props.video.title}
          onPlay={props.onPlay}
        />
      </div>

      {(props.video.processingStatus === 'pending' ||
        props.video.processingStatus === 'processing') && (
        <div className="border-b border-border/50 bg-secondary/50 px-5 py-2 text-center text-xs text-muted-foreground sm:px-6">
          کیفیت‌های تطبیقی در حال آماده‌سازی است — فعلاً پخش معمولی فعال است.
        </div>
      )}
      {props.video.processingStatus === 'failed' && (
        <div className="border-b border-border/50 bg-destructive/5 px-5 py-2 text-center text-xs text-destructive sm:px-6">
          آماده‌سازی HLS ناموفق بود — پخش progressive فعال است.
        </div>
      )}

      <div className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1 space-y-3">
            <Badge variant="secondary" className="border-0 bg-primary/10 text-primary hover:bg-primary/15">
              ویدیو
            </Badge>
            <h1 className="potk text-xl leading-snug text-foreground sm:text-2xl lg:text-3xl">
              {props.video.title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border/50 bg-secondary/40 p-2 sm:p-2.5">
            <DownloadButton link={props.video.path} />
            <ShareButton title={props.video.title} text={props.video.title} />
            <Button
              type="button"
              size="sm"
              aria-label="پسندیدن"
              disabled={props.hasLiked}
              onClick={props.onLike}
              className={cn(
                'h-10 gap-2 rounded-full border border-rose-200/80 bg-rose-50 px-4 text-rose-600 shadow-none',
                'hover:border-rose-300 hover:bg-rose-500 hover:text-white',
                'transition-all duration-200',
                props.hasLiked && 'border-rose-400 bg-rose-500 text-white',
              )}
            >
              <Icon icon="solar:heart-bold-duotone" className="size-5" />
              <span className="font-medium tabular-nums">
                {props.likes ?? props.video.like ?? 0}
              </span>
            </Button>
            <span
              className={cn(
                'inline-flex h-10 items-center gap-2 rounded-full border border-border/70 bg-card px-4',
                'text-sm font-medium text-muted-foreground',
              )}
            >
              <Icon icon="solar:eye-bold-duotone" className="size-5 text-primary/80" />
              <span className="tabular-nums">{props.video.view ?? 0}</span>
              <span className="hidden sm:inline">بازدید</span>
            </span>
          </div>
        </div>

        {props.video.relatedAudio ? (
          <RelatedMediaLink kind="audio" media={props.video.relatedAudio} />
        ) : null}

        {props.video.text ? (
          <>
            <Separator />
            <div className="mx-auto max-w-2xl space-y-3 text-center">
              <p className="text-sm font-semibold tracking-wide text-primary">متن شعر</p>
              <p className="whitespace-pre-line text-base leading-8 text-muted-foreground sm:text-lg sm:leading-9">
                {props.video.text}
              </p>
            </div>
          </>
        ) : null}
      </div>
    </article>
  );
}

export default VideoDetails;
