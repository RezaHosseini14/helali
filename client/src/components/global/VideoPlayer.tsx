'use client';
import React, { useEffect, useRef } from 'react';
import Plyr from 'plyr';

type VideoPlayerProps = {
  src: string;
  controls?: boolean;
  poster?: string;
  autoPlay?: boolean;
};

function VideoPlayer({ src, controls = true, poster, autoPlay = false }: VideoPlayerProps) {
  const videoHtmlTagRef = useRef<HTMLVideoElement>(null);
  const videoPlyrRef = useRef<Plyr | any>(null);
  const initVideo = () => {
    videoPlyrRef.current = new Plyr(videoHtmlTagRef.current!);
  };
  useEffect(() => {
    initVideo();
  }, []);
  videoHtmlTagRef.current;
  return (
    <>
      <video
        className="object-scale-down w-full h-full aspect-video"
        poster={poster}
        controls={controls}
        ref={videoHtmlTagRef}
        src={src}
        autoPlay={autoPlay}
      ></video>
    </>
  );
}

export default VideoPlayer;
