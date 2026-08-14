'use client';

import { useState } from 'react';
import Image from 'next/image';

function ImageWithLoader({
  src,
  alt,
  className,
  imageClassName,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw',
}: {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  sizes?: string;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`relative flex h-full w-full items-center justify-center bg-muted text-muted-foreground ${className || ''}`}
        aria-label={alt}
      >
        <i className="ki-outline ki-picture text-2xl opacity-50" />
      </div>
    );
  }

  return (
    <div className={`relative h-full w-full ${className || ''}`}>
      {!isLoaded ? <div className="absolute inset-0 animate-pulse bg-muted/80" /> : null}
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        style={{ objectFit: 'cover' }}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${imageClassName || ''}`}
      />
    </div>
  );
}

export default ImageWithLoader;
