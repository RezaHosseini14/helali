'use client';

import { useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { Icon } from '@iconify/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';

import 'swiper/css';

import ImageWithLoader from '@/components/global/ImageWithLoader';
import Panel from '@/components/global/Panel';
import ReelsStoryViewer from './ReelsStoryViewer';

export interface IStory {
  id: number;
  title: string;
  originalName: string;
  path: string;
  mimetype: string;
  text: string;
  posterOriginalName: string;
  posterPath: string;
  created_at: string;
}

/** @deprecated Prefer IStory */
export type Story = IStory;

function StoriesBox({ stories }: { stories: IStory[] }) {
  const swiperRef = useRef<SwiperType | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleOpenViewer = (index: number) => {
    setCurrentIndex(index);
    setIsViewerOpen(true);
  };

  const storySlides = useMemo(
    () =>
      stories.map((story, index) => (
        <SwiperSlide
          key={story.id ?? index}
          className="aspect-[192/341] cursor-pointer overflow-hidden rounded-2xl border border-border/40 shadow-sm transition hover:-translate-y-1 hover:shadow-mainshadow"
          onClick={() => handleOpenViewer(index)}
        >
          <ImageWithLoader src={story.posterPath} alt={story.title} className="object-cover" />
          <p className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-mainstructure/90 to-transparent px-3 pt-10 pb-3 text-sm font-medium text-white">
            {story.title}
          </p>
        </SwiperSlide>
      )),
    [stories],
  );

  if (!stories.length) {
    return null;
  }

  return (
    <Panel
      title="رییلز"
      fill
      icon={<Icon icon="solar:clapperboard-play-bold-duotone" width="22" height="22" />}
    >
      <div className="relative">
        <Swiper
          spaceBetween={16}
          slidesPerView={2.2}
          onSwiper={(swiperInstance) => {
            swiperRef.current = swiperInstance;
          }}
          breakpoints={{
            500: { slidesPerView: 3.2, spaceBetween: 14 },
            640: { slidesPerView: 3, spaceBetween: 14 },
            768: { slidesPerView: 4.2, spaceBetween: 18 },
            1024: { slidesPerView: 5.2, spaceBetween: 20 },
          }}
          className="stories-swiper relative"
        >
          {storySlides}
          <button
            type="button"
            onClick={() => swiperRef.current?.slidePrev()}
            aria-label="رییلز قبلی"
            className="absolute top-1/2 right-3 z-20 -translate-y-1/2 rounded-full bg-mainstructure/75 p-2.5 text-white shadow-md backdrop-blur-md transition hover:scale-110 hover:bg-mainstructure"
          >
            <i className="ki-solid ki-to-right text-xl" />
          </button>
          <button
            type="button"
            onClick={() => swiperRef.current?.slideNext()}
            aria-label="رییلز بعدی"
            className="absolute top-1/2 left-3 z-20 -translate-y-1/2 rounded-full bg-mainstructure/75 p-2.5 text-white shadow-md backdrop-blur-md transition hover:scale-110 hover:bg-mainstructure"
          >
            <i className="ki-solid ki-to-left text-xl" />
          </button>
        </Swiper>
      </div>

      {isViewerOpen
        ? ReactDOM.createPortal(
            <ReelsStoryViewer stories={stories} initialIndex={currentIndex} onClose={() => setIsViewerOpen(false)} />,
            document.body,
          )
        : null}
    </Panel>
  );
}

export default StoriesBox;
