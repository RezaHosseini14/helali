'use client';
import Image from 'next/image';
import { RootState } from '@/redux/store';
import { useWavesurfer } from '@wavesurfer/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

//Types
import { audioTypes } from 'types/audio.type';

//Slices
import { SET_CURRENT_AUDIO_STATUS } from '@/redux/slices/audioSlice';

//Functions
import { formatTime } from 'utils/functions';

export type AudioPropsTypes = {
  audioUrl: string;
  audioDetails: audioTypes;
  audioWidth?: number;
  audioHeight?: number;
  height?: string;
  showImage?: boolean;
  widthFit?: boolean;
  closeBtn: boolean;
};

function Audio(props: AudioPropsTypes) {
  const dispatch = useDispatch();
  const { currentAudioStatus } = useSelector((state: RootState) => state.audio);

  // ---------------------- State & Ref & Hook ----------------------
  const containerRef = useRef<null | any>(null);
  const [urlIndex, setUrlIndex] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  const { wavesurfer, isPlaying, isReady, currentTime } = useWavesurfer({
    container: containerRef,
    height: props.audioHeight ? props.audioHeight : 25,
    width: props.audioWidth ? props.audioWidth : 220,
    waveColor: '#ffffff',
    progressColor: '#d60060',
    cursorColor: '#ddd5e9',
    barWidth: 5,
    barGap: 3,
    barRadius: 30,
    barHeight: 1,
    url: props.audioUrl,
  });

  // ---------------------- Event Handlers ----------------------
  const onPlayPause = useCallback(() => {
    if (wavesurfer) {
      if (wavesurfer.isPlaying()) {
        wavesurfer.pause();
      } else {
        wavesurfer.play();
      }
    }
  }, [wavesurfer]);

  const handleClose = () => {
    dispatch(SET_CURRENT_AUDIO_STATUS(false));
  };

  // ---------------------- UseEffect ----------------------
  useEffect(() => {
    if (wavesurfer) {
      wavesurfer.load(props.audioUrl);
      wavesurfer.on('ready', () => {
        setDuration(wavesurfer.getDuration());
      });
    }
  }, [urlIndex, wavesurfer]);

  useEffect(() => {
    if (wavesurfer && isReady) {
      if (currentAudioStatus) {
        wavesurfer.play();
      } else {
        wavesurfer.pause();
      }
    }
  }, [currentAudioStatus, wavesurfer, isReady]);

  // ---------------------- Rendering ----------------------
  return (
    <div
      className={`${props.widthFit ? '' : 'w-full'} relative overflow-hidden ${
        props.height ? props.height : 'h-24'
      } bg-mainColor/50 backdrop-blur-md rounded-xl p-2 flex gap-2`}
    >
      {props.showImage ? (
        <div className="rounded-lg bg-white aspect-square h-full overflow-hidden relative">
          <Image src={props.audioDetails.posterPath} alt={props.audioDetails.title} layout="fill" objectFit="cover" />
        </div>
      ) : null}
      <div className="flex flex-col flex-1 gap-2 text-white">
        <span className="font-bold">{props.audioDetails?.title}</span>
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

      {props.closeBtn ? (
        <button className="absolute left-2 top-2 text-white" onClick={handleClose}>
          <i className="ki-solid ki-cross"></i>
        </button>
      ) : null}
    </div>
  );
}

export default Audio;
