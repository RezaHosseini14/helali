import type { MetadataRoute } from 'next';

import { getSiteUrl } from '@/lib/site';
import { listPublicAudioIds, listPublicVideoIds } from '@/features/media/services/public-media.server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/audio`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/video`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/gallery`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/children`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
  ];

  const [audioIds, videoIds] = await Promise.all([
    listPublicAudioIds(),
    listPublicVideoIds(),
  ]);

  const audioRoutes: MetadataRoute.Sitemap = audioIds.map((id) => ({
    url: `${base}/audio/${id}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const videoRoutes: MetadataRoute.Sitemap = videoIds.map((id) => ({
    url: `${base}/video/${id}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...audioRoutes, ...videoRoutes];
}
