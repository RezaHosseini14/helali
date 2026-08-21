import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { JsonLd } from '@/components/seo/json-ld';
import { getPublicVideo } from '@/features/media/services/public-media.server';
import { buildPageMetadata, mediaJsonLd } from '@/lib/seo';

import { VideoDetailClient } from './video-detail-client';

interface IVideoDetailPageProps {
  params: Promise<{ id: string }>;
}

function truncateDescription(text: string | undefined, title: string): string {
  const raw = (text || title).replace(/\s+/g, ' ').trim();
  if (raw.length <= 160) {
    return raw;
  }

  return `${raw.slice(0, 157)}…`;
}

export async function generateMetadata({
  params,
}: IVideoDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const videoId = Number(id);
  const video = await getPublicVideo(videoId);

  if (!video) {
    return buildPageMetadata({
      title: 'ویدیو یافت نشد',
      path: `/video/${id}`,
      noIndex: true,
    });
  }

  return buildPageMetadata({
    title: video.title,
    description: truncateDescription(video.text, video.title),
    path: `/video/${video.id}`,
    image: video.posterPath,
  });
}

export default async function VideoDetailPage({ params }: IVideoDetailPageProps) {
  const { id } = await params;
  const videoId = Number(id);

  if (!Number.isFinite(videoId) || videoId <= 0) {
    notFound();
  }

  const video = await getPublicVideo(videoId);

  return (
    <>
      {video ? (
        <JsonLd
          data={mediaJsonLd({
            id: video.id,
            title: video.title,
            description: video.text,
            path: `/video/${video.id}`,
            posterUrl: video.posterPath,
            kind: 'video',
            uploadDate: video.createdAt || video.updatedAt,
          })}
        />
      ) : null}
      <VideoDetailClient videoId={videoId} />
    </>
  );
}
