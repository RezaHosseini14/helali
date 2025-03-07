'use client';
import React, { useEffect, useRef } from 'react';

type StarrySkyProps = {
  className?: string;
  children: React.ReactNode;
};

const StarrySky = ({ className, children }: StarrySkyProps) => {
  const skyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sky = skyRef.current;

    if (!sky) return;

    const numberOfStars = 150;

    for (let i = 0; i < numberOfStars; i++) {
      const star = document.createElement('div');
      star.classList.add('star');

      const top = Math.random() * 100;
      const left = Math.random() * 100;
      const size = Math.random() * 3 + 1;
      const duration = Math.random() * 3 + 2;

      star.style.top = `${top}%`;
      star.style.left = `${left}%`;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.animationDuration = `${duration}s`;

      sky.appendChild(star);
    }

    return () => {
      if (sky) {
        sky.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className={`sky ${className ? className : ''}`} ref={skyRef}>
      {children}
    </div>
  );
};

export default StarrySky;
