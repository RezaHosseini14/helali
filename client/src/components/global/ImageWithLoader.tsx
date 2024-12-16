'use client';

import React, { useState } from 'react';
import Image from 'next/image';

function ImageWithLoader({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  return (
    <Image
      src={src}
      alt={alt}
      layout="fill"
      objectFit="cover"
      onLoadingComplete={handleImageLoad}
      className={`transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
    />
  );
}

export default ImageWithLoader;
