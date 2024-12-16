'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
//types
import { audioTypes } from 'types/audio.type';
import ImageWithLoader from '@/components/global/ImageWithLoader';
//commponents
const Panel = dynamic(() => import('@/components/global/Panel'), {
  ssr: false,
});
function AudiosBox({ audios }: { audios: audioTypes[] }) {
  const router = useRouter();

  return (
    <Panel title="صوت ها" fill icon="ki-solid ki-abstract-45">
      <div className="grid grid-cols-12 gap-4">
        {audios?.length > 0 ? (
          audios?.map((audio: audioTypes) => (
            <>
              <button
                className="group col-span-3 flex items-center justify-between border border-mainColor rounded-xl p-2 bg-mainColor/10 backdrop-blur-lg"
                onClick={() => {
                  router.push(`/audio/${audio.id}`);
                }}
              >
                <div className="flex items-end gap-2">
                  <div className="rounded-lg bg-white aspect-square size-20 overflow-hidden relative">
                    {/* <Image src={audio.posterPath} alt={audio.title} layout="fill" objectFit="cover" /> */}
                    <ImageWithLoader src={audio.posterPath} alt={audio.title} />
                  </div>
                  <div className="flex flex-col flex-1 gap-2 h-full justify-end">
                    <span className="font-bold w-32 truncate">{audio?.title}</span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 rounded-md overflow-hidden px-1 h-6 bg-red-100/70 text-red-700 text-xs">
                        <i className="ki-outline ki-heart"></i>
                        <span>{audio?.like}</span>
                      </div>
                      <div className="flex items-center gap-1 rounded-md overflow-hidden px-1 h-6 bg-blue-100/70 text-blue-700 text-xs">
                        <i className="ki-outline ki-eye"></i>
                        <span>{audio?.view}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <i className="ki-solid ki-to-right text-4xl bg-mainColor/10 backdrop-blur-sm rounded-full"></i>

                {/* <div className="rounded-lg bg-white aspect-square h-full w-full overflow-hidden relative">
                  <Image src={audio.posterPath} alt={audio.title} layout="fill" objectFit="cover" />
                  <i className="ki-solid ki-to-right text-5xl bg-white/50 backdrop-blur-sm p-2 rounded-full absolute right-1/2 transition-all -bottom-8 group-hover:bottom-1/2 translate-x-1/2 translate-y-1/2"></i>
                </div> */}
              </button>
            </>
          ))
        ) : (
          <div className="col-span-12 grid place-content-center">صوتی یافت نشد</div>
        )}
      </div>
    </Panel>
  );
}

export default AudiosBox;
