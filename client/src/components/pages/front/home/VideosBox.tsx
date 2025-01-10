import ImageWithLoader from '@/components/global/ImageWithLoader';
import dynamic from 'next/dynamic';
import Link from 'next/link';

//Types
import { audioTypes } from 'types/audio.type';

//Components
const Panel = dynamic(() => import('@/components/global/Panel'), {
  ssr: false,
});

function VideosBox({ videos }: { videos: audioTypes[] }) {
  return (
    <Panel
      title="ویدیو"
      fill
      icon="ki-solid ki-abstract-31"
      className="py-8"
      container
      dark
      moreButton={{ url: '/videos' }}
    >
      <div className="grid grid-cols-12 grid-rows-12 gap-4 h-[30rem] container">
        {videos?.length > 0 ? (
          videos?.map((video) => (
            <Link
              href={`/video/${video.id}`}
              className="group relative rounded-xl !overflow-hidden lg:first-of-type:!col-span-9 first-of-type:!row-span-12 first-of-type:!col-span-12 lg:col-span-3 md:col-span-4 row-span-4 col-span-12 sm:col-span-6"
            >
              <div className="group-hover:scale-125 transition-transform bg-mainColor/70 backdrop-blur-md size-16 grid place-content-center text-4xl right-1/2 top-1/2 translate-x-1/2 -translate-y-1/2 z-10 absolute rounded-full shadow-sm">
                <i className="ki-solid ki-to-right"></i>
              </div>
              <ImageWithLoader
                className="object-scale-down w-full h-full aspect-video"
                src={video.posterPath}
                alt={video.title}
              />
            </Link>
          ))
        ) : (
          <div className="col-span-12 grid place-content-center">ویدیویی یافت نشد</div>
        )}
      </div>
    </Panel>
  );
}

export default VideosBox;
