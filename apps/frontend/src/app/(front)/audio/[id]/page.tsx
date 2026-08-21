import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { JsonLd } from '@/components/seo/json-ld';
import { getPublicAudio } from '@/features/media/services/public-media.server';
import { buildPageMetadata, mediaJsonLd } from '@/lib/seo';

import { AudioDetailClient } from './audio-detail-client';

interface IAudioDetailPageProps {
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
}: IAudioDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const audioId = Number(id);
  const audio = await getPublicAudio(audioId);

  if (!audio) {
    return buildPageMetadata({
      title: 'صوت یافت نشد',
      path: `/audio/${id}`,
      noIndex: true,
    });
  }

  return buildPageMetadata({
    title: audio.title,
    description: truncateDescription(audio.text, audio.title),
    path: `/audio/${audio.id}`,
    image: audio.posterPath,
  });
}

export default async function AudioDetailPage({ params }: IAudioDetailPageProps) {
  const { id } = await params;
  const audioId = Number(id);

  if (!Number.isFinite(audioId) || audioId <= 0) {
    notFound();
  }

  const audio = await getPublicAudio(audioId);

  return (
    <>
      {audio ? (
        <JsonLd
          data={mediaJsonLd({
            id: audio.id,
            title: audio.title,
            description: audio.text,
            path: `/audio/${audio.id}`,
            posterUrl: audio.posterPath,
            kind: 'audio',
            uploadDate: audio.createdAt || audio.updatedAt,
          })}
        />
      ) : null}
      <AudioDetailClient audioId={audioId} />
    </>
  );
}
