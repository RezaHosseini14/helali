'use client';

import { Icon } from '@iconify/react';

import ImagePlayer from '@/components/global/ImagePlayer';
import ImageWithLoader from '@/components/global/ImageWithLoader';
import Panel from '@/components/global/Panel';
import type { imageType } from 'types/image.type';

function ImagesBox({ images }: { images: imageType[] }) {
  const latestImages = images.slice(0, 8);

  return (
    <Panel
      title="تصاویر"
      fill
      icon={<Icon icon="solar:gallery-minimalistic-bold-duotone" width="22" height="22" />}
      moreButton={{ url: '/gallery' }}
    >
      {latestImages.length > 0 ? (
        <ImagePlayer
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4"
          slides={latestImages.map((image) => ({
            src: image.path,
            alt: image.desc,
            title: image.desc,
          }))}
        >
          {(openAt) =>
            latestImages.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => openAt(index)}
                className="group relative aspect-square w-full cursor-pointer overflow-hidden rounded-2xl border border-border/40 bg-muted text-start shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-mainshadow"
              >
                <ImageWithLoader
                  imageClassName="transition-transform duration-500 group-hover:scale-110"
                  src={image.path}
                  alt={image.desc}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-mainstructure/70 via-transparent to-transparent opacity-80" />
                <p className="absolute inset-x-0 bottom-0 z-10 truncate px-3 py-2.5 text-sm font-medium text-white">
                  {image.desc}
                </p>
              </button>
            ))
          }
        </ImagePlayer>
      ) : (
        <div className="grid h-40 place-content-center text-muted-foreground">تصویری یافت نشد</div>
      )}
    </Panel>
  );
}

export default ImagesBox;
