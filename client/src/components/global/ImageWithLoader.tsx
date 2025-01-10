'use client';

import React, { useState } from 'react';
import Image from 'next/image';

function ImageWithLoader({
  src,
  alt,
  className,
  imageClassName,
}: {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  return (
    <div className="relative w-full h-full">
      <div className={`pulse ${isLoaded ? 'opacity-0' : 'opacity-20'}`}></div>
      <Image
        src={src}
        alt={alt}
        layout="fill"
        objectFit="cover"
        onLoadingComplete={handleImageLoad}
        className={`transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${
          imageClassName ? imageClassName : ''
        }`}
      />
    </div>
  );
}

export default ImageWithLoader;
