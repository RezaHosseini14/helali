import VideoPlayer from '@/components/global/VideoPlayer';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import React from 'react';
import { audioTypes } from 'types/audio.type';
const Panel = dynamic(() => import('@/components/global/Panel'), {
  ssr: false,
});
function VideosBox({ videos }: { videos: audioTypes[] }) {
  return (
    <Panel title="ویدیو ها" fill icon="ki-solid ki-abstract-45">
      <div className="grid grid-cols-2 gap-4">
        {videos?.length > 0 ? (
          videos?.map((video) => (
            <div className='rounded-xl overflow-hidden'>
              <VideoPlayer src={video.path} poster={video.posterPath} />
            </div>
          ))
        ) : (
          <div className="col-span-12 grid place-content-center">ویدیویی یافت نشد</div>
        )}
      </div>
    </Panel>
  );
}

export default VideosBox;
