'use client';

import { useState, type ReactNode } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Captions from 'yet-another-react-lightbox/plugins/captions';

import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import 'yet-another-react-lightbox/plugins/captions.css';

interface IImagePlayerSlide {
  src: string;
  alt?: string;
  title?: string;
}

interface IImagePlayerProps {
  slides: IImagePlayerSlide[];
  children: (openAt: (index: number) => void) => ReactNode;
  className?: string;
  onOpen?: (index: number) => void;
  onClose?: () => void;
}

const LIGHTBOX_PLUGINS = [Zoom, Thumbnails, Fullscreen, Captions];

export function ImagePlayer({ slides, children, className, onOpen, onClose }: IImagePlayerProps) {
  const [index, setIndex] = useState(-1);

  const handleOpen = (nextIndex: number) => {
    setIndex(nextIndex);
    onOpen?.(nextIndex);
  };

  const handleClose = () => {
    setIndex(-1);
    onClose?.();
  };

  return (
    <>
      <div className={className}>{children(handleOpen)}</div>
      <Lightbox
        open={index >= 0}
        close={handleClose}
        index={index}
        slides={slides.map((slide) => ({
          src: slide.src,
          alt: slide.alt,
          title: slide.title,
        }))}
        plugins={LIGHTBOX_PLUGINS}
        controller={{ closeOnBackdropClick: true }}
        carousel={{ finite: slides.length <= 1, padding: '16px' }}
        animation={{ fade: 250 }}
        on={{
          view: ({ index: nextIndex }) => {
            setIndex(nextIndex);
            onOpen?.(nextIndex);
          },
        }}
      />
    </>
  );
}

export default ImagePlayer;
