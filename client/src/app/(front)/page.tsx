'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useQuery } from '@tanstack/react-query';

// Services
import { allImage } from 'services/image/imageServices';
import { allStories, allVideo } from 'services/video/videoServices';

// Components
import StoriesSlider from '@/components/pages/front/home/StoriesSlider';
import HomeSlider from '@/components/pages/front/home/HomeSlider';
import AudiosBox from '@/components/pages/front/home/AudiosBox';
import ImagesBox from '@/components/pages/front/home/ImagesBox';
import VideosBox from '@/components/pages/front/home/VideosBox';
import HomePageLoading from '@/components/pages/front/home/HomePageLoading';

function HomePage() {
  const { audios, audiosLoading } = useSelector((state: RootState) => state.audio);

  // ---------------------- State and Ref ----------------------
  const targetRef = useRef<HTMLDivElement | null>(null);

  // ---------------------- Data Fetching ----------------------
  const { data, isLoading: imagesIsLoading } = useQuery({
    queryKey: ['allImage'],
    queryFn: () => allImage(),
  });

  const { data: videosData, isLoading: videosIsLoading } = useQuery({
    queryKey: ['allvideo', { page: undefined, limit: 4 }],
    queryFn: ({ queryKey }: { queryKey: [string, { page?: number; limit?: number }] }) => {
      const [, params] = queryKey;
      return allVideo(params.page, params.limit);
    },
  });

  const { data: storiesData, isLoading: storiesIsLoading } = useQuery({
    queryKey: ['allStories'],
    queryFn: () => allStories(),
  });

  // ---------------------- Event Handlers ----------------------
  const handleSlideDown = () => {
    targetRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {audiosLoading && imagesIsLoading && videosIsLoading && storiesIsLoading ? (
        <HomePageLoading />
      ) : (
        <>
          <div className="landing-box absolute top-0 right-0 w-full">
            <div className="relative">
              <div className="landing-img"></div>
              <div className="landing-curve"></div>
              <div
                onClick={handleSlideDown}
                className="cursor-pointer absolute right-1/2 translate-x-1/2 -bottom-10 sm:size-20 size-16 text-5xl rounded-full bg-white flex justify-center items-center"
              >
                <motion.div
                  animate={{
                    y: [0, 10, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <Icon icon="solar:double-alt-arrow-down-line-duotone" />
                </motion.div>
              </div>
            </div>
          </div>

          <div ref={targetRef} className="grid grid-cols-12 gap-x-8 gap-y-16 lg:mt-[50%] mt-[85%] h-max pb-32">
            <div className="container col-span-12">
              <div className="slider-box xl:h-[30rem] md:h-[25rem] sm:h-[20rem] h-[15rem] glass-back rounded-xl overflow-hidden shadow-mainshadow">
                <HomeSlider />
              </div>
            </div>
            {storiesData?.data?.stories.length > 0 ? (
              <div className="reels-box col-span-12 container">
                <StoriesSlider stories={storiesData?.data?.stories} />
              </div>
            ) : (
              <div className="col-span-12 grid place-content-center">رییلزی یافت نشد</div>
            )}

            <div className="audios-box col-span-12 container">
              <AudiosBox audios={audios} />
            </div>

            <div className="images-box col-span-12 container">
              <ImagesBox images={data?.data?.images} />
            </div>

            <div className="videos-box col-span-12">
              <VideosBox videos={videosData?.data?.videos} />
            </div>

            <div className="col-span-12 container">
              <Link href="/children">
                <div className="azizamhosein-banner rounded-xl shadow-mainshadow"></div>
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default HomePage;
