'use client';

import { useState } from 'react';

import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { useVideos } from '@/features/video/hooks/use-videos';
import { FrontPageHeader } from '@/components/layouts/front/FrontPageHeader';
import VideoCard from '@/components/pages/front/videosPage/VideoCard';
import VideosPageLoading from '@/components/pages/front/videosPage/VideosPageLoading';
import { AppPagination } from '@/components/global/TablePagination';
import { getApiErrorMessage } from '@/services/get-api-error-message';
import type { videoTypes } from 'types/video.type';

const PAGE_SIZE = 12;

export default function VideoPage() {
  const [page, setPage] = useState(1);
  const { data, isPending, isFetching, isError, error, refetch } = useVideos(page, PAGE_SIZE);

  if (isPending) {
    return (
      <div className="container space-y-8 pt-28 pb-20">
        <FrontPageHeader
          icon="ki-solid ki-youtube"
          title="ویدیوها"
          description="مجموعه‌ای از ویدیوهای رسمی مداحی"
        />
        <VideosPageLoading count={PAGE_SIZE} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container pt-28 pb-20">
        <ErrorState
          title="بارگذاری ویدیوها ناموفق بود"
          description={getApiErrorMessage(error)}
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  const videos = (data?.videos ?? []) as unknown as videoTypes[];

  return (
    <div className="container space-y-8 pt-28 pb-20">
      <FrontPageHeader
        icon="ki-solid ki-youtube"
        title="ویدیوها"
        description="مجموعه‌ای از ویدیوهای رسمی مداحی"
      />

      {isFetching && !isPending ? (
        <div className="text-center text-sm text-muted-foreground">در حال به‌روزرسانی...</div>
      ) : null}

      {videos.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {videos.map((video) => (
              <VideoCard key={video.id} {...video} />
            ))}
          </div>
          {(data?.total ?? 0) > PAGE_SIZE ? (
            <AppPagination
              className="sp_pagination justify-center"
              total={data?.total ?? 0}
              limit={PAGE_SIZE}
              activePage={data?.page ?? page}
              onChangePage={setPage}
            />
          ) : null}
        </>
      ) : (
        <EmptyState title="ویدیویی یافت نشد" description="هنوز ویدیویی در این بخش منتشر نشده است." />
      )}
    </div>
  );
}
