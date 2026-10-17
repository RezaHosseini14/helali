import type { videoTypes } from 'types/video.type';

import VideoCard from './VideoCard';
import CustomPagination from '@/components/global/CustomPagination';
import { getApiBaseUrl } from '@/services/api-base-url';

interface IVideosListPayload {
  videos: videoTypes[];
  total: number;
  page: number;
}

const API_FETCH_TIMEOUT_MS = 8_000;

async function getVideos(page: number, limit: number): Promise<IVideosListPayload | null> {
  const apiUrl = getApiBaseUrl();

  try {
    const res = await fetch(`${apiUrl}/video?page=${page}&limit=${limit}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(API_FETCH_TIMEOUT_MS),
    });

    if (!res.ok) {
      return null;
    }

    const json = (await res.json()) as { data?: IVideosListPayload };

    if (!json.data?.videos) {
      return null;
    }

    return {
      videos: json.data.videos,
      total: json.data.total ?? 0,
      page: json.data.page ?? page,
    };
  } catch {
    return null;
  }
}

export default async function VideosList({ page }: { page: number }) {
  const limit = 12;
  const data = await getVideos(page, limit);

  if (!data || data.videos.length === 0) {
    return <div className="grid place-content-center py-20 text-foreground">ویدیویی یافت نشد</div>;
  }

  return (
    <>
      <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4">
        {data.videos.map((video: videoTypes) => (
          <VideoCard key={video.id} {...video} />
        ))}
      </div>
      {data.total > limit && (
        <CustomPagination activePage={data.page} total={data.total} limit={limit} />
      )}
    </>
  );
}
