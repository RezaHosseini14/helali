import sharp from 'sharp';

export interface IOptimizedImage {
  readonly buffer: Buffer;
  readonly size: number;
  readonly mimetype: 'image/webp';
}

const MAX_IMAGE_EDGE_PX = 1920;
const WEBP_QUALITY = 82;

export async function optimizeImageToWebp(input: Buffer): Promise<IOptimizedImage> {
  const buffer = await sharp(input, { failOn: 'none' })
    .rotate()
    .resize({
      width: MAX_IMAGE_EDGE_PX,
      height: MAX_IMAGE_EDGE_PX,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  return {
    buffer,
    size: buffer.length,
    mimetype: 'image/webp',
  };
}
