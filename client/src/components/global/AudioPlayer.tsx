'use client';
import React, { useMemo } from 'react';
import Audio from './Audio';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { Button } from 'rsuite';
import { SET_CURRENT_AUDIO_INDEX } from '@/redux/slices/audioSlice';

function AudioPlayer() {
  const dispatch = useDispatch();
  const { audios, currentAudioIndex, currentAudioStatus } = useSelector((state: RootState) => state.audio);

  const handlePrevAudio = () => {
    try {
      dispatch(SET_CURRENT_AUDIO_INDEX(currentAudioIndex - 1));
    } catch (error) {}
  };
  const handleNextAudio = () => {
    try {
      dispatch(SET_CURRENT_AUDIO_INDEX(currentAudioIndex + 1));
    } catch (error) {}
  };

  const currentAudio = useMemo(() => {
    if (currentAudioIndex > -1) {
      return audios[currentAudioIndex];
    }
    return undefined;
  }, [currentAudioIndex, audios]);

  return (
    <div className={`fixed flex right-4 transition-all ${currentAudioStatus ? 'bottom-4' : '-bottom-64'} w-[30rem]`}>
      {currentAudio && (
        <div className="flex items-center gap-2">
          <Button
            onClick={handleNextAudio}
            disabled={currentAudioIndex + 1 >= audios.length}
            className="rounded-full !size-12 bg-mainColor/50 backdrop-blur-md text-white text-xl disabled:text-white disabled:bg-mainColor/50 disabled:backdrop-blur-md"
          >
            <i className="ki-solid ki-double-right-arrow"></i>
          </Button>

          <Audio audioUrl={currentAudio.path} audioDetails={currentAudio} />

          <Button
            onClick={handlePrevAudio}
            disabled={currentAudioIndex < 0}
            className="rounded-full !size-12 bg-mainColor/50 backdrop-blur-md text-white text-xl"
          >
            <i className="ki-solid ki-double-left-arrow"></i>
          </Button>
        </div>
      )}
    </div>
  );
}

export default AudioPlayer;
