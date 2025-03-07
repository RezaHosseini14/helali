'use client';

import ImageWithLoader from '@/components/global/ImageWithLoader';

function ChildrenAlbum() {
  const images = [
    { id: 16, colStart: 1, rowStart: 1, colSpan: 3, rowSpan: 3, image: '/images/azizam/1.jpg' },
    { id: 17, colStart: 1, rowStart: 4, colSpan: 5, rowSpan: 4, image: '/images/azizam/2.jpg' },

    { id: 18, colStart: 4, rowStart: 1, colSpan: 4, rowSpan: 3, image: '/images/azizam/3.jpg' },

    { id: 19, colStart: 1, rowStart: 8, colSpan: 3, rowSpan: 5, image: '/images/azizam/7.jpg' },
    { id: 19, colStart: 4, rowStart: 8, colSpan: 2, rowSpan: 5, image: '/images/azizam/4.jpg' },

    { id: 20, colStart: 6, rowStart: 4, colSpan: 2, rowSpan: 3, image: '/images/azizam/5.jpg' },

    { id: 26, colStart: 6, rowStart: 7, colSpan: 2, rowSpan: 6, image: '/images/azizam/9.jpg' },

    { id: 23, colStart: 10, rowStart: 1, colSpan: 3, rowSpan: 3, image: '/images/azizam/7.jpg' },
    { id: 25, colStart: 10, rowStart: 4, colSpan: 3, rowSpan: 3, image: '/images/azizam/8.jpg' },

    { id: 22, colStart: 8, rowStart: 1, colSpan: 2, rowSpan: 4, image: '/images/azizam/6.jpg' },
    { id: 27, colStart: 8, rowStart: 5, colSpan: 2, rowSpan: 2, image: '/images/azizam/10.jpg' },
    { id: 28, colStart: 8, rowStart: 7, colSpan: 5, rowSpan: 6, image: '/images/azizam/11.jpg' },
  ];

  return (
    <div
      className="grid gap-4 px-8 h-[50rem]"
      style={{
        gridTemplateColumns: 'repeat(12, 1fr)', // 12 ستون با عرض برابر
        gridTemplateRows: 'repeat(10, 1fr)', // 10 ردیف با ارتفاع برابر
      }}
    >
      {images.map(({ id, colStart, rowStart, colSpan, rowSpan, image }) => (
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
            alt={`Image ${id}`}
            className="group-hover:scale-150 transition-transform duration-300"
          />
        </div>
      ))}
    </div>
  );
}

export default ChildrenAlbum;
