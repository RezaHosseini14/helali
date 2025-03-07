'use client';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';

// Types
import { audioTypes } from 'types/audio.type';

// Services
import { allAudio } from 'services/audio/audioServices';

// Components
import ImageWithLoader from '@/components/global/ImageWithLoader';
import ChildrenPanel from '@/components/global/ChildrenPanel';

function ChildrenAudios() {
  const { data, isLoading } = useQuery({
    queryKey: ['allAudio'],
    queryFn: () => allAudio(),
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 1,
        ease: 'easeIn',
      }}
    >
      <ChildrenPanel title="صوت" fill icon="ki-solid ki-abstract-45" moreButton={{ url: '/audios' }}>
        <div className="grid grid-cols-12 gap-y-10 gap-x-4">
          {data?.data?.audios?.length > 0 ? (
            data?.data?.audios?.slice(-12)?.map((audio: audioTypes, index: number) => (
              <motion.div
                key={audio.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.2,
                  ease: 'easeInOut',
                }}
                className="xl:col-span-3 lg:col-span-4 sm:col-span-6 col-span-12"
              >
                <Link
                  href={`/audio/${audio.id}`}
                  className="pattern group relative !h-[4.5rem] flex items-center justify-between rounded-2xl p-2 !text-childrencolordarker bg-childrencolordarker/10 hover:bg-childrencolordarker/80 hover:!text-white transition duration-300 backdrop-blur-lg"
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
                        <div className="h-3 w-[1px] bg-childrencolordarker group-hover:bg-white/80 transition"></div>
                        <div className="flex items-center gap-1 rounded-md overflow-hidden px-1 h-6 text-base">
                          <i className="ki-outline ki-eye"></i>
                          <span>{audio?.view}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <i className="ki-solid ki-to-right text-4xl bg-childrencolordarker/10 group-hover:bg-white/50 backdrop-blur-sm rounded-full"></i>
                </Link>
              </motion.div>
            ))
          ) : (
            <div className="col-span-12 grid place-content-center">صوتی یافت نشد</div>
          )}
        </div>
      </ChildrenPanel>
    </motion.div>
  );
}

export default ChildrenAudios;
