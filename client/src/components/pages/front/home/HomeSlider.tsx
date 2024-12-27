'use client';
import { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Swiper as SwiperType } from 'swiper';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';
import { useQuery } from '@tanstack/react-query';

//Css
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';

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
    <>
      <Swiper
        modules={[Navigation, Pagination, Scrollbar, A11y]}
        spaceBetween={50}
        slidesPerView={1}
        pagination={{ clickable: true }}
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

        <div className="custom-navigation !text-white">
          <button onClick={() => swiperRef.current?.slidePrev()}>
            <i className="ki-solid ki-right"></i>
          </button>
          <button onClick={() => swiperRef.current?.slideNext()}>
            <i className="ki-solid ki-left"></i>
          </button>
        </div>
      </Swiper>
    </>
  );
}

export default HomeSlider;
