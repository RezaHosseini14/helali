'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import Hover from 'wavesurfer.js/dist/plugins/hover.esm.js';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BRAND_COLORS } from '@/lib/brand';
import { playMediaSafely } from '@/lib/play-media';
import { cn } from '@/lib/utils';

interface IAudioModalPlayerProps {
  readonly src: string;
  readonly title?: string;
  readonly className?: string;
  readonly onReplace?: () => void;
  readonly onRemove?: () => void;
  readonly disabled?: boolean;
}

function formatAudioTime(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return '0:00';
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function PlayIcon({ className }: { readonly className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M8 5.14v13.72a1 1 0 0 0 1.5.87l11.04-6.86a1 1 0 0 0 0-1.74L9.5 4.27A1 1 0 0 0 8 5.14Z" />
    </svg>
  );
}

function PauseIcon({ className }: { readonly className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M7 5a2 2 0 0 1 2 2v10a2 2 0 1 1-4 0V7a2 2 0 0 1 2-2Zm10 0a2 2 0 0 1 2 2v10a2 2 0 1 1-4 0V7a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

let activeWaveSurfer: WaveSurfer | null = null;

export function AudioModalPlayer({
  src,
  title,
  className,
  onReplace,
  onRemove,
  disabled = false,
}: IAudioModalPlayerProps) {
  const waveformId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlayback = useCallback((): void => {
    const wavesurfer = wavesurferRef.current;

    if (!wavesurfer || !isReady || disabled) {
      return;
    }

    playMediaSafely(() => wavesurfer.playPause());
  }, [disabled, isReady]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container || !src) {
      return;
    }

    setIsReady(false);
    setHasError(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    const wavesurfer = WaveSurfer.create({
      container,
      url: src,
      height: 72,
      barWidth: 2,
      barGap: 2,
      barRadius: 4,
      barHeight: 0.9,
      normalize: true,
      cursorWidth: 2,
      dragToSeek: true,
      waveColor: 'rgba(255, 255, 255, 0.28)',
      progressColor: BRAND_COLORS.accent,
      cursorColor: '#f7faf9',
      plugins: [
        Hover.create({
          lineColor: 'rgba(247, 250, 249, 0.55)',
          lineWidth: 1,
          labelBackground: BRAND_COLORS.structure,
          labelColor: '#f7faf9',
          labelSize: '11px',
          formatTimeCallback: formatAudioTime,
        }),
      ],
    });

    wavesurferRef.current = wavesurfer;

    const handleReady = (): void => {
      setIsReady(true);
      setDuration(wavesurfer.getDuration());
    };

    const handlePlay = (): void => {
      if (activeWaveSurfer && activeWaveSurfer !== wavesurfer) {
        activeWaveSurfer.pause();
      }

      activeWaveSurfer = wavesurfer;
      setIsPlaying(true);
    };

    const handlePause = (): void => {
      if (activeWaveSurfer === wavesurfer) {
        activeWaveSurfer = null;
      }

      setIsPlaying(false);
    };

    const handleTimeUpdate = (time: number): void => {
      setCurrentTime(time);
    };

    const handleFinish = (): void => {
      setIsPlaying(false);

      if (activeWaveSurfer === wavesurfer) {
        activeWaveSurfer = null;
      }
    };

    const handleError = (): void => {
      setHasError(true);
      setIsReady(false);
    };

    wavesurfer.on('ready', handleReady);
    wavesurfer.on('play', handlePlay);
    wavesurfer.on('pause', handlePause);
    wavesurfer.on('timeupdate', handleTimeUpdate);
    wavesurfer.on('finish', handleFinish);
    wavesurfer.on('error', handleError);

    return () => {
      if (activeWaveSurfer === wavesurfer) {
        activeWaveSurfer = null;
      }

      wavesurfer.un('ready', handleReady);
      wavesurfer.un('play', handlePlay);
      wavesurfer.un('pause', handlePause);
      wavesurfer.un('timeupdate', handleTimeUpdate);
      wavesurfer.un('finish', handleFinish);
      wavesurfer.un('error', handleError);
      wavesurfer.destroy();
      wavesurferRef.current = null;
    };
  }, [src]);

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl',
        'bg-[linear-gradient(145deg,#164842_0%,#0f6e61_52%,#178a7a_100%)]',
        'shadow-[0_18px_40px_-24px_rgba(22,72,66,0.85)]',
        'ring-1 ring-white/10',
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle at 18% 20%, rgba(247,250,249,0.18), transparent 42%), radial-gradient(circle at 88% 78%, rgba(23,138,122,0.35), transparent 46%)',
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-black/25 to-transparent"
        aria-hidden="true"
      />

      <div className="relative flex h-full flex-col gap-4 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-medium tracking-[0.18em] text-white/55 uppercase">
              پیش‌نمایش صوت
            </p>
            {title ? (
              <h3 className="mt-1 truncate text-base font-semibold text-white">{title}</h3>
            ) : null}
            <p className="mt-1 font-mono text-xs tabular-nums text-white/70">
              {formatAudioTime(currentTime)}
              <span className="mx-1.5 text-white/35">/</span>
              {formatAudioTime(duration)}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            {onReplace ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={disabled}
                onClick={onReplace}
                className="h-8 rounded-full border border-white/15 bg-white/10 px-3 text-xs text-white hover:bg-white/20 hover:text-white"
              >
                تعویض
              </Button>
            ) : null}
            {onRemove ? (
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                disabled={disabled}
                onClick={onRemove}
                aria-label="حذف فایل صوتی"
                className="rounded-full border border-white/15 bg-white/10 text-white hover:bg-destructive/80 hover:text-white"
              >
                <i className="ki-outline ki-cross text-sm" />
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mt-auto flex items-center gap-3 sm:gap-4">
          <Button
            type="button"
            size="icon-lg"
            onClick={togglePlayback}
            disabled={!isReady || hasError || disabled}
            aria-label={isPlaying ? 'توقف' : 'پخش'}
            aria-controls={waveformId}
            className={cn(
              'size-14 shrink-0 rounded-full border-0',
              'bg-white text-[#164842] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.55)]',
              'hover:bg-[#f7faf9] hover:text-[#0f6e61]',
              'disabled:bg-white/40 disabled:text-[#164842]/60',
            )}
          >
            {isPlaying ? (
              <PauseIcon className="size-5" />
            ) : (
              <PlayIcon className="ms-0.5 size-5" />
            )}
          </Button>

          <div className="relative min-w-0 flex-1">
            {!isReady && !hasError ? (
              <Skeleton className="absolute inset-0 h-18 rounded-xl bg-white/15" />
            ) : null}

            {hasError ? (
              <p
                className="rounded-xl border border-white/15 bg-black/20 px-3 py-4 text-xs text-white/85"
                role="alert"
              >
                بارگذاری موج صوت ناموفق بود. فایل را دوباره انتخاب کنید.
              </p>
            ) : (
              <div
                id={waveformId}
                ref={containerRef}
                className={cn(
                  'w-full cursor-pointer rounded-xl transition-opacity duration-300',
                  '[&_wave]:w-full!',
                  !isReady ? 'opacity-0' : 'opacity-100',
                )}
                aria-hidden={!isReady}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
