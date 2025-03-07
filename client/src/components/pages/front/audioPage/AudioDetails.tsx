'use client';

import { useEffect, useState } from 'react';
import { Button, Placeholder } from 'rsuite';

// Types
import { audioTypes } from 'types/audio.type';

// Functions
import { darkenColor, getAverageColor } from 'utils/functions';

// Components
import ImageWithLoader from '@/components/global/ImageWithLoader';
import ShareButton from '@/components/global/ShareButton';
import AudioDetailsLoading from './AudioDetailsLoading';

type AudioDetailsPropsType = {
  audio: audioTypes;
  handlePlay: () => void;
  currentAudioStatus: boolean;
  isLoading: boolean;
};

function AudioDetails(props: AudioDetailsPropsType) {
  // ---------------------- State & Hooks ----------------------
  const [bgColor, setBgColor] = useState<string>('white');
  const [bgColorDarken, setBgColorDarken] = useState<string>('white');

  // ---------------------- useEffect ----------------------
  useEffect(() => {
    if (props.audio?.posterPath) {
      getAverageColor(props.audio.posterPath)
        .then((color) => {
          setBgColor(color);
          setBgColorDarken(darkenColor(color, 40));
        })
        .catch(() => setBgColor('white'));
    }
  }, [props.audio?.posterPath]);
  // ---------------------- Rendering ----------------------
  return (
    <>
      {props.isLoading ? (
        <AudioDetailsLoading />
      ) : (
        <div id="audio-details" className="flex items-center flex-col gap-8 rounded-xl p-4">
          <div
            className="h-48 w-full rounded-l-[2rem] rounded-r-2xl relative mt-14"
            style={{
              background: `linear-gradient(168deg, ${bgColor} -2.51%, ${bgColorDarken} 100.35%)`,
            }}
          >
            <div className="absolute bottom-8 right-14 flex items-end gap-8">
              <div className="bg-mainbackground p-2 rounded-3xl">
                <div className="corner !size-52 relative">
                  <ImageWithLoader
                    imageClassName="rounded-3xl shadow-lg z-50"
                    src={props.audio?.posterPath}
                    alt={props.audio?.title}
                  />
                </div>
              </div>

              <div className="flex flex-col items-start gap-4 ">
                <h2 className="text-3xl text-white">{props.audio?.title}</h2>
                <div className="flex items-center gap-2">
                  <ShareButton />

                  <Button
                    appearance="primary"
                    color="red"
                    className="!h-8 flex items-center gap-1 !bg-red-100 hover:!bg-red-500 !text-red-700 hover:!text-white"
                  >
                    <i className="ki-outline ki-heart"></i>
                    <span>{props.audio?.like}</span>
                  </Button>

                  <Button
                    appearance="primary"
                    color="red"
                    className="!h-8 flex items-center gap-1 !bg-blue-100 hover:!bg-blue-500 !text-blue-700 hover:!text-white"
                  >
                    <i className="ki-outline ki-eye"></i>
                    <span>{props.audio?.view}</span>
                  </Button>
                </div>
              </div>
            </div>

            <div
              className="absolute left-8 top-1/2 -translate-y-1/2 rounded-full size-16 text-4xl text-white bg-white/20 backdrop-blur-md shadow-lg cursor-pointer p-2 grid place-content-center"
              onClick={props.handlePlay}
            >
              {props.currentAudioStatus ? (
                <i className="ki-solid ki-row-vertical text-2xl"></i>
              ) : (
                <i className="ki-solid ki-to-right"></i>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            {props.audio?.text && (
              <div className="text-lg text-center mt-8">
                <p>متن شعر :</p>
                <p>{props.audio?.text}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default AudioDetails;
