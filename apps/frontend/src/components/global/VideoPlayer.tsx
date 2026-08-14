'use client';

import type { CSSProperties, Ref, SyntheticEvent } from 'react';

import '@videojs/react/video/skin.css';
import { createPlayer } from '@videojs/react';
import { Video, VideoSkin, videoFeatures } from '@videojs/react/video';

import { cn } from '@/lib/utils';

const HelaliVideoJsPlayer = createPlayer({ features: videoFeatures });

const HELALI_VIDEO_SKIN_VARS = {
  '--media-border-radius': 'var(--radius)',
  '--media-video-border-radius': 'var(--radius)',
  '--media-color-primary': 'var(--primary-foreground)',
} as CSSProperties;

interface IVideoPlayerProps {
  readonly src: string;
  readonly mimeType?: string;
  readonly title?: string;
  readonly poster?: string;
  readonly className?: string;
  readonly compact?: boolean;
  readonly variant?: 'boxed' | 'plain';
  readonly controls?: boolean;
  readonly autoPlay?: boolean;
  readonly videoRef?: Ref<HTMLVideoElement>;
  readonly onPlay?: () => void;
  readonly onEnded?: () => void;
  readonly handleLoadedMetadata?: (duration: number) => void;
}

function VideoSource({
  src,
  mimeType,
  title,
  poster,
  autoPlay,
  videoRef,
  onPlay,
  onEnded,
  handleLoadedMetadata,
}: Pick<
  IVideoPlayerProps,
  | 'src'
  | 'mimeType'
  | 'title'
  | 'poster'
  | 'autoPlay'
  | 'videoRef'
  | 'onPlay'
  | 'onEnded'
  | 'handleLoadedMetadata'
>) {
  const videoLabel = title ?? 'پخش ویدیو';
  const sharedProps = {
    ref: videoRef,
    playsInline: true as const,
    preload: 'metadata' as const,
    poster,
    autoPlay,
    'aria-label': videoLabel,
    onPlay,
    onEnded,
    onLoadedMetadata: (event: SyntheticEvent<HTMLVideoElement>) =>
      handleLoadedMetadata?.(event.currentTarget.duration),
  };

  if (mimeType) {
    return (
      <Video {...sharedProps}>
        <source src={src} type={mimeType} />
      </Video>
    );
  }

  return <Video {...sharedProps} src={src} />;
}

export function VideoPlayer({
  src,
  mimeType,
  title,
  poster,
  className,
  compact = false,
  variant = 'boxed',
  controls = true,
  autoPlay = false,
  videoRef,
  onPlay,
  onEnded,
  handleLoadedMetadata,
}: IVideoPlayerProps) {
  const isPlain = variant === 'plain';

  const media = (
    <VideoSource
      src={src}
      mimeType={mimeType}
      title={title}
      poster={controls ? undefined : poster}
      autoPlay={autoPlay}
      videoRef={videoRef}
      onPlay={onPlay}
      onEnded={onEnded}
      handleLoadedMetadata={handleLoadedMetadata}
    />
  );

  if (!controls) {
    return (
      <div className={cn('relative h-full w-full', className)} dir="ltr">
        <HelaliVideoJsPlayer.Provider>
          <div className="h-full w-full [&_video]:h-full [&_video]:w-full [&_video]:object-cover">
            {media}
          </div>
        </HelaliVideoJsPlayer.Provider>
      </div>
    );
  }

  return (
    <article
      className={cn(
        isPlain
          ? 'relative h-full w-full'
          : [
              'group relative w-full overflow-hidden rounded-3xl border border-border/50',
              'bg-card shadow-mainshadow',
            ],
        className,
      )}
    >
      <div className={cn('relative h-full w-full', isPlain ? undefined : compact ? 'p-2' : undefined)}>
        <div
          dir="ltr"
          className={cn(
            'relative aspect-video h-full w-full overflow-hidden',
            isPlain ? undefined : 'rounded-3xl',
            compact ? 'min-h-[10rem]' : 'min-h-[12rem]',
          )}
        >
          <HelaliVideoJsPlayer.Provider>
            <VideoSkin
              className="helali-video-skin h-full w-full"
              style={HELALI_VIDEO_SKIN_VARS}
              poster={poster}
            >
              {media}
            </VideoSkin>
          </HelaliVideoJsPlayer.Provider>
        </div>
      </div>
    </article>
  );
}

export default VideoPlayer;
