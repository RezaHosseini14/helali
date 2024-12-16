'use client';
import { useRef } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Swiper as SwiperType } from 'swiper';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';

//css
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import { useQuery } from '@tanstack/react-query';
import { allImage } from 'services/image/imageServices';
import { imageType } from 'types/image.type';
import ImageWithLoader from '@/components/global/ImageWithLoader';

function HomeSlider() {
  const swiperRef = useRef<SwiperType | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ['sliderImage'], queryFn: allImage });

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
            {/* <Image src={image.path} className="w-full h-full" alt={image.desc} layout="fill" objectFit="cover" /> */}
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
