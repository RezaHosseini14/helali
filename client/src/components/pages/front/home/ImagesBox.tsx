'use client';
import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Panel from '@/components/global/Panel';
import ReactDOM from 'react-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Swiper as SwiperType } from 'swiper';

//Css
import 'swiper/css';

// Types
import { imageType } from 'types/image.type';

// Components
const ImageWithLoader = dynamic(() => import('@/components/global/ImageWithLoader'), {
  ssr: false,
});
const ImagePlayer = dynamic(() => import('@/components/global/ImagePlayer'), {
  ssr: false,
});

function ImagesBox({ images }: { images: imageType[] }) {
  const swiperRef = useRef<SwiperType | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const openViewer = (index: number) => {
    setCurrentIndex(index);
    setIsViewerOpen(true);
  };

  const closeViewer = () => {
    setIsViewerOpen(false);
  };

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  return (
    <Panel title="تصاویر" fill icon="ki-solid ki-picture" moreButton={{ url: '/gallery' }}>
      {images?.length > 0 ? (
        <>
          <Swiper
            spaceBetween={20}
            slidesPerView={5.35}
            pagination={{ clickable: true }}
            onSwiper={(swiperInstance) => {
              swiperRef.current = swiperInstance;
            }}
            breakpoints={{
              320: {
                slidesPerView: 1.2,
              },
              640: {
                slidesPerView: 2.5,
              },
              1024: {
                slidesPerView: 4.5,
              },
              1440: {
                slidesPerView: 5.35,
              },
            }}
            className="my-swiper h-full relative"
          >
            {images?.slice(-10)?.map((image, index) => (
              <SwiperSlide key={image.id}>
                <div
                  key={index}
                  className="group rounded-3xl bg-white aspect-square w-full h-full overflow-hidden relative cursor-pointer"
                  onClick={() => openViewer(index)}
                >
                  <div className="z-30 absolute inset-0 bg-mainColor opacity-0 group-hover:opacity-50 transition-opacity"></div>
                  <ImageWithLoader
                    imageClassName="group-hover:scale-110 transition-transform !duration-150"
                    src={image?.path}
                    alt={image?.desc}
                  />
                  <p className="z-50 truncate absolute bottom-0 left-0 right-0 bg-mainColor/10 backdrop-blur-md text-white text-center py-2 translate-y-full group-hover:translate-y-0 transition-transform">
                    {image?.desc}
                  </p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {isViewerOpen &&
            ReactDOM.createPortal(
              <ImagePlayer
                imageSrc={images[currentIndex].path}
                title={images[currentIndex].desc}
                onClose={closeViewer}
                onNext={nextImage}
                onPrev={prevImage}
              />,
              document.body,
            )}
        </>
      ) : (
        <div className="col-span-12 grid place-content-center h-full">تصویری یافت نشد</div>
      )}
    </Panel>
  );
}

export default ImagesBox;
