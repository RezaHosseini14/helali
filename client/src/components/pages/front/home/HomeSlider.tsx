'use client';
import { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Swiper as SwiperType } from 'swiper';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';
import { useQuery } from '@tanstack/react-query';

//Css
import 'swiper/css';

//Types
import { imageType } from 'types/image.type';

//Services
import { allImage } from 'services/image/imageServices';

//Components
import ImageWithLoader from '@/components/global/ImageWithLoader';

function HomeSlider() {
  const swiperRef = useRef<SwiperType | null>(null);
  const { data } = useQuery({
    queryKey: ['sliderImage'],
    queryFn: () => allImage(),
  });

  return (
    <div className="relative !size-full">
      <Swiper
        modules={[Navigation, Pagination, Scrollbar, A11y]}
        spaceBetween={50}
        slidesPerView={1}
        pagination={{
          clickable: true,
          el: '.custom-pagination',
        }}
        onSwiper={(swiperInstance) => {
          swiperRef.current = swiperInstance;
        }}
        className="my-swiper h-full relative"
      >
        {data?.data?.images.slice(-5).map((image: imageType) => (
          <SwiperSlide key={image.id}>
            <ImageWithLoader src={image?.path} alt={image?.desc} />
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="custom-pagination !w-fit bg-white/30 backdrop-blur-sm p-2 rounded-md absolute right-1/2 translate-x-1/2 bottom-4 z-50 flex items-center gap-2"></div>

      {/* دکمه‌های ناوبری داخل Swiper */}
      <div className="absolute top-1/2 left-0 right-0 flex justify-between px-4 z-50">
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
    </div>
  );
}

export default HomeSlider;
