'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Swiper as SwiperType } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Autoplay, EffectCoverflow, Pagination } from 'swiper/modules';
import VideoPlayer from '@/components/global/VideoPlayer';
import { Story } from './StoriesSlider';

type StoryViewerProps = {
  stories: Story[];
  initialIndex: number;
  onClose: () => void;
};

const StoryViewer: React.FC<StoryViewerProps> = ({ stories, initialIndex, onClose }) => {
  const swiperRef = useRef<SwiperType | null>(null);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    // توقف ویدیوی قبلی
    if (videoRefs.current[currentIndex - 1]) {
      videoRefs.current[currentIndex - 1]?.pause();
    }
    if (videoRefs.current[currentIndex + 1]) {
      videoRefs.current[currentIndex + 1]?.pause();
    }

    // پخش ویدیوی فعلی
    videoRefs.current[currentIndex]?.play();
  }, [currentIndex]);

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-90 flex justify-center items-center z-[100]">
      <button className="absolute top-4 right-4 text-white text-3xl z-50" onClick={onClose}>
        <i className="ki-solid ki-cross-square"></i>
      </button>

      <Swiper
        effect="coverflow"
        grabCursor={true}
        centeredSlides={true}
        slidesPerView={3}
        loop={true}
        coverflowEffect={{
          rotate: 0,
          stretch: -100,
          depth: 300,
          modifier: 1,
          slideShadows: true,
        }}
        pagination={{ clickable: true, el: '.custom-pagination' }}
        onSwiper={(swiperInstance) => (swiperRef.current = swiperInstance)}
        onSlideChange={(swiper) => setCurrentIndex(swiper.realIndex)}
        initialSlide={initialIndex}
        autoplay={{ delay: 30000, disableOnInteraction: false }}
        modules={[EffectCoverflow, Pagination, Autoplay]}
        className="size-4/5"
      >
        {stories.map((story, index) => (
          <SwiperSlide key={story.id} className="relative aspect-[192/341] rounded-xl overflow-hidden">
            <VideoPlayer
              src={story.path}
              poster={story.posterPath}
              autoPlay={index === currentIndex}
              ref={(el: HTMLVideoElement | null) => (videoRefs.current[index] = el)}
            />
            <div className="slider-controller absolute top-1/2 left-0 right-0 justify-between px-4 z-50">
              <button
                onClick={() => swiperRef.current?.slidePrev()}
                className="focus:outline-none bg-mainColor/70 hover:bg-mainColor backdrop-blur-md text-white p-2 rounded-full shadow-md transition-transform transform hover:scale-110"
              >
                <i className="ki-solid ki-to-right text-xl"></i>
              </button>
              <button
                onClick={() => swiperRef.current?.slideNext()}
                className="focus:outline-none bg-mainColor/70 hover:bg-mainColor backdrop-blur-md text-white p-2 rounded-full shadow-md transition-transform transform hover:scale-110"
              >
                <i className="ki-solid ki-to-left text-xl"></i>
              </button>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default StoryViewer;
