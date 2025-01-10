'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useQuery } from '@tanstack/react-query';

//Services
import { allImage } from 'services/image/imageServices';
import { allVideo } from 'services/video/videoServices';

//Components
import DonateBox from '@/components/pages/front/home/DonateBox';
import ChildrenBox from '@/components/pages/front/home/ChildrenBox';

const HomeSlider = dynamic(() => import('@/components/pages/front/home/HomeSlider'), {
  ssr: false,
});
const HomePageLoader = dynamic(() => import('@/components/pages/front/home/HomePageLoader'), {
  ssr: false,
});
const AudiosBox = dynamic(() => import('@/components/pages/front/home/AudiosBox'), {
  ssr: false,
});
const VideosBox = dynamic(() => import('@/components/pages/front/home/VideosBox'), {
  ssr: false,
});
const ImagesBox = dynamic(() => import('@/components/pages/front/home/ImagesBox'), {
  ssr: false,
});

function HomePage() {
  const { audios, audiosLoading } = useSelector((state: RootState) => state.audio);
  const { data, isLoading: imagesIsLoading } = useQuery({
    queryKey: ['allImage'],
    queryFn: () => allImage(),
  });
  const { data: videosData, isLoading: videosIsLoading } = useQuery({
    queryKey: ['allVideo'],
    queryFn: () => allVideo(),
  });

  return (
    <>
      <div className="grid grid-cols-12 gap-x-8 gap-y-16 mt-8 h-max">
        {audiosLoading && imagesIsLoading && videosIsLoading ? (
          <HomePageLoader />
        ) : (
          <>
            <div className="container grid gap-8 grid-cols-12 col-span-12">
              <div className="slider-box lg:col-span-9 md:col-span-8 col-span-12 glass-back rounded-xl overflow-hidden xl:h-[30rem] md:h-[25rem] sm:h-[20rem] h-[15rem] shadow-mainshadow">
                <HomeSlider />
              </div>
              <div className="donate-box lg:col-span-3 md:col-span-4 col-span-12">
                <DonateBox />
              </div>
            </div>

            <div className="audios-box col-span-12 container">
              <AudiosBox audios={audios} />
            </div>

            <div className="images-box col-span-12 container">
              <ImagesBox images={data?.data?.images} />
            </div>

            <div className="videos-box col-span-12">
              <VideosBox videos={videosData?.data?.videos} />
            </div>

            <div className="audios-box col-span-12 container">
              <ChildrenBox audios={audios} />
            </div>

            {/* <div className="note-box sm:col-span-6 col-span-12 sm:order-3 order-4">
            <Image
              src="/images/note/note1.png"
              alt="note"
              width={280}
              height={280}
              className="rotate-[40deg] sm:mr-56 mr-24 sm:mt-0 -mt-24 sm:w-[17rem] w-36"
            />
          </div>

          <div className="bioImag-box sm:col-span-6 col-span-12 sm:order-4 order-3 grid place-content-center">
            <div className="rounded-full shadow-xl overflow-hidden xl:size-[30rem] sm:size-96 size-80 bg-mainColor/50 backdrop-blur-md grid place-content-center">
              <Image src="/images/helali.png" alt="helali" width={900} height={900} className="-mb-16" />
            </div>
          </div> */}
          </>
        )}
      </div>
    </>
  );
}

export default HomePage;
