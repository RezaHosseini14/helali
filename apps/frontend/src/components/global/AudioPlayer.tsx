'use client';

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import WaveSurfer from 'wavesurfer.js';
import Hover from 'wavesurfer.js/dist/plugins/hover.esm.js';

import {
  closePlayer,
  cycleRepeatMode,
  hydrateVolume,
  playNext,
  playPrev,
  replayCurrent,
  selectCurrentAudio,
  setMinimized,
  setPlaying,
  setVolume,
  toggleMute,
  togglePlayback,
  type AudioRepeatMode,
} from '@/redux/slices/audioSlice';
import type { AppDispatch, RootState } from '@/redux/store';
import { BRAND_COLORS } from '@/lib/brand';
import { playMediaSafely } from '@/lib/play-media';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatTime } from 'utils/functions';

import ImageWithLoader from './ImageWithLoader';

const ARTIST_NAME = 'عبدالرضا هلالی';
const WAVEFORM_HEIGHT = 56;

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

function repeatLabel(mode: AudioRepeatMode): string {
  if (mode === 'one') {
    return 'تکرار یک قطعه';
  }

  if (mode === 'all') {
    return 'تکرار فهرست';
  }

  return 'بدون تکرار';
}

function AudioPlayer() {
  const dispatch = useDispatch<AppDispatch>();
  const prefersReducedMotion = useReducedMotion();
  const waveformId = useId();

  const {
    isOpen,
    isPlaying,
    isMinimized,
    currentIndex,
    queue,
    volume,
    isMuted,
    repeatMode,
    playbackToken,
  } = useSelector((state: RootState) => state.audio);
  const currentAudio = useSelector(selectCurrentAudio);

  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const isPlayingRef = useRef(isPlaying);
  const repeatModeRef = useRef(repeatMode);
  const lastPlaybackTokenRef = useRef(0);
  const effectiveVolumeRef = useRef(isMuted ? 0 : volume);

  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isVolumeOpen, setIsVolumeOpen] = useState(false);

  const canGoPrev = currentIndex >= 0;
  const canGoNext = currentIndex >= 0 && (currentIndex < queue.length - 1 || repeatMode === 'all');
  const effectiveVolume = isMuted ? 0 : volume;
  const trackSrc = currentAudio?.path ?? '';

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    repeatModeRef.current = repeatMode;
  }, [repeatMode]);

  useEffect(() => {
    effectiveVolumeRef.current = effectiveVolume;
  }, [effectiveVolume]);

  useEffect(() => {
    dispatch(hydrateVolume());
  }, [dispatch]);

  const handleToggle = useCallback(() => {
    dispatch(togglePlayback());
  }, [dispatch]);

  const handleNext = useCallback(() => {
    dispatch(playNext());
  }, [dispatch]);

  const handlePrev = useCallback(() => {
    const wavesurfer = wavesurferRef.current;

    if (wavesurfer && wavesurfer.getCurrentTime() > 3) {
      wavesurfer.setTime(0);
      dispatch(setPlaying(true));
      return;
    }

    dispatch(playPrev());
  }, [dispatch]);

  const handleClose = useCallback(() => {
    wavesurferRef.current?.pause();
    dispatch(closePlayer());
  }, [dispatch]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();

      if (tag === 'input' || tag === 'textarea' || target?.isContentEditable) {
        return;
      }

      if (event.code === 'Space') {
        event.preventDefault();
        dispatch(togglePlayback());
        return;
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        dispatch(playPrev());
        return;
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        dispatch(playNext());
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [dispatch, isOpen]);

  useEffect(() => {
    if (!isOpen || !currentAudio || typeof navigator === 'undefined' || !('mediaSession' in navigator)) {
      return;
    }

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentAudio.title,
      artist: ARTIST_NAME,
      artwork: currentAudio.posterPath
        ? [
            { src: currentAudio.posterPath, sizes: '256x256', type: 'image/jpeg' },
            { src: currentAudio.posterPath, sizes: '512x512', type: 'image/jpeg' },
          ]
        : [],
    });

    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

    navigator.mediaSession.setActionHandler('play', () => dispatch(setPlaying(true)));
    navigator.mediaSession.setActionHandler('pause', () => dispatch(setPlaying(false)));
    navigator.mediaSession.setActionHandler('previoustrack', () => dispatch(playPrev()));
    navigator.mediaSession.setActionHandler('nexttrack', () => dispatch(playNext()));
    navigator.mediaSession.setActionHandler('stop', () => dispatch(closePlayer()));

    return () => {
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('previoustrack', null);
      navigator.mediaSession.setActionHandler('nexttrack', null);
      navigator.mediaSession.setActionHandler('stop', null);
    };
  }, [currentAudio, dispatch, isOpen, isPlaying]);

  // Keep WaveSurfer mounted for the whole open lifetime (minimize must NOT unmount the container).
  useLayoutEffect(() => {
    if (!isOpen || !trackSrc) {
      return;
    }

    const container = containerRef.current;

    if (!container) {
      return;
    }

    setIsReady(false);
    setHasError(false);
    setCurrentTime(0);
    setDuration(0);
    container.replaceChildren();

    const wavesurfer = WaveSurfer.create({
      container,
      url: trackSrc,
      height: WAVEFORM_HEIGHT,
      width: container.clientWidth || undefined,
      barWidth: 2,
      barGap: 2,
      barRadius: 3,
      barHeight: 0.9,
      normalize: true,
      cursorWidth: 2,
      dragToSeek: true,
      interact: true,
      waveColor: 'rgba(247, 250, 249, 0.35)',
      progressColor: '#f7faf9',
      cursorColor: BRAND_COLORS.accent,
      plugins: [
        Hover.create({
          lineColor: 'rgba(247, 250, 249, 0.65)',
          lineWidth: 1,
          labelBackground: BRAND_COLORS.structure,
          labelColor: '#f7faf9',
          labelSize: '11px',
          formatTimeCallback: formatTime,
        }),
      ],
    });

    wavesurferRef.current = wavesurfer;
    wavesurfer.setVolume(effectiveVolumeRef.current);

    let isDisposed = false;

    const handleReady = (): void => {
      if (isDisposed) {
        return;
      }

      setIsReady(true);
      setDuration(wavesurfer.getDuration());

      if (container.clientWidth > 0) {
        wavesurfer.setOptions({ width: container.clientWidth });
      }

      if (isPlayingRef.current) {
        playMediaSafely(() => wavesurfer.play());
      }
    };

    const handlePlay = (): void => {
      if (isDisposed) {
        return;
      }

      dispatch(setPlaying(true));
    };

    const handlePause = (): void => {
      if (isDisposed || wavesurfer.isPlaying()) {
        return;
      }

      dispatch(setPlaying(false));
    };

    const handleTimeUpdate = (time: number): void => {
      if (isDisposed) {
        return;
      }

      setCurrentTime(time);
    };

    const handleFinish = (): void => {
      if (isDisposed) {
        return;
      }

      if (repeatModeRef.current === 'one') {
        dispatch(replayCurrent());
        return;
      }

      dispatch(playNext());
    };

    const handleError = (): void => {
      if (isDisposed) {
        return;
      }

      setHasError(true);
      setIsReady(false);
      dispatch(setPlaying(false));
    };

    wavesurfer.on('ready', handleReady);
    wavesurfer.on('play', handlePlay);
    wavesurfer.on('pause', handlePause);
    wavesurfer.on('timeupdate', handleTimeUpdate);
    wavesurfer.on('finish', handleFinish);
    wavesurfer.on('error', handleError);

    const resizeObserver = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;

      if (!width || isDisposed) {
        return;
      }

      wavesurfer.setOptions({ width: Math.floor(width) });
    });

    resizeObserver.observe(container);

    return () => {
      isDisposed = true;
      resizeObserver.disconnect();
      wavesurfer.un('ready', handleReady);
      wavesurfer.un('play', handlePlay);
      wavesurfer.un('pause', handlePause);
      wavesurfer.un('timeupdate', handleTimeUpdate);
      wavesurfer.un('finish', handleFinish);
      wavesurfer.un('error', handleError);
      wavesurfer.destroy();
      wavesurferRef.current = null;
    };
  }, [dispatch, isOpen, trackSrc]);

  useEffect(() => {
    const wavesurfer = wavesurferRef.current;

    if (!wavesurfer || !isReady) {
      return;
    }

    if (playbackToken > 0 && playbackToken !== lastPlaybackTokenRef.current) {
      lastPlaybackTokenRef.current = playbackToken;
      wavesurfer.setTime(0);
    }

    if (isPlaying) {
      if (!wavesurfer.isPlaying()) {
        playMediaSafely(() => wavesurfer.play());
      }
    } else if (wavesurfer.isPlaying()) {
      wavesurfer.pause();
    }
  }, [isPlaying, isReady, playbackToken]);

  useEffect(() => {
    wavesurferRef.current?.setVolume(effectiveVolume);
  }, [effectiveVolume]);

  // When expanding from minimized, redraw waveform at visible width.
  useEffect(() => {
    if (isMinimized || !isReady) {
      return;
    }

    const wavesurfer = wavesurferRef.current;
    const container = containerRef.current;

    if (!wavesurfer || !container?.clientWidth) {
      return;
    }

    wavesurfer.setOptions({ width: container.clientWidth });
  }, [isMinimized, isReady]);

  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <AnimatePresence>
      {isOpen && currentAudio ? (
        <motion.div
          key="helali-audio-player"
          role="region"
          aria-label="پخش‌کننده صوت"
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.96 }}
          animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className={cn(
            'pointer-events-none fixed z-50',
            'inset-x-3 bottom-3 sm:inset-x-auto sm:inset-e-4 sm:bottom-4 sm:w-[min(100vw-2rem,26rem)]',
          )}
        >
          <div className="pointer-events-auto relative">
            {/* Mini chrome — full player (and WaveSurfer host) stays mounted underneath */}
            {isMinimized ? (
              <div className="ms-auto flex w-fit items-center gap-2 rounded-full border border-white/15 bg-[#164842]/92 p-1.5 pe-2 shadow-[0_20px_50px_-24px_rgba(22,72,66,0.95)] backdrop-blur-xl">
                <button
                  type="button"
                  onClick={() => dispatch(setMinimized(false))}
                  className="relative size-12 overflow-hidden rounded-full ring-2 ring-white/25"
                  aria-label="باز کردن پخش‌کننده"
                >
                  <ImageWithLoader src={currentAudio.posterPath} alt={currentAudio.title} />
                  {isPlaying && !prefersReducedMotion ? (
                    <span className="pointer-events-none absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-white/70 animation-duration-[3.2s]" />
                  ) : null}
                </button>

                <button
                  type="button"
                  onClick={handleToggle}
                  aria-label={isPlaying ? 'توقف' : 'پخش'}
                  className="grid size-10 place-content-center rounded-full bg-white text-[#164842] shadow-md transition hover:bg-[#f7faf9]"
                >
                  {isPlaying ? <PauseIcon className="size-4" /> : <PlayIcon className="ms-0.5 size-4" />}
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  aria-label="بستن"
                  className="grid size-9 place-content-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
                >
                  <i className="ki-outline ki-cross text-sm" />
                </button>
              </div>
            ) : null}

            <div
              className={cn(
                'relative overflow-hidden rounded-[1.35rem]',
                'bg-[linear-gradient(155deg,#164842_0%,#0f6e61_55%,#178a7a_100%)]',
                'shadow-[0_24px_60px_-28px_rgba(22,72,66,0.9)]',
                'ring-1 ring-white/15',
                isMinimized && 'pointer-events-none absolute inset-x-0 bottom-0 -z-10 opacity-0',
              )}
              aria-hidden={isMinimized}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-50"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 12% 18%, rgba(247,250,249,0.2), transparent 40%), radial-gradient(circle at 88% 82%, rgba(23,138,122,0.4), transparent 48%)',
                }}
                aria-hidden="true"
              />

              <div className="absolute inset-x-0 top-0 h-0.5 bg-white/10" aria-hidden="true">
                <div
                  className="h-full bg-white/80 transition-[width] duration-200 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="relative flex flex-col gap-3 p-3.5 sm:p-4">
                <div className="flex items-start gap-3">
                  <div className="relative shrink-0">
                    <div
                      className={cn(
                        'relative size-17 overflow-hidden rounded-2xl bg-white/10 shadow-lg ring-1 ring-white/25 sm:size-19',
                        isPlaying &&
                          !prefersReducedMotion &&
                          'shadow-[0_0_0_1px_rgba(247,250,249,0.2),0_12px_28px_-10px_rgba(0,0,0,0.45)]',
                      )}
                    >
                      <ImageWithLoader src={currentAudio.posterPath} alt={currentAudio.title} />
                    </div>
                    {isPlaying && !prefersReducedMotion ? (
                      <span className="pointer-events-none absolute -inset-1 -z-10 animate-pulse rounded-[1.2rem] bg-white/20 blur-md" />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className="text-[10px] font-medium tracking-[0.22em] text-white/55 uppercase">
                      در حال پخش
                    </p>
                    <h2 className="mt-1 truncate text-[0.95rem] font-semibold text-white sm:text-base">
                      {currentAudio.title}
                    </h2>
                    <p className="mt-0.5 truncate text-xs text-white/70">{ARTIST_NAME}</p>
                    <p className="mt-2 font-mono text-[11px] tabular-nums text-white/65">
                      {formatTime(currentTime)}
                      <span className="mx-1.5 text-white/35">/</span>
                      {formatTime(duration)}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => dispatch(setMinimized(true))}
                      aria-label="کوچک کردن"
                      className="grid size-8 place-content-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
                    >
                      <i className="ki-outline ki-minus text-sm" />
                    </button>
                    <button
                      type="button"
                      onClick={handleClose}
                      aria-label="بستن پخش‌کننده"
                      className="grid size-8 place-content-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
                    >
                      <i className="ki-outline ki-cross text-sm" />
                    </button>
                  </div>
                </div>

                <div className="relative min-h-14 rounded-xl bg-black/20 px-2 py-1.5 ring-1 ring-white/10">
                  {!isReady && !hasError ? (
                    <div className="absolute inset-2 flex items-center gap-1">
                      {Array.from({ length: 28 }).map((_, index) => (
                        <span
                          key={index}
                          className="flex-1 animate-pulse rounded-full bg-white/20"
                          style={{
                            animationDelay: `${index * 40}ms`,
                            height: `${30 + ((index * 17) % 40)}%`,
                          }}
                        />
                      ))}
                    </div>
                  ) : null}

                  {hasError ? (
                    <p className="px-2 py-3 text-xs text-white/85" role="alert">
                      بارگذاری موج صوت ناموفق بود. قطعه دیگری را امتحان کنید.
                    </p>
                  ) : null}

                  {/* Always mounted WaveSurfer host (even during loading / after error recreate on next track) */}
                  <div
                    id={waveformId}
                    ref={containerRef}
                    className={cn(
                      'w-full cursor-pointer transition-opacity duration-300',
                      '[&_wave]:w-full!',
                      '[&_canvas]:max-w-full!',
                      hasError || !isReady ? 'opacity-0' : 'opacity-100',
                    )}
                    style={{ minHeight: WAVEFORM_HEIGHT }}
                    aria-hidden={!isReady || hasError}
                  />
                </div>

                <div className="flex items-center justify-between gap-2">
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <button
                          type="button"
                          onClick={() => dispatch(cycleRepeatMode())}
                          aria-label={repeatLabel(repeatMode)}
                          className={cn(
                            'grid size-9 place-content-center rounded-full text-white/65 transition hover:bg-white/10 hover:text-white',
                            repeatMode !== 'off' && 'bg-white/15 text-white',
                          )}
                        />
                      }
                    >
                      <i
                        className={cn(
                          'text-base',
                          repeatMode === 'one' ? 'ki-solid ki-arrow-circle-left' : 'ki-outline ki-arrows-loop',
                        )}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top">{repeatLabel(repeatMode)}</TooltipContent>
                  </Tooltip>

                  {/* LTR transport: prev | play | next — RTL page was flipping icons vs actions */}
                  <div dir="ltr" className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      type="button"
                      onClick={handlePrev}
                      disabled={!canGoPrev}
                      aria-label="قطعه قبلی"
                      className="grid size-10 place-content-center rounded-full text-white/85 transition hover:bg-white/10 disabled:opacity-35"
                    >
                      <i className="ki-solid ki-to-left text-lg" />
                    </button>

                    <button
                      type="button"
                      onClick={handleToggle}
                      disabled={!isReady || hasError}
                      aria-label={isPlaying ? 'توقف' : 'پخش'}
                      aria-controls={waveformId}
                      className={cn(
                        'grid size-12 place-content-center rounded-full border-0',
                        'bg-white text-[#164842] shadow-[0_10px_28px_-10px_rgba(0,0,0,0.55)]',
                        'transition hover:scale-105 hover:bg-[#f7faf9]',
                        'disabled:scale-100 disabled:bg-white/40 disabled:text-[#164842]/60',
                      )}
                    >
                      {isPlaying ? (
                        <PauseIcon className="size-[1.15rem]" />
                      ) : (
                        <PlayIcon className="ms-0.5 size-[1.15rem]" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={!canGoNext}
                      aria-label="قطعه بعدی"
                      className="grid size-10 place-content-center rounded-full text-white/85 transition hover:bg-white/10 disabled:opacity-35"
                    >
                      <i className="ki-solid ki-to-right text-lg" />
                    </button>
                  </div>

                  <div className="relative">
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <button
                            type="button"
                            onClick={() => setIsVolumeOpen((open) => !open)}
                            onDoubleClick={() => dispatch(toggleMute())}
                            aria-label={isMuted || volume === 0 ? 'بی‌صدا' : 'صدا'}
                            className={cn(
                              'grid size-9 place-content-center rounded-full text-white/65 transition hover:bg-white/10 hover:text-white',
                              isVolumeOpen && 'bg-white/15 text-white',
                            )}
                          />
                        }
                      >
                        <i
                          className={cn(
                            'text-base',
                            isMuted || volume === 0 ? 'ki-outline ki-speaker-cross' : 'ki-outline ki-speaker',
                          )}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        {isMuted || volume === 0 ? 'بی‌صدا' : 'میزان صدا'}
                      </TooltipContent>
                    </Tooltip>

                    <AnimatePresence>
                      {isVolumeOpen ? (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          className="absolute inset-e-0 bottom-[calc(100%+0.5rem)] rounded-xl border border-white/15 bg-[#12201e]/95 p-3 shadow-xl backdrop-blur-md"
                        >
                          <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.01}
                            value={isMuted ? 0 : volume}
                            aria-label="میزان صدا"
                            onChange={(event) => {
                              dispatch(setVolume(Number(event.target.value)));
                            }}
                            className="h-24 w-8 cursor-pointer appearance-none bg-transparent [&::-webkit-slider-runnable-track]:w-1.5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-white/25 [&::-webkit-slider-thumb]:mt-0 [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                            style={{ writingMode: 'vertical-lr' }}
                          />
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default AudioPlayer;
