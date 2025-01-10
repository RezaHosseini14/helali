'use client';
import { useQuery } from '@tanstack/react-query';
import { Button, Placeholder } from 'rsuite';

//Types
import { videoTypes } from 'types/video.type';

//Services
import { allVideo } from 'services/video/videoServices';

//Components
import ImageWithLoader from '@/components/global/ImageWithLoader';
import Link from 'next/link';

// type VideoSuggestsPropsType = {
//   videos?: videoTypes[];
// };
function VideoSuggests() {
  // ---------------------- Data Fetching ----------------------
  const { data, isLoading } = useQuery({
    queryKey: ['allVideo'],
    queryFn: () => allVideo(),
  });

  return (
    <div className="col-span-3 flex flex-col gap-4 h-screen sticky top-4">
      {isLoading ? (
        <div className="flex flex-col gap-4">
          <Placeholder.Graph active className="rounded-xl w-full !h-24" />
          <Placeholder.Graph active className="rounded-xl w-full !h-24" />
          <Placeholder.Graph active className="rounded-xl w-full !h-24" />
        </div>
      ) : (
        <>
          {data?.data.videos?.map((video: videoTypes) => (
            <div key={video.id} className="flex gap-2 items-center bg-white rounded-xl w-full h-24 p-2">
              <div className="group rounded-lg bg-white aspect-video h-full overflow-hidden relative">
                <ImageWithLoader src={video.posterPath} alt={video.title} />
                <div className="group-hover:scale-125 transition-transform text-white bg-mainColor/70 backdrop-blur-md size-10 grid place-content-center text-4xl right-1/2 top-1/2 translate-x-1/2 -translate-y-1/2 z-10 absolute rounded-full shadow-sm">
                  <i className="ki-solid ki-to-right"></i>
                </div>
              </div>
              <div className="flex flex-col flex-1 gap-2 h-full justify-end">
                <span className="font-bold">{video?.title}</span>
                <div className="flex items-center gap-2">
                  <Button className="flex items-center gap-1 rounded-md overflow-hidden px-2 h-7 bg-red-100 text-red-700">
                    <i className="ki-outline ki-heart"></i>
                    <span>{video?.like}</span>
                  </Button>
                  <div className="flex items-center gap-1 rounded-md overflow-hidden px-2 h-7 bg-blue-100 text-blue-700">
                    <i className="ki-outline ki-eye"></i>
                    <span>{video?.view}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default VideoSuggests;
