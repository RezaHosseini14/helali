import type { Metadata } from 'next';

import {
  SITE_DESCRIPTION,
  SITE_LOCALE,
  SITE_NAME,
  absoluteUrl,
  getSiteUrl,
  organizationId,
  websiteId,
} from '@/lib/site';

interface IBuildPageMetadataOptions {
  title?: string;
  description?: string;
  path?: string;
  image?: string | null;
  noIndex?: boolean;
  type?: 'website' | 'article';
}

export function buildPageMetadata({
  title,
  description = SITE_DESCRIPTION,
  path = '/',
  image,
  noIndex = false,
  type = 'website',
}: IBuildPageMetadataOptions = {}): Metadata {
  const url = absoluteUrl(path);
  const ogImage = image || '/opengraph-image';

  return {
    title: title || undefined,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: title || SITE_NAME,
      description,
      url,
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      type,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title || SITE_NAME }],
    },
    twitter: {
      card: 'summary_large_image',
      title: title || SITE_NAME,
      description,
      images: [ogImage],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export function rootMetadata(): Metadata {
  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: SITE_NAME,
      template: `%s | ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    applicationName: SITE_NAME,
    openGraph: {
      type: 'website',
      locale: SITE_LOCALE,
      siteName: SITE_NAME,
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      url: getSiteUrl(),
    },
    twitter: {
      card: 'summary_large_image',
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export function siteGraphJsonLd() {
  const url = getSiteUrl();

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': organizationId(),
        name: SITE_NAME,
        url,
        description: SITE_DESCRIPTION,
      },
      {
        '@type': 'WebSite',
        '@id': websiteId(),
        name: SITE_NAME,
        url,
        description: SITE_DESCRIPTION,
        inLanguage: 'fa',
        publisher: { '@id': organizationId() },
      },
    ],
  };
}

interface IMediaJsonLdOptions {
  id: number;
  title: string;
  description?: string;
  path: string;
  posterUrl?: string | null;
  kind: 'audio' | 'video';
  uploadDate?: string;
}

export function mediaJsonLd({
  id,
  title,
  description,
  path,
  posterUrl,
  kind,
  uploadDate,
}: IMediaJsonLdOptions) {
  const url = absoluteUrl(path);
  const type = kind === 'audio' ? 'AudioObject' : 'VideoObject';

  return {
    '@context': 'https://schema.org',
    '@type': type,
    '@id': `${url}#${kind}`,
    name: title,
    description: description || title,
    url,
    ...(posterUrl ? { thumbnailUrl: posterUrl, image: posterUrl } : {}),
    ...(uploadDate ? { uploadDate } : {}),
    inLanguage: 'fa',
    isPartOf: { '@id': websiteId() },
    publisher: { '@id': organizationId() },
    identifier: String(id),
  };
}
