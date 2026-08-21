'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

import { useVideos } from '@/features/video/hooks/use-videos';
import ChildrenPanel from '@/components/global/ChildrenPanel';
import ImageWithLoader from '@/components/global/ImageWithLoader';
import PlayIcon from '@/components/global/icons/PlayIcon';
import { Skeleton } from '@/components/ui/skeleton';

function ChildrenVideos() {
  const { data, isPending } = useVideos(1, 8);
  const videos = data?.videos ?? [];

  return (
    <motion.section
      id="videos"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="container scroll-mt-8"
    >
      <ChildrenPanel title="ویدیو" fill icon="ki-solid ki-youtube" moreButton={{ url: '/video' }}>
        <div className="grid grid-cols-12 gap-4">
          {isPending
            ? Array.from({ length: 4 }).map((_, index) => (
                <div key={`video-skeleton-${index}`} className="col-span-12 sm:col-span-6 lg:col-span-3">
                  <Skeleton className="aspect-video rounded-2xl bg-childrencolor/20" />
                </div>
              ))
            : null}

          {!isPending && videos.length > 0
            ? videos.slice(0, 8).map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.6,
                    delay: Math.min(index * 0.08, 0.5),
                    ease: 'easeOut',
                  }}
                  className="col-span-12 sm:col-span-6 lg:col-span-3"
                >
                  <Link
                    href={`/video/${video.id}`}
                    className="group relative block overflow-hidden rounded-2xl border border-childrencolor/30 bg-childrencolordarker/10 shadow-md transition hover:border-childrencolordarker hover:shadow-lg"
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <PlayIcon />
                      <ImageWithLoader
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                        src={
                          (video as { posterPath?: string }).posterPath ??
                          video.posterUrl ??
                          ''
                        }
                        alt={video.title}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2 p-3 text-childrencolordarker">
                      <span className="truncate font-bold">{video.title}</span>
                      <div className="flex shrink-0 items-center gap-2 text-sm">
                        <span className="flex items-center gap-1">
                          <i className="ki-outline ki-heart" aria-hidden />
                          {video.like}
                        </span>
                        <span className="flex items-center gap-1">
                          <i className="ki-outline ki-eye" aria-hidden />
                          {video.view}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            : null}

          {!isPending && videos.length === 0 ? (
            <div className="col-span-12 grid place-content-center py-8">ویدیویی یافت نشد</div>
          ) : null}
        </div>
      </ChildrenPanel>
    </motion.section>
  );
}

export default ChildrenVideos;
