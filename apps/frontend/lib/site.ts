import { BRAND_COLORS } from '@/lib/brand';

export const SITE_NAME =
  process.env.APP_TITLE?.trim() || process.env.NEXT_PUBLIC_APP_TITLE?.trim() || 'هلالی';

export const SITE_DESCRIPTION =
  'پایگاه حفظ و نشر آثار عبدالرضا هلالی — صوت، ویدیو و گالری';

export const SITE_LOCALE = 'fa_IR';

export function getSiteUrl(): string {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim() ||
    '';

  if (configured) {
    return configured.replace(/\/$/, '');
  }

  if (process.env.VERCEL_URL?.trim()) {
    return `https://${process.env.VERCEL_URL.trim().replace(/\/$/, '')}`;
  }

  return 'http://localhost:3000';
}

export function absoluteUrl(path = '/'): string {
  const base = getSiteUrl();
  if (!path || path === '/') {
    return base;
  }

  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export const SITE_THEME_COLOR = BRAND_COLORS.primary;

export const organizationId = () => `${getSiteUrl()}/#organization`;
export const websiteId = () => `${getSiteUrl()}/#website`;
