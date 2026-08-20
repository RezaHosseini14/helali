'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';

import 'swiper/css';

import VideoPlayer from '@/components/global/VideoPlayer';
import { playMediaSafely } from '@/lib/play-media';
import { resolveVideoPlaybackSource } from '@/lib/video-playback';

import type { IStory } from './StoriesBox';

interface IReelsStoryViewerProps {
  stories: IStory[];
  initialIndex: number;
  onClose: () => void;
}

function ReelsStoryViewer({ stories, initialIndex, onClose }: IReelsStoryViewerProps) {
  const swiperRef = useRef<SwiperType | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [segmentProgress, setSegmentProgress] = useState<number[]>(() => stories.map(() => 0));
  const [isPaused, setIsPaused] = useState(false);

  const syncSegmentProgress = useCallback(
    (index: number, value: number) => {
      setSegmentProgress(
        stories.map((_, storyIndex) => {
          if (storyIndex < index) return 100;
          if (storyIndex > index) return 0;
          return value;
        }),
      );
    },
    [stories],
  );

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    syncSegmentProgress(activeIndex, 0);
    setIsPaused(false);
  }, [activeIndex, syncSegmentProgress]);

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;

      if (index === activeIndex && !isPaused) {
        playMediaSafely(() => video.play());
        return;
      }

      video.pause();
      if (index !== activeIndex) {
        video.currentTime = 0;
      }
    });
  }, [activeIndex, isPaused]);

  useEffect(() => {
    const video = videoRefs.current[activeIndex];
    if (!video) return;

    const handleTimeUpdate = () => {
      const { duration, currentTime } = video;
      if (!duration || !Number.isFinite(duration)) return;
      syncSegmentProgress(activeIndex, (currentTime / duration) * 100);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [activeIndex, syncSegmentProgress]);

  const goNext = () => {
    if (activeIndex < stories.length - 1) {
      swiperRef.current?.slideNext();
      return;
    }
    onClose();
  };

  const goPrev = () => {
    if (activeIndex > 0) {
      swiperRef.current?.slidePrev();
      return;
    }

    const video = videoRefs.current[activeIndex];
    if (video) {
      video.currentTime = 0;
      syncSegmentProgress(activeIndex, 0);
    }
  };

  const togglePause = () => {
    const video = videoRefs.current[activeIndex];
    if (!video) return;

    if (video.paused) {
      setIsPaused(false);
      playMediaSafely(() => video.play());
      return;
    }

    video.pause();
    setIsPaused(true);
  };

  const activeStory = stories[activeIndex];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-2 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="نمایش رییلز"
      onClick={onClose}
    >
      <div
        className="relative flex h-full w-full max-w-md flex-col overflow-hidden rounded-2xl border border-white/10 sm:h-[min(90vh,820px)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="absolute inset-x-0 top-0 z-30 bg-gradient-to-b from-black/70 via-black/20 to-transparent px-3 pb-16 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <div className="mb-3 flex gap-1">
            {stories.map((story, index) => (
              <div key={story.id} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/25">
                <div
                  className="h-full rounded-full bg-white transition-[width] duration-100 ease-linear"
                  style={{
                    width: `${index < activeIndex ? 100 : index === activeIndex ? segmentProgress[index] : 0}%`,
                  }}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="truncate text-sm font-medium text-white">{activeStory?.title}</p>
            <button
              type="button"
              onClick={onClose}
              aria-label="بستن"
              className="rounded-full p-1.5 text-white/90 transition hover:bg-white/10 hover:text-white"
            >
              <i className="ki-solid ki-cross-square text-2xl" />
            </button>
          </div>
        </div>

        <Swiper
          initialSlide={initialIndex}
          slidesPerView={1}
          spaceBetween={0}
          speed={280}
          resistanceRatio={0.85}
          longSwipesRatio={0.2}
          onSwiper={(swiperInstance) => {
            swiperRef.current = swiperInstance;
          }}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          className="h-full w-full"
        >
          {stories.map((story, index) => {
            const playback = resolveVideoPlaybackSource(story);

            return (
            <SwiperSlide key={story.id} className="relative h-full bg-black">
              <VideoPlayer
                src={playback.src}
                mimeType={playback.mimeType}
                title={story.title}
                poster={story.posterPath}
                controls={false}
                variant="plain"
                autoPlay={index === activeIndex}
                videoRef={(element) => {
                  videoRefs.current[index] = element;
                }}
                onEnded={goNext}
              />

              <button
                type="button"
                aria-label="رییلز قبلی"
                className="absolute inset-y-0 right-0 z-20 w-[35%] cursor-pointer bg-transparent"
                onClick={goPrev}
              />
              <button
                type="button"
                aria-label={isPaused && index === activeIndex ? 'ادامه پخش' : 'توقف موقت'}
                className="absolute inset-y-0 left-[35%] z-20 w-[30%] cursor-pointer bg-transparent"
                onClick={togglePause}
              />
              <button
                type="button"
                aria-label="رییلز بعدی"
                className="absolute inset-y-0 left-0 z-20 w-[35%] cursor-pointer bg-transparent"
                onClick={goNext}
              />
            </SwiperSlide>
            );
          })}
        </Swiper>

        {isPaused ? (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <span className="rounded-full bg-black/45 p-4 text-white backdrop-blur-sm">
              <Icon icon="solar:pause-bold" width="32" height="32" />
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default ReelsStoryViewer;
