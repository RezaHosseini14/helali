'use client';
import React from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useQuery } from '@tanstack/react-query';
import { allImage } from 'services/image/imageServices';
import { allVideo } from 'services/video/videoServices';
import VideosBox from '@/components/pages/front/home/VideosBox';
import DonateBox from '@/components/pages/front/home/DonateBox';
import ChildrenBox from '@/components/pages/front/home/ChildrenBox';

//components
// import HomeSlider from '@/components/pages/front/home/HomeSlider';
// import HomePageLoader from '@/components/pages/front/home/HomePageLoader';
// import AudiosBox from '@/components/pages/front/home/AudiosBox';
// import ImagesBox from '@/components/pages/front/home/ImagesBox';

const HomeSlider = dynamic(() => import('@/components/pages/front/home/HomeSlider'), {
  ssr: false,
});
const HomePageLoader = dynamic(() => import('@/components/pages/front/home/HomePageLoader'), {
  ssr: false,
});
const AudiosBox = dynamic(() => import('@/components/pages/front/home/AudiosBox'), {
  ssr: false,
});
const ImagesBox = dynamic(() => import('@/components/pages/front/home/ImagesBox'), {
  ssr: false,
});

function HomePage(): JSX.Element {
  const { audios, audiosLoading } = useSelector((state: RootState) => state.audio);
  const { data, isLoading: imagesIsLoading } = useQuery({ queryKey: ['allImage'], queryFn: allImage });
  const { data: videosData, isLoading: videosIsLoading } = useQuery({ queryKey: ['allvideo'], queryFn: allVideo });
  return (
    <>
      {audiosLoading && imagesIsLoading && videosIsLoading ? (
        <HomePageLoader />
      ) : (
        <div className="grid grid-cols-12 gap-x-8 gap-y-16 mt-8 h-max">
          <div className="slider-box col-span-12 glass-back rounded-xl overflow-hidden xl:h-[30rem] md:h-[25rem] sm:h-[20rem] h-[15rem]">
            <HomeSlider />
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

          <div className="donate-box col-span-3">
            <DonateBox />
          </div>
          
          <div className="videos-box col-span-9">
            <VideosBox videos={videosData?.data?.videos} />
          </div>

          <div className="audios-box col-span-12">
            <AudiosBox audios={audios} />
          </div>

          <div className="images-box col-span-12">
            <ImagesBox images={data?.data?.images} />
          </div>

          <div className="audios-box col-span-12">
            <ChildrenBox audios={audios} />
          </div>
        </div>
      )}
    </>
  );
}

export default HomePage;
