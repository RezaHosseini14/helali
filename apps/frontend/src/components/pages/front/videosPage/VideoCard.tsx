'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

import PlayIcon from '@/components/global/icons/PlayIcon';
import ImageWithLoader from '@/components/global/ImageWithLoader';
import type { videoTypes } from 'types/video.type';

function VideoCard(props: videoTypes) {
  return (
    <motion.div
      className="group flex flex-col gap-3"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <Link
        href={`/video/${props.id}`}
        className="relative aspect-video overflow-hidden rounded-2xl border border-border/50 bg-muted shadow-sm transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-mainshadow"
      >
        <PlayIcon />
        <ImageWithLoader className="h-full w-full object-cover" src={props.posterPath} alt={props.title} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-mainstructure/50 via-transparent to-transparent opacity-70" />
      </Link>

      <div className="flex items-start justify-between gap-3 px-0.5">
        <p className="line-clamp-2 text-base font-semibold text-foreground sm:text-lg">{props.title}</p>
        <div className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <span>{props.like}</span>
            <i className="ki-outline ki-heart" />
          </span>
          <span className="h-3 w-px bg-border" />
          <span className="inline-flex items-center gap-1">
            <span>{props.view}</span>
            <i className="ki-outline ki-eye" />
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default VideoCard;
