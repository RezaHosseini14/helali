'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Autoplay, EffectCoverflow, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

import ChildrenPanel from '@/components/global/ChildrenPanel';
import ImageWithLoader from '@/components/global/ImageWithLoader';

interface IGallerySlide {
  readonly id: number;
  readonly image: string;
  readonly title: string;
}

const GALLERY_SLIDES: ReadonlyArray<IGallerySlide> = [
  { id: 1, image: '/images/azizam/1.jpg', title: 'لحظه‌های قشنگ' },
  { id: 2, image: '/images/azizam/2.jpg', title: 'با هم بودن' },
  { id: 3, image: '/images/azizam/3.jpg', title: 'یادگاری عزیزم حسین' },
  { id: 4, image: '/images/azizam/4.jpg', title: 'خنده‌های کودکانه' },
  { id: 5, image: '/images/azizam/5.jpg', title: 'قصه‌های شیرین' },
  { id: 6, image: '/images/azizam/13.jpg', title: 'آسمان محبت' },
  { id: 7, image: '/images/azizam/14.jpg', title: 'نور و امید' },
];

function ChildrenGallery() {
  const swiperRef = useRef<SwiperType | null>(null);

  return (
    <section id="gallery" className="cloud-pattern scroll-mt-8 w-full bg-childrencolor py-10">
      <div className="container">
        <ChildrenPanel
          title="گالری"
          fill
          icon="ki-solid ki-slider-horizontal-2"
          className="!bg-white/15 !text-white !shadow-none border-white/30"
        >
          <div className="flex w-full flex-col items-center justify-center gap-6">
            <Swiper
              effect="coverflow"
              grabCursor
              centeredSlides
              loop
              autoplay={{
                delay: 7000,
                disableOnInteraction: false,
              }}
              breakpoints={{
                0: { slidesPerView: 1.15, spaceBetween: 12 },
                640: { slidesPerView: 2, spaceBetween: 16 },
                1024: { slidesPerView: 3, spaceBetween: 20 },
              }}
              coverflowEffect={{
                rotate: 0,
                stretch: 0,
                depth: 300,
                modifier: 1,
                slideShadows: false,
              }}
              pagination={{
                clickable: true,
                el: '.children-gallery-pagination',
              }}
              onSwiper={(swiperInstance) => {
                swiperRef.current = swiperInstance;
              }}
              modules={[EffectCoverflow, Pagination, Autoplay]}
              className="h-[22rem] w-full sm:h-[28rem] lg:h-[32rem]"
            >
              {GALLERY_SLIDES.map((slide, index) => (
                <SwiperSlide key={slide.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{
                      duration: 0.7,
                      delay: Math.min(index * 0.08, 0.4),
                      ease: 'easeOut',
                    }}
                    className="relative h-full overflow-hidden rounded-3xl"
                  >
                    <ImageWithLoader src={slide.image} alt={slide.title} />
                    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-childrencolordarker to-transparent p-4 text-white">
                      <h3 className="potk text-xl sm:text-2xl">{slide.title}</h3>
                    </div>
                  </motion.div>
                </SwiperSlide>
              ))}
            </Swiper>

            <div className="flex items-center gap-6">
              <button
                type="button"
                aria-label="اسلاید قبلی"
                onClick={() => swiperRef.current?.slidePrev()}
                className="rounded-full bg-white/30 p-2 text-white shadow-md backdrop-blur-md transition-transform hover:scale-110 hover:bg-childrencolordarker focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <i className="ki-solid ki-to-right text-xl" aria-hidden />
              </button>
              <div className="children-gallery-pagination z-50 flex w-48 items-center gap-2 rounded-md bg-white/30 p-2 backdrop-blur-sm" />
              <button
                type="button"
                aria-label="اسلاید بعدی"
                onClick={() => swiperRef.current?.slideNext()}
                className="rounded-full bg-white/30 p-2 text-white shadow-md backdrop-blur-md transition-transform hover:scale-110 hover:bg-childrencolordarker focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <i className="ki-solid ki-to-left text-xl" aria-hidden />
              </button>
            </div>
          </div>
        </ChildrenPanel>
      </div>
    </section>
  );
}

export default ChildrenGallery;
