'use client';

import dynamic from 'next/dynamic';

//Types
import { audioTypes } from 'types/audio.type';

//Commponents
import ImageWithLoader from '@/components/global/ImageWithLoader';
import Link from 'next/link';
const Panel = dynamic(() => import('@/components/global/Panel'), {
  ssr: false,
});
function AudiosBox({ audios }: { audios: audioTypes[] }) {
  return (
    <Panel title="صوت" fill icon="ki-solid ki-abstract-45" moreButton={{ url: '/audios' }}>
      <div className="grid grid-cols-12 gap-y-10 gap-x-4">
        {audios?.length > 0 ? (
          audios?.slice(-12)?.map((audio: audioTypes) => (
            <Link
              href={`/audio/${audio.id}`}
              className="pattern group relative !h-[4.5rem] xl:col-span-3 lg:col-span-4 sm:col-span-6 col-span-12 flex items-center justify-between rounded-2xl p-2 !text-mainColor bg-mainColor/10 hover:bg-mainColor/80 hover:!text-white transition duration-300 backdrop-blur-lg"
            >
              <div className="flex flex-1 items-end gap-2 -translate-y-3">
                <div className="rounded-2xl bg-white aspect-square size-20 overflow-hidden relative shadow-lg">
                  <ImageWithLoader
                    imageClassName="group-hover:scale-110 transition-transform !duration-150"
                    src={audio.posterPath}
                    alt={audio.title}
                  />
                </div>
                <div className="flex flex-col flex-1 gap-2 h-full justify-end">
                  <span className="font-bold w-40 truncate text-right">{audio?.title}</span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 rounded-md overflow-hidden px-1 h-6 text-base">
                      <i className="ki-outline ki-heart"></i>
                      <span>{audio?.like}</span>
                    </div>
                    <div className="h-3 w-[1px] bg-mainColor group-hover:bg-white/80 transition"></div>
                    <div className="flex items-center gap-1 rounded-md overflow-hidden px-1 h-6 text-base">
                      <i className="ki-outline ki-eye"></i>
                      <span>{audio?.view}</span>
                    </div>
                  </div>
                </div>
              </div>
              <i className="ki-solid ki-to-right text-4xl bg-mainColor/10 group-hover:bg-white/50 backdrop-blur-sm rounded-full"></i>
            </Link>
          ))
        ) : (
          <div className="col-span-12 grid place-content-center">صوتی یافت نشد</div>
        )}
      </div>
    </Panel>
  );
}

export default AudiosBox;
