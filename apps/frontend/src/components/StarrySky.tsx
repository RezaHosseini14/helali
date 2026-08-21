'use client';

import { useEffect, useRef, type ReactNode } from 'react';

interface IStarrySkyProps {
  readonly className?: string;
  readonly children: ReactNode;
}

function StarrySky({ className, children }: IStarrySkyProps) {
  const starsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const starsLayer = starsRef.current;
    if (!starsLayer) {
      return;
    }

    const numberOfStars = 150;
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < numberOfStars; i += 1) {
      const star = document.createElement('div');
      star.classList.add('star');
      star.style.top = `${Math.random() * 100}%`;
      star.style.left = `${Math.random() * 100}%`;
      const size = Math.random() * 3 + 1;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.animationDuration = `${Math.random() * 3 + 2}s`;
      fragment.appendChild(star);
    }

    starsLayer.appendChild(fragment);

    return () => {
      starsLayer.replaceChildren();
    };
  }, []);

  return (
    <div className={`sky relative ${className ?? ''}`}>
      <div ref={starsRef} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden />
      {children}
    </div>
  );
}

export default StarrySky;
