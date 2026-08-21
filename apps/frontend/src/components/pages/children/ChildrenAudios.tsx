'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';

import { useAudios } from '@/features/audio/hooks/use-audios';
import ChildrenPanel from '@/components/global/ChildrenPanel';
import ImageWithLoader from '@/components/global/ImageWithLoader';
import { Skeleton } from '@/components/ui/skeleton';

function ChildrenAudios() {
  const shouldReduceMotion = useReducedMotion();
  const { data, isPending } = useAudios(1, 12);
  const audios = data?.audios ?? [];

  return (
    <motion.section
      id="audios"
      initial={shouldReduceMotion ? false : { opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.8, ease: 'easeOut' }}
      className="container relative scroll-mt-8"
    >
      <motion.div
        animate={shouldReduceMotion ? undefined : { y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -right-2 -top-8 z-10 hidden sm:block md:-right-4"
        aria-hidden
      >
        <Image src="/images/children/start.png" width={160} height={160} alt="" className="w-28 md:w-40" />
      </motion.div>

      <ChildrenPanel title="صوت" fill icon="ki-solid ki-abstract-45" moreButton={{ url: '/audio' }}>
        <div className="grid grid-cols-12 gap-x-4 gap-y-10">
          {isPending
            ? Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={`audio-skeleton-${index}`}
                  className="col-span-12 sm:col-span-6 lg:col-span-4 xl:col-span-3"
                >
                  <Skeleton className="h-[4.5rem] rounded-2xl bg-childrencolor/20" />
                </div>
              ))
            : null}

          {!isPending && audios.length > 0
            ? audios.slice(0, 12).map((audio, index) => (
                <motion.div
                  key={audio.id}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.6,
                    delay: shouldReduceMotion ? 0 : Math.min(index * 0.08, 0.6),
                    ease: 'easeOut',
                  }}
                  className="col-span-12 sm:col-span-6 lg:col-span-4 xl:col-span-3"
                >
                  <Link
                    href={`/audio/${audio.id}`}
                    className="pattern group relative flex !h-[4.5rem] items-center justify-between rounded-2xl bg-childrencolordarker/10 p-2 !text-childrencolordarker backdrop-blur-lg transition duration-300 hover:bg-childrencolordarker/80 hover:!text-white"
                  >
                    <div className="flex flex-1 items-end gap-2 -translate-y-3">
                      <div className="relative aspect-square size-20 overflow-hidden rounded-2xl bg-white shadow-lg">
                        <ImageWithLoader
                          imageClassName="group-hover:scale-110 transition-transform !duration-150"
                          src={
                            (audio as { posterPath?: string }).posterPath ??
                            audio.posterUrl ??
                            ''
                          }
                          alt={audio.title}
                        />
                      </div>
                      <div className="flex h-full flex-1 flex-col justify-end gap-2">
                        <span className="w-40 truncate text-right font-bold sm:w-28">{audio.title}</span>
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 items-center gap-1 overflow-hidden rounded-md px-1 text-base">
                            <i className="ki-outline ki-heart" aria-hidden />
                            <span>{audio.like}</span>
                          </div>
                          <div className="h-3 w-px bg-childrencolordarker transition group-hover:bg-white/80" />
                          <div className="flex h-6 items-center gap-1 overflow-hidden rounded-md px-1 text-base">
                            <i className="ki-outline ki-eye" aria-hidden />
                            <span>{audio.view}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <i
                      className="ki-solid ki-to-right rounded-full bg-childrencolordarker/10 text-4xl backdrop-blur-sm group-hover:bg-white/50"
                      aria-hidden
                    />
                  </Link>
                </motion.div>
              ))
            : null}

          {!isPending && audios.length === 0 ? (
            <div className="col-span-12 grid place-content-center py-8">صوتی یافت نشد</div>
          ) : null}
        </div>
      </ChildrenPanel>
    </motion.section>
  );
}

export default ChildrenAudios;
