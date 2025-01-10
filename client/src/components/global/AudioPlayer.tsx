'use client';
import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

//Slices
import { SET_CURRENT_AUDIO_INDEX } from '@/redux/slices/audioSlice';

//Components
import Audio from './Audio';

function AudioPlayer() {
  // ---------------------- Redux ----------------------
  const dispatch = useDispatch();
  const { audios, currentAudioIndex, currentAudioStatus } = useSelector((state: RootState) => state.audio);

  // ---------------------- Event Handlers ----------------------
  const handlePrevAudio = () => {
    try {
      dispatch(SET_CURRENT_AUDIO_INDEX(currentAudioIndex - 1));
    } catch (error) {}
  };

  const handleNextAudio = () => {
    try {
      dispatch(SET_CURRENT_AUDIO_INDEX(currentAudioIndex + 1));
    } catch (error) {
      console.log(error);
    }
  };

  // ---------------------- Use Memo ----------------------
  const currentAudio = useMemo(() => {
    if (currentAudioIndex > -1) {
      return audios[currentAudioIndex];
    }
    return undefined;
  }, [currentAudioIndex, audios]);

  // ---------------------- Rendering ----------------------
  return (
    <div className={`fixed flex right-4 transition-all ${currentAudioStatus ? 'bottom-4' : '-bottom-64'} w-[30rem]`}>
      {currentAudio && (
        <div className="flex items-center gap-2">
          <button
            onClick={handleNextAudio}
            disabled={currentAudioIndex + 1 >= audios.length}
            className="rounded-full !size-12 bg-mainColor/50 backdrop-blur-md text-white text-xl disabled:text-white disabled:bg-mainColor/50 disabled:backdrop-blur-md"
          >
            <i className="ki-solid ki-double-right-arrow"></i>
          </button>

          <Audio audioUrl={currentAudio.path} audioDetails={currentAudio} showImage height="h-28" widthFit closeBtn />

          <button
            onClick={handlePrevAudio}
            disabled={currentAudioIndex < 0}
            className="rounded-full !size-12 bg-mainColor/50 backdrop-blur-md text-white text-xl"
          >
            <i className="ki-solid ki-double-left-arrow"></i>
          </button>
        </div>
      )}
    </div>
  );
}

export default AudioPlayer;
