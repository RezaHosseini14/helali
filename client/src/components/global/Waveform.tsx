'use client';
import { useWavesurfer } from '@wavesurfer/react';
import { useCallback, useEffect, useRef, useState } from 'react';

const formatTime = (seconds: number) =>
  [seconds / 60, seconds % 60].map((v) => `0${Math.floor(v)}`.slice(-2)).join(':');

const Waveform = ({ audioUrl }: { audioUrl: string }) => {
  const containerRef = useRef(null);
  const [urlIndex, setUrlIndex] = useState(0);
  const [duration, setDuration] = useState(0);

  const { wavesurfer, isPlaying, isReady, currentTime } = useWavesurfer({
    container: containerRef,
    height: 50,
    width: 150,
    waveColor: '#ffffff',
    progressColor: '#d60060',
    cursorColor: '#ddd5e9',
    barWidth: 5,
    barGap: 3,
    barRadius: 30,
    barHeight: 1,
    url: audioUrl,
  });

  // const onUrlChange = useCallback(() => {
  //   setUrlIndex((index) => (index + 1) % audioUrls.length);
  // }, []);

  // useEffect(() => {
  //   if (wavesurfer) {
  //     const onFinish = () => {
  //       setUrlIndex((prevIndex) => (prevIndex + 1) % audioUrls.length);
  //     };
  //     wavesurfer.on("finish", onFinish);
  //     return () => {
  //       wavesurfer.un("finish", onFinish);
  //     };
  //   }
  // }, [wavesurfer]);

  useEffect(() => {
    if (wavesurfer) {
      // wavesurfer.load(audioUrls[urlIndex]);
      wavesurfer.load(audioUrl);
      wavesurfer.on('ready', () => {
        setDuration(wavesurfer.getDuration()); // دریافت مدت زمان کل
        // wavesurfer.play();
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
    <>
      <div className="flex items-center gap-1">
        <div className="grid place-content-center flex-1">
          <div>{!isReady ? <p>Loading...</p> : null}</div>
          <div ref={containerRef} style={!isReady ? { display: 'none' } : { display: 'flex' }} />
        </div>

        <button onClick={onPlayPause} className="flex items-center gap-2 justify-center text-5xl text-white size-6">
          {isPlaying ? (
            <>
              <i className="ki-solid ki-minus rotate-90 w-2 -mb-8"></i>
              <i className="ki-solid ki-minus rotate-90 w-2 -mb-8"></i>
            </>
          ) : (
            <i className="ki-solid ki-to-right"></i>
          )}
        </button>
      </div>

      <p>
        {formatTime(currentTime)} / {formatTime(duration)}
      </p>

      <div style={{ margin: '1em 0', display: 'flex', gap: '1em' }}>
        {/* <button onClick={onUrlChange}>Change audio</button> */}
      </div>
    </>
  );
};

export default Waveform;
