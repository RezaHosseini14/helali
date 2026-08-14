'use client';

import { useRef } from 'react';
import { A11y, Autoplay, EffectFade, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';

import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';

import { useGalleryFeatured } from '@/features/gallery/hooks/use-gallery';
import ImageWithLoader from '@/components/global/ImageWithLoader';
import { HomeSliderSkeleton } from '@/components/pages/front/home/HomeSectionsLoading';

function resolveImageSrc(image: { path?: string | null; imageUrl?: string | null }): string {
  return image.path || image.imageUrl || '';
}

function HomeSlider() {
  const swiperRef = useRef<SwiperType | null>(null);
  const featuredQuery = useGalleryFeatured();

  const images = featuredQuery.data?.images ?? [];

  if (featuredQuery.isPending) {
    return <HomeSliderSkeleton />;
  }

  if (images.length === 0) {
    return null;
  }

  const hasMultiple = images.length > 1;

  return (
    <div className="home-slider-frame">
      <Swiper
        modules={[Navigation, Pagination, A11y, Autoplay, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={900}
        spaceBetween={0}
        slidesPerView={1}
        loop={hasMultiple}
        autoplay={hasMultiple ? { delay: 5600, disableOnInteraction: false } : false}
        pagination={
          hasMultiple
            ? {
                clickable: true,
                el: '.home-slider-pagination',
              }
            : false
        }
        onSwiper={(swiperInstance) => {
          swiperRef.current = swiperInstance;
        }}
        className="home-slider relative h-full"
      >
        {images.map((image) => {
          const src = resolveImageSrc(image);

          return (
            <SwiperSlide key={image.id} className="h-full">
              <div className="relative h-full w-full overflow-hidden">
                <div className="home-slider-kenburns absolute inset-0">
                  <ImageWithLoader
                    src={src}
                    alt={image.desc ?? 'تصویر منتخب'}
                    sizes="(max-width: 1024px) 100vw, 1200px"
                  />
                </div>
                <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-mainstructure/80 via-mainstructure/15 to-transparent" />
                {image.desc ? (
                  <div className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-8 lg:p-10">
                    <p className="max-w-2xl text-lg font-semibold tracking-tight text-white drop-shadow-sm sm:text-2xl lg:text-3xl">
                      {image.desc}
                    </p>
                  </div>
                ) : null}
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {hasMultiple ? (
        <>
          <div className="home-slider-pagination" />
          <div className="pointer-events-none absolute inset-x-0 top-1/2 z-20 flex -translate-y-1/2 justify-between px-3 sm:px-5">
            <button
              type="button"
              onClick={() => swiperRef.current?.slidePrev()}
              aria-label="اسلاید قبلی"
              className="pointer-events-auto grid size-10 place-content-center rounded-full border border-white/25 bg-white/10 text-white shadow-[0_8px_24px_-12px_rgba(0,0,0,0.55)] backdrop-blur-xl transition duration-300 hover:scale-105 hover:bg-white/20 sm:size-11"
            >
              <i className="ki-solid ki-to-right text-lg" />
            </button>
            <button
              type="button"
              onClick={() => swiperRef.current?.slideNext()}
              aria-label="اسلاید بعدی"
              className="pointer-events-auto grid size-10 place-content-center rounded-full border border-white/25 bg-white/10 text-white shadow-[0_8px_24px_-12px_rgba(0,0,0,0.55)] backdrop-blur-xl transition duration-300 hover:scale-105 hover:bg-white/20 sm:size-11"
            >
              <i className="ki-solid ki-to-left text-lg" />
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}

export default HomeSlider;
