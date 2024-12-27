'use client';

import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

//Types
import { audioTypes } from 'types/audio.type';

//Commponents
import ImageWithLoader from '@/components/global/ImageWithLoader';
const Panel = dynamic(() => import('@/components/global/Panel'), {
  ssr: false,
});
function ChildrenBox({ audios }: { audios: audioTypes[] }) {
  const router = useRouter();

  return (
    <Panel title="عزیزم حسین" fill icon="ki-solid ki-abstract-45">
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
                    <ImageWithLoader src={audio.posterPath} alt={audio.title} />
                  </div>
                  <div className="flex flex-col flex-1 gap-2 h-full justify-end">
                    <span className="font-bold w-32 truncate">{audio?.title}</span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 rounded-md overflow-hidden px-1 h-6 text-mainColor text-base">
                        <i className="ki-outline ki-heart"></i>
                        <span>{audio?.like}</span>
                      </div>
                      <div className="h-3 w-[1px] bg-mainColor"></div>
                      <div className="flex items-center gap-1 rounded-md overflow-hidden px-1 h-6 text-mainColor text-base">
                        <i className="ki-outline ki-eye"></i>
                        <span>{audio?.view}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <i className="ki-solid ki-to-right text-4xl bg-mainColor/10 backdrop-blur-sm rounded-full"></i>
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

export default ChildrenBox;
