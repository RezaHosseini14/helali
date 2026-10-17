/**
 * HTTPS pages cannot load http:// MinIO/media URLs (mixed content).
 * Route them through same-origin /media-proxy while keeping the signed query.
 */
export function toBrowserMediaUrl(url: string | null | undefined): string {
  const value = url?.trim() ?? '';
  if (!value) {
    return '';
  }

  if (!/^http:\/\//i.test(value)) {
    return value;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? '';
  const pageIsHttps =
    (typeof window !== 'undefined' && window.location.protocol === 'https:') ||
    siteUrl.startsWith('https:');

  if (!pageIsHttps) {
    return value;
  }

  return `/media-proxy?u=${encodeURIComponent(value)}`;
}
