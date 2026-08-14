'use client';

import { useRef } from 'react';
import Link from 'next/link';

import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { useAudios } from '@/features/audio/hooks/use-audios';
import { useGallery } from '@/features/gallery/hooks/use-gallery';
import { useVideoStories, useVideos } from '@/features/video/hooks/use-videos';
import AudiosBox from '@/components/pages/front/home/AudiosBox';
import HomeSlider from '@/components/pages/front/home/HomeSlider';
import {
  AudiosSectionSkeleton,
  ImagesSectionSkeleton,
  StoriesSectionSkeleton,
  VideosSectionSkeleton,
} from '@/components/pages/front/home/HomeSectionsLoading';
import ImagesBox from '@/components/pages/front/home/ImagesBox';
import LandingBox from '@/components/pages/front/home/LandingBox';
import StoriesBox, { type IStory } from '@/components/pages/front/home/StoriesBox';
import VideosBox from '@/components/pages/front/home/VideosBox';
import type { audioTypes } from 'types/audio.type';
import type { imageType } from 'types/image.type';
import type { videoTypes } from 'types/video.type';

export default function HomePage() {
  const targetRef = useRef<HTMLDivElement | null>(null);

  const audiosQuery = useAudios(1, 8);
  const imagesQuery = useGallery(1, 8);
  const videosQuery = useVideos(1, 6);
  const storiesQuery = useVideoStories();

  return (
    <>
      <LandingBox targetRef={targetRef} />

      <div
        ref={targetRef}
        className="relative z-10 mt-8 space-y-8 pb-28 sm:mt-10 sm:space-y-10 lg:mt-12 lg:space-y-12"
      >
        <div className="container">
          <HomeSlider />
        </div>

        <div className="container">
          {storiesQuery.isPending ? (
            <StoriesSectionSkeleton />
          ) : storiesQuery.isError ? (
            <ErrorState title="استوری‌ها بارگذاری نشد" onRetry={() => void storiesQuery.refetch()} />
          ) : (storiesQuery.data?.stories.length ?? 0) > 0 ? (
            <StoriesBox stories={(storiesQuery.data?.stories ?? []) as unknown as IStory[]} />
          ) : (
            <EmptyState title="رییلزی یافت نشد" description="به‌زودی رییلزهای جدید اضافه می‌شود." />
          )}
        </div>

        <div className="container">
          {audiosQuery.isPending ? (
            <AudiosSectionSkeleton />
          ) : audiosQuery.isError ? (
            <ErrorState title="صوت‌ها بارگذاری نشد" onRetry={() => void audiosQuery.refetch()} />
          ) : (audiosQuery.data?.audios.length ?? 0) > 0 ? (
            <AudiosBox audios={(audiosQuery.data?.audios ?? []) as unknown as audioTypes[]} />
          ) : (
            <EmptyState title="صوتی یافت نشد" description="به‌زودی آثار صوتی جدید منتشر می‌شود." />
          )}
        </div>

        <div className="container">
          {imagesQuery.isPending ? (
            <ImagesSectionSkeleton />
          ) : imagesQuery.isError ? (
            <ErrorState title="گالری بارگذاری نشد" onRetry={() => void imagesQuery.refetch()} />
          ) : (
            <ImagesBox images={(imagesQuery.data?.images ?? []) as unknown as imageType[]} />
          )}
        </div>

        <div className="container">
          {videosQuery.isPending ? (
            <VideosSectionSkeleton />
          ) : videosQuery.isError ? (
            <ErrorState title="ویدیوها بارگذاری نشد" onRetry={() => void videosQuery.refetch()} />
          ) : (videosQuery.data?.videos.length ?? 0) > 0 ? (
            <VideosBox videos={(videosQuery.data?.videos ?? []) as unknown as videoTypes[]} />
          ) : (
            <EmptyState title="ویدیویی یافت نشد" description="به‌زودی ویدیوهای جدید منتشر می‌شود." />
          )}
        </div>

        <div className="container">
          <Link
            href="/children"
            className="group block overflow-hidden rounded-3xl border border-border/50 bg-card/80 shadow-mainshadow transition hover:shadow-lg"
          >
            <div className="azizamhosein-banner transition duration-700 group-hover:scale-[1.015]" />
          </Link>
        </div>
      </div>
    </>
  );
}
