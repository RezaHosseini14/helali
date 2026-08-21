'use client';

import { motion } from 'framer-motion';

import ChildrenPanel from '@/components/global/ChildrenPanel';
import ImageWithLoader from '@/components/global/ImageWithLoader';

interface IAlbumTile {
  readonly id: string;
  readonly colStart: number;
  readonly rowStart: number;
  readonly colSpan: number;
  readonly rowSpan: number;
  readonly image: string;
}

const ALBUM_TILES: ReadonlyArray<IAlbumTile> = [
  { id: 'a1', colStart: 1, rowStart: 1, colSpan: 3, rowSpan: 3, image: '/images/azizam/1.jpg' },
  { id: 'a2', colStart: 1, rowStart: 4, colSpan: 5, rowSpan: 4, image: '/images/azizam/2.jpg' },
  { id: 'a3', colStart: 4, rowStart: 1, colSpan: 4, rowSpan: 3, image: '/images/azizam/3.jpg' },
  { id: 'a4', colStart: 1, rowStart: 8, colSpan: 3, rowSpan: 5, image: '/images/azizam/7.jpg' },
  { id: 'a5', colStart: 4, rowStart: 8, colSpan: 2, rowSpan: 5, image: '/images/azizam/4.jpg' },
  { id: 'a6', colStart: 6, rowStart: 4, colSpan: 2, rowSpan: 3, image: '/images/azizam/5.jpg' },
  { id: 'a7', colStart: 6, rowStart: 7, colSpan: 2, rowSpan: 6, image: '/images/azizam/9.jpg' },
  { id: 'a8', colStart: 10, rowStart: 1, colSpan: 3, rowSpan: 3, image: '/images/azizam/12.jpg' },
  { id: 'a9', colStart: 10, rowStart: 4, colSpan: 3, rowSpan: 3, image: '/images/azizam/8.jpg' },
  { id: 'a10', colStart: 8, rowStart: 1, colSpan: 2, rowSpan: 4, image: '/images/azizam/6.jpg' },
  { id: 'a11', colStart: 8, rowStart: 5, colSpan: 2, rowSpan: 2, image: '/images/azizam/10.jpg' },
  { id: 'a12', colStart: 8, rowStart: 7, colSpan: 5, rowSpan: 6, image: '/images/azizam/11.jpg' },
];

const MOBILE_IMAGES = [
  '/images/azizam/1.jpg',
  '/images/azizam/2.jpg',
  '/images/azizam/3.jpg',
  '/images/azizam/13.jpg',
  '/images/azizam/14.jpg',
  '/images/azizam/15.jpg',
] as const;

function ChildrenAlbum() {
  return (
    <motion.section
      id="album"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.8 }}
      className="container scroll-mt-8"
    >
      <ChildrenPanel title="آلبوم عکس" fill icon="ki-solid ki-picture">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:hidden">
          {MOBILE_IMAGES.map((image, index) => (
            <div
              key={`mobile-${image}`}
              className={`group overflow-hidden rounded-2xl bg-childrencolor ${index === 0 ? 'col-span-2 aspect-[16/9]' : 'aspect-square'}`}
            >
              <ImageWithLoader
                src={image}
                alt={`عکس آلبوم عزیزم حسین ${index + 1}`}
                className="transition-transform duration-300 group-hover:scale-110"
              />
            </div>
          ))}
        </div>

        <div
          className="hidden h-[50rem] gap-4 md:grid"
          style={{
            gridTemplateColumns: 'repeat(12, 1fr)',
            gridTemplateRows: 'repeat(12, 1fr)',
          }}
        >
          {ALBUM_TILES.map(({ id, colStart, rowStart, colSpan, rowSpan, image }) => (
            <div
              key={id}
              className="group overflow-hidden rounded-2xl bg-childrencolor"
              style={{
                gridColumn: `${colStart} / span ${colSpan}`,
                gridRow: `${rowStart} / span ${rowSpan}`,
              }}
            >
              <ImageWithLoader
                src={image}
                alt="عکس آلبوم عزیزم حسین"
                className="transition-transform duration-300 group-hover:scale-110"
              />
            </div>
          ))}
        </div>
      </ChildrenPanel>
    </motion.section>
  );
}

export default ChildrenAlbum;
