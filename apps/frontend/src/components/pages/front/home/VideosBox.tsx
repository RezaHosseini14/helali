import ImageWithLoader from '@/components/global/ImageWithLoader';
import Link from 'next/link';

//Types
import { videoTypes } from 'types/video.type';

//Components
import Panel from '@/components/global/Panel';
import { Icon } from '@iconify/react';
import PlayIcon from '@/components/global/icons/PlayIcon';

function VideosBox({ videos }: { videos: videoTypes[] }) {
  return (
    <Panel
      title="ویدیو"
      fill
      icon={<Icon icon="solar:videocamera-record-bold-duotone" width="24" height="24" />}
      dark
      moreButton={{ url: '/video' }}
      className="pattern-panel-dark relative isolate"
    >
      <div className="relative grid h-[30rem] grid-cols-12 grid-rows-12 gap-4">
        {videos?.length > 0 ? (
          videos?.slice(-4).map((video) => (
            <Link
              key={video.id}
              href={`/video/${video.id}`}
              className="group relative rounded-xl !overflow-hidden 
              lg:first-of-type:!col-span-9 lg:first-of-type:!row-span-12 lg:col-span-3 lg:row-span-4 
              md:first-of-type:!col-span-12 md:first-of-type:!row-span-9 md:col-span-4 md:row-span-3
              first-of-type:!col-span-12 first-of-type:!row-span-6 row-span-3 col-span-6"
            >
              <PlayIcon />
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
