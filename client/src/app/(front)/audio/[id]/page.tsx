'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { Placeholder } from 'rsuite';

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
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { audios, currentAudioStatus } = useSelector((state: RootState) => state.audio);
  const [loadingIds, setLoadingIds] = useState<number[]>([]);

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

  const handleLike = async (audioId: number) => {
    setLoadingIds((prev) => [...prev, audioId]);
    try {
      await mutateAsync(audioId);
      queryClient.invalidateQueries({ queryKey: ['allAudio'] });
      toast.success('لایک موفقیت‌آمیز');
    } catch (error) {
      toast.error('خطا در لایک');
    } finally {
      setLoadingIds((prev) => prev.filter((id) => id !== audioId));
    }
  };

  // ---------------------- Rendering ----------------------
  return (
    <div className="grid grid-cols-12 gap-8 mt-16">
      {/* Main Content */}
      <div className="col-span-9 w-full flex flex-col gap-8">
        {/* Audio Player */}
        <AudioDetails
          audio={data?.data?.audio}
          currentAudioStatus={currentAudioStatus}
          handlePlay={handlePlay}
          isLoading={isLoading}
        />

        {/* Comments Section */}
        <CommentsBox id={Number(id)} />
      </div>

      {/* Sidebar */}
      <AudioSuggests audios={audios} loadingIds={loadingIds} handleLike={handleLike} />
    </div>
  );
}
