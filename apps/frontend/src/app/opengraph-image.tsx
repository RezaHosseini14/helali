import { ImageResponse } from 'next/og';

import { BRAND_COLORS } from '@/lib/brand';
import { SITE_DESCRIPTION, SITE_NAME } from '@/lib/site';

export const runtime = 'edge';

export const alt = SITE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 72,
          background: `linear-gradient(145deg, ${BRAND_COLORS.structure} 0%, ${BRAND_COLORS.primary} 55%, ${BRAND_COLORS.accent} 100%)`,
          color: BRAND_COLORS.primaryForeground,
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.2 }}>{SITE_NAME}</div>
        <div style={{ marginTop: 24, fontSize: 28, opacity: 0.92, maxWidth: 900 }}>
          {SITE_DESCRIPTION}
        </div>
      </div>
    ),
    size,
  );
}
