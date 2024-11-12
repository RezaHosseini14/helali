"use client";
import { useRef } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperType } from "swiper";
import {
  Navigation,
  Pagination,
  Scrollbar,
  A11y,
} from "swiper/modules";
import helaliImage from "@/assets/images/helali.jpg";

//css
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

function HomeSlider() {
  const swiperRef = useRef<SwiperType | null>(null);

  return (
    <>
      <Swiper
        modules={[Navigation, Pagination, Scrollbar, A11y]}
        spaceBetween={50}
        slidesPerView={1}
        pagination={{ clickable: true }}
        onSwiper={(swiperInstance) => {
          swiperRef.current = swiperInstance;
          console.log(swiperInstance);
        }}
        onSlideChange={() => console.log("slide change")}
        className="my-swiper h-full relative"
      >
        <SwiperSlide>
          <Image
            src={helaliImage}
            className="w-full h-full"
            alt="Sample Image"
            layout="fill"
            objectFit="cover"
          />
        </SwiperSlide>
        <SwiperSlide>Slide 2</SwiperSlide>
        <SwiperSlide>Slide 3</SwiperSlide>
        <SwiperSlide>Slide 4</SwiperSlide>

        <div className="absolute right-1/2 translate-x-1/2 bottom-0 bg-background rounded-t-xl w-32 h-8 z-50"></div>
        <div className="custom-navigation">
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
