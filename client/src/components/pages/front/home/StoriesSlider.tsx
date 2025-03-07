'use client';
import React, { useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Swiper as SwiperType } from 'swiper';
import ReactDOM from 'react-dom';

//Css
import 'swiper/css';
import 'swiper/css/navigation';

//Components
import StoryViewer from './StoryViewer';
import ImageWithLoader from '@/components/global/ImageWithLoader';

export type Story = {
  id: number;
  title: string;
  originalName: string;
  path: string;
  mimetype: string;
  text: string;
  posterOriginalName: string;
  posterPath: string;
  created_at: string;
};

const StoriesSlider = ({ stories }: { stories: Story[] }) => {
  const swiperRef = useRef<SwiperType | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const openViewer = (index: number) => {
    setCurrentIndex(index);
    setIsViewerOpen(true);
  };

  return (
    <div>
      <Swiper
        spaceBetween={20}
        slidesPerView={2.2}
        onSwiper={(swiperInstance) => {
          swiperRef.current = swiperInstance;
        }}
        breakpoints={{
          500: {
            slidesPerView: 3.2,
            spaceBetween: 15,
          },
          640: {
            slidesPerView: 3,
            spaceBetween: 15,
          },
          768: {
            slidesPerView: 4.2,
            spaceBetween: 20,
          },
          1024: {
            slidesPerView: 5.2,
            spaceBetween: 25,
          },
        }}
        className="relative"
      >
        {stories?.map((story, index) => (
          <SwiperSlide
            key={index}
            className="aspect-[192/341] rounded-xl overflow-hidden cursor-pointer"
            onClick={() => openViewer(index)}
          >
            <ImageWithLoader src={story.posterPath} alt={story.title} className="object-cover" />
            <p className="story-title">{story.title}</p>
          </SwiperSlide>
        ))}
        <button
          onClick={() => swiperRef.current?.slidePrev()}
          className="absolute top-1/2 -translate-y-1/2 right-4 z-50 focus:outline-none bg-mainColor/70 hover:bg-mainColor backdrop-blur-md text-white p-2 rounded-full shadow-md transition-transform transform hover:scale-110"
        >
          <i className="ki-solid ki-to-right text-xl"></i>
        </button>
        <button
          onClick={() => swiperRef.current?.slideNext()}
          className="absolute top-1/2 -translate-y-1/2 left-4 z-50 focus:outline-none bg-mainColor/70 hover:bg-mainColor backdrop-blur-md text-white p-2 rounded-full shadow-md transition-transform transform hover:scale-110"
        >
          <i className="ki-solid ki-to-left text-xl"></i>
        </button>
      </Swiper>

      {isViewerOpen &&
        ReactDOM.createPortal(
          <StoryViewer stories={stories} initialIndex={currentIndex} onClose={() => setIsViewerOpen(false)} />,

          document.body,
        )}
    </div>
  );
};

export default StoriesSlider;
