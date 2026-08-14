'use client';

import { useState } from 'react';

import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { useAudios } from '@/features/audio/hooks/use-audios';
import { FrontPageHeader } from '@/components/layouts/front/FrontPageHeader';
import { AppPagination } from '@/components/global/TablePagination';
import AudioCard from '@/components/pages/front/audiosPage/AudioCard';
import { AUDIO_CARDS_GRID_CLASS } from '@/components/pages/front/audiosPage/audio-cards-grid';
import AudiosPageLoading from '@/components/pages/front/audiosPage/AudiosPageLoading';
import { getApiErrorMessage } from '@/services/get-api-error-message';
import { cn } from '@/lib/utils';
import type { audioTypes } from 'types/audio.type';

const PAGE_SIZE = 24;

export default function AudiosPage() {
  const [page, setPage] = useState(1);
  const { data, isPending, isFetching, isError, error, refetch } = useAudios(page, PAGE_SIZE);

  if (isPending) {
    return (
      <div className="container space-y-8 pt-28 pb-20">
        <FrontPageHeader
          icon="ki-solid ki-abstract-45"
          title="آثار صوتی"
          description="نغمه‌ها و مجالس عبدالرضا هلالی"
        />
        <AudiosPageLoading count={PAGE_SIZE} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container pt-28 pb-20">
        <ErrorState
          title="بارگذاری صوت‌ها ناموفق بود"
          description={getApiErrorMessage(error)}
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  const audios = (data?.audios ?? []) as unknown as audioTypes[];
  const total = data?.total ?? 0;

  return (
    <div className="container space-y-8 pt-28 pb-20">
      <FrontPageHeader
        icon="ki-solid ki-abstract-45"
        title="آثار صوتی"
        description="نغمه‌ها و مجالس عبدالرضا هلالی"
      />

      {audios.length > 0 ? (
        <>
          <div
            className={cn(
              AUDIO_CARDS_GRID_CLASS,
              'overflow-visible pt-1 transition-opacity duration-200',
              isFetching && !isPending ? 'opacity-55' : 'opacity-100',
            )}
          >
            {audios.map((audio, index) => (
              <AudioCard key={audio.id} {...audio} index={index} />
            ))}
          </div>

          {total > PAGE_SIZE ? (
            <AppPagination
              className="sp_pagination justify-center"
              total={total}
              limit={PAGE_SIZE}
              activePage={data?.currentPage ?? page}
              onChangePage={setPage}
            />
          ) : null}
        </>
      ) : (
        <EmptyState title="صوتی یافت نشد" description="هنوز اثری در این بخش منتشر نشده است." />
      )}
    </div>
  );
}
