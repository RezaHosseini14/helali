'use client';

//Types
import { audioTypes } from 'types/audio.type';

//Commponents
import ImageWithLoader from '@/components/global/ImageWithLoader';
import Link from 'next/link';
import Panel from '@/components/global/Panel';

function ChildrenBox({ audios }: { audios: audioTypes[] }) {
  return (
    <Panel title="عزیزم حسین" fill icon="ki-solid ki-abstract-45" moreButton={{ url: '/audio' }}>
      <div className="grid grid-cols-12 gap-y-10 gap-x-4">
        {audios?.length > 0 ? (
          audios?.slice(-12)?.map((audio: audioTypes) => (
            <Link
              key={audio.id}
              href={`/audio/${audio.id}`}
              className="pattern group relative col-span-12 flex !h-[4.5rem] items-center justify-between rounded-2xl bg-primary/10 p-2 !text-foreground backdrop-blur-lg transition duration-300 hover:bg-primary hover:!text-primary-foreground sm:col-span-6 lg:col-span-4 xl:col-span-3"
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
                  <span className="font-bold w-40 sm:w-28 truncate text-right">{audio?.title}</span>
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

export default ChildrenBox;
