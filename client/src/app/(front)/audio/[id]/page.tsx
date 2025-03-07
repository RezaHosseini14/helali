'use client';

import { useParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';

// Store
import { RootState } from '@/redux/store';
import { SET_CURRENT_AUDIO_ID, SET_CURRENT_AUDIO_STATUS } from '@/redux/slices/audioSlice';

// Services
import { audioById, likeAudio } from 'services/audio/audioServices';

// Components
import CommentsBox from '@/components/pages/front/audioPage/CommentsBox';

// Types
import AudioSuggests from '@/components/pages/front/audioPage/AudioSuggests';
import AudioDetails from '@/components/pages/front/audioPage/AudioDetails';

export default function AudioPage() {
  // ---------------------- State & Hooks ----------------------
  const { id } = useParams();
  const dispatch = useDispatch();
  const { audios, currentAudioStatus } = useSelector((state: RootState) => state.audio);

  // ---------------------- Data Fetching ----------------------
  const { data, isLoading } = useQuery({
    queryKey: ['audioById', id],
    queryFn: () => audioById(Number(id)),
  });

  const { mutateAsync } = useMutation({
    mutationFn: likeAudio,
  });

  // ---------------------- Event Handlers ----------------------
  const handlePlay = () => {
    dispatch(SET_CURRENT_AUDIO_ID(Number(id)));
    dispatch(SET_CURRENT_AUDIO_STATUS(!currentAudioStatus));
  };

  // ---------------------- Rendering ----------------------
  return (
    <div className="grid grid-cols-12 gap-8 mt-8 container">
      <div className="col-span-9 w-full flex flex-col gap-8">
        <AudioDetails
          audio={data?.data?.audio}
          currentAudioStatus={currentAudioStatus}
          handlePlay={handlePlay}
          isLoading={isLoading}
        />
        <CommentsBox id={Number(id)} />
      </div>
      <div className="lg:col-span-3 col-span-12">
        <AudioSuggests audios={audios} />
      </div>
    </div>
  );
}
