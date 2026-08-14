'use client';

import { useState } from 'react';

import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { useGallery } from '@/features/gallery/hooks/use-gallery';
import ImagePlayer from '@/components/global/ImagePlayer';
import ImageWithLoader from '@/components/global/ImageWithLoader';
import CommentsBox from '@/components/pages/front/audioPage/CommentsBox';
import { FrontPageHeader } from '@/components/layouts/front/FrontPageHeader';
import GalleryPageLoading from '@/components/pages/front/galleryPage/GalleryPageLoading';
import { getApiErrorMessage } from '@/services/get-api-error-message';
import type { imageType } from 'types/image.type';

export default function GalleryPage() {
  const [activeGalleryId, setActiveGalleryId] = useState<number | null>(null);
  const { data, isPending, isError, error, refetch } = useGallery(1, 48);

  if (isPending) {
    return (
      <div className="container space-y-8 pt-28 pb-20">
        <FrontPageHeader
          icon="ki-solid ki-picture"
          title="گالری"
          description="تصاویر منتخب از مجالس و آثار"
        />
        <GalleryPageLoading count={16} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container pt-28 pb-20">
        <ErrorState
          title="بارگذاری گالری ناموفق بود"
          description={getApiErrorMessage(error)}
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  const images = (data?.images ?? []) as unknown as imageType[];

  if (images.length === 0) {
    return (
      <div className="container pt-28 pb-20">
        <EmptyState title="تصویری یافت نشد" description="گالری به‌زودی با تصاویر جدید به‌روز می‌شود." />
      </div>
    );
  }

  return (
    <div className="container space-y-8 pt-28 pb-20">
      <FrontPageHeader
        icon="ki-solid ki-picture"
        title="گالری"
        description="تصاویر منتخب از مجالس و آثار"
      />

      <ImagePlayer
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5"
        slides={images.map((image) => ({
          src: image.path,
          alt: image.desc,
          title: image.desc,
        }))}
        onOpen={(index) => setActiveGalleryId(images[index]?.id ?? null)}
        onClose={() => setActiveGalleryId(null)}
      >
        {(openAt) =>
          images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => openAt(index)}
              className="group relative aspect-square w-full cursor-pointer overflow-hidden rounded-2xl border border-border/40 bg-muted text-start shadow-sm transition hover:-translate-y-0.5 hover:shadow-mainshadow"
            >
              <div className="pointer-events-none absolute inset-0 z-20 bg-mainstructure/0 transition-colors duration-300 group-hover:bg-mainstructure/35" />
              <ImageWithLoader
                imageClassName="transition-transform duration-500 group-hover:scale-110"
                src={image.path}
                alt={image.desc}
              />
              <p className="absolute inset-x-0 bottom-0 z-30 truncate bg-mainstructure/40 py-2.5 text-center text-sm text-white backdrop-blur-md transition-transform duration-300 translate-y-full group-hover:translate-y-0">
                {image.desc}
              </p>
            </button>
          ))
        }
      </ImagePlayer>

      {activeGalleryId ? (
        <section className="rounded-2xl border border-border/60 bg-card/50 p-4 sm:p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">دیدگاه‌ها</h2>
          <CommentsBox id={activeGalleryId} type="gallery" />
        </section>
      ) : null}
    </div>
  );
}
