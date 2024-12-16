'use client';

import React from 'react';
import LightGallery from 'lightgallery/react';
import Panel from '@/components/global/Panel';

// Import LightGallery styles
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';

// Import LightGallery plugins
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgZoom from 'lightgallery/plugins/zoom';
import { imageType } from 'types/image.type';
import ImageWithLoader from '@/components/global/ImageWithLoader';

// Type for images

function ImagesBox({ images }: { images: imageType[] }) {
  const onLightGalleryInit = () => {};

  return (
    <Panel title="تصاویر" fill icon="ki-outline ki-picture">
      <LightGallery onInit={onLightGalleryInit} speed={500} plugins={[lgThumbnail, lgZoom]}>
        <div className="grid grid-cols-4 gap-4">
          {images?.length > 0 ? (
            images.map((image, index) => (
              <a
                data-lg-size="1406-1390"
                key={index}
                href={image?.path}
                data-sub-html={`<h4>${image.desc}</h4>`}
                className="group relative"
              >
                <div className="rounded-lg bg-white aspect-square w-full h-full overflow-hidden relative">
                  {/* <img src={image?.path} alt={image?.desc} className="object-cover w-full h-full" /> */}
                  <ImageWithLoader src={image?.path} alt={image?.desc} />
                </div>
                <div className="absolute right-1/2 translate-x-1/2 -bottom-6 bg-white/80 backdrop-blur-md !size-12 text-2xl text-red-500 rounded-full grid place-content-center">
                  <i className="ki-outline ki-heart"></i>
                </div>
              </a>
            ))
          ) : (
            <div className="col-span-4 text-center text-gray-500">تصویری یافت نشد</div>
          )}
        </div>
      </LightGallery>
    </Panel>
  );
}

export default ImagesBox;
