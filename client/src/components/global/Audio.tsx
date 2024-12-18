'use client';
import { useWavesurfer } from '@wavesurfer/react';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { audioTypes } from 'types/audio.type';

export type AudioPropsTypes = {
  audioUrl: string;
  audioDetails: audioTypes;
  audioWidth?: number;
  audioHeight?: number;
  height?: string;
  showImage?: boolean;
};
const formatTime = (seconds: number) =>
  [seconds / 60, seconds % 60].map((v) => `0${Math.floor(v)}`.slice(-2)).join(':');

function Audio({ audioUrl, audioDetails, audioWidth, audioHeight, height, showImage }: AudioPropsTypes) {
  const containerRef = useRef<null | any>(null);
  const [urlIndex, setUrlIndex] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  const { wavesurfer, isPlaying, isReady, currentTime } = useWavesurfer({
    container: containerRef,
    height: audioHeight ? audioHeight : 25,
    width: audioWidth ? audioWidth : 220,
    waveColor: '#ffffff',
    progressColor: '#d60060',
    cursorColor: '#ddd5e9',
    barWidth: 5,
    barGap: 3,
    barRadius: 30,
    barHeight: 1,
    url: audioUrl,
  });

  useEffect(() => {
    if (wavesurfer) {
      wavesurfer.load(audioUrl);
      wavesurfer.on('ready', () => {
        setDuration(wavesurfer.getDuration());
      });
    }
  }, [urlIndex, wavesurfer]);

  const onPlayPause = useCallback(() => {
    if (wavesurfer) {
      if (wavesurfer.isPlaying()) {
        wavesurfer.pause();
      } else {
        wavesurfer.play();
      }
    }
  }, [wavesurfer]);

  return (
    <div
      className={`w-full relative overflow-hidden lg:col-span-3 md:col-span-6 col-span-12 ${
        height ? height : 'h-24'
      } bg-mainColor/50 backdrop-blur-md rounded-xl p-2 flex gap-2`}
    >
      {showImage ? (
        <div className="rounded-lg bg-white aspect-square h-full overflow-hidden relative">
          <Image src={audioDetails.posterPath} alt={audioDetails.title} layout="fill" objectFit="cover" />
        </div>
      ) : null}
      <div className="flex flex-col flex-1 gap-2 text-white">
        <span className="font-bold">{audioDetails?.title}</span>
        <div className="flex items-center gap-1">
          <div className="grid place-content-center flex-1">
            <div ref={containerRef} style={!isReady ? { display: 'none' } : { display: 'flex' }} />
          </div>

          <button onClick={onPlayPause} className="grid place-content-center text-white size-[33px] ">
            {isPlaying ? (
              <i className="ki-solid ki-row-vertical text-2xl"></i>
            ) : (
              <i className="ki-solid ki-to-right text-5xl"></i>
            )}
          </button>
        </div>

        <p>
          {formatTime(currentTime)} / {formatTime(duration)}
        </p>

        <div style={{ margin: '1em 0', display: 'flex', gap: '1em' }}></div>
      </div>

      {!isReady ? (
        <div className="z-50 absolute right-1/2 translate-x-1/2 top-1/2 -translate-y-1/2 bg-white/70 backdrop-blur-xl w-full h-full flex items-center justify-center">
          <div className="loader"></div>
        </div>
      ) : null}
    </div>
  );
}

export default Audio;
