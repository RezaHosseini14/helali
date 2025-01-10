'use client';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

// Services
import { videoById } from 'services/video/videoServices';

// Components
import CommentsBox from '@/components/pages/front/audioPage/CommentsBox';
import VideoSuggests from '@/components/pages/front/videoPage/VideoSuggests';
import VideoDetails from '@/components/pages/front/videoPage/VideoDetails';

export default function VideoPage() {
  // ---------------------- State & Hooks ----------------------
  const { id } = useParams();

  // ---------------------- Data Fetching ----------------------
  const { data, isLoading } = useQuery({
    queryKey: ['videoById', id],
    queryFn: () => videoById(Number(id)),
  });

  // ---------------------- Rendering ----------------------
  return (
    <div className="grid grid-cols-12 gap-8 mt-16 container">
      <div className="col-span-9 w-full flex flex-col gap-8">
        <VideoDetails video={data?.data?.video} isLoading={isLoading} />
        <CommentsBox id={Number(id)} />
      </div>
      <VideoSuggests />
    </div>
  );
}
