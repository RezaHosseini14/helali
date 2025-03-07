'use client';

import { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Swiper as SwiperType } from 'swiper';
import { EffectCoverflow, Pagination, Autoplay } from 'swiper/modules';
import { motion } from 'framer-motion';

//Css
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

//Components
import ImageWithLoader from '@/components/global/ImageWithLoader';

const ChildrenGallery = () => {
  const swiperRef = useRef<SwiperType | null>(null);

  const PanoramaSlider = [
    { id: 1, image: '/images/azizam/1.jpg', title: 'Card 1' },
    { id: 2, image: '/images/azizam/2.jpg', title: 'Card 2' },
    { id: 3, image: '/images/azizam/3.jpg', title: 'Card 3' },
    { id: 4, image: '/images/azizam/4.jpg', title: 'Card 4' },
    { id: 5, image: '/images/azizam/5.jpg', title: 'Card 5' },
  ];

  return (
    <div className="w-full h-screen flex flex-col gap-4 justify-center items-center">
      <Swiper
        effect="coverflow"
        grabCursor={true}
        centeredSlides={true}
        slidesPerView={3}
        loop={true}
        autoplay={{
          delay: 7000,
          disableOnInteraction: false,
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
          el: '.custom-pagination',
        }}
        onSwiper={(swiperInstance) => {
          swiperRef.current = swiperInstance;
        }}
        modules={[EffectCoverflow, Pagination, Autoplay]}
        className="w-[90%] h-[70%]"
      >
        {PanoramaSlider.map((slide, index: number) => (
          <SwiperSlide key={slide.id}>
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.8,
                delay: index * 0.1,
                ease: 'easeInOut',
              }}
              className="h-full relative rounded-3xl overflow-hidden"
            >
              <ImageWithLoader src={slide.image} alt={slide.title} />

              <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-childrencolor to-transparent p-4 text-white">
                {/* <h2 className="text-xl font-bold">{slide.title}</h2> */}
              </div>
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="flex items-center gap-8">
        <button
          onClick={() => swiperRef.current?.slidePrev()}
          className="focus:outline-none bg-white/30 hover:bg-childrencolordarker backdrop-blur-md text-white p-2 rounded-full shadow-md transition-transform transform hover:scale-110"
        >
          <i className="ki-solid ki-to-right text-xl"></i>
        </button>
        <div className="custom-pagination w-48 bg-white/30 backdrop-blur-sm p-2 rounded-md z-50 flex items-center gap-2"></div>
        <button
          onClick={() => swiperRef.current?.slideNext()}
          className="focus:outline-none bg-white/30 hover:bg-childrencolordarker backdrop-blur-md text-white p-2 rounded-full shadow-md transition-transform transform hover:scale-110"
        >
          <i className="ki-solid ki-to-left text-xl"></i>
        </button>
      </div>
    </div>
  );
};

export default ChildrenGallery;
