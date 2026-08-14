import { Skeleton } from '@/components/ui/skeleton';

import {
  AUDIO_CARD_COL_CLASS,
  AUDIO_CARDS_GRID_CLASS,
} from '@/components/pages/front/audiosPage/audio-cards-grid';

function AudioCardSkeleton() {
  return (
    <div className={`${AUDIO_CARD_COL_CLASS} overflow-visible pt-5`}>
      <div className="pattern relative flex h-[4.5rem] items-end justify-between rounded-2xl bg-primary/10 p-2">
        <div className="flex flex-1 items-end gap-2">
          <Skeleton className="-mt-5 size-20 shrink-0 rounded-2xl" />
          <div className="flex flex-1 flex-col gap-2 pb-0.5">
            <Skeleton className="h-4 w-3/4 rounded-md" />
            <Skeleton className="h-3 w-20 rounded-md" />
          </div>
        </div>
        <Skeleton className="mb-0.5 size-11 shrink-0 rounded-full" />
      </div>
    </div>
  );
}

function AudiosPageLoading({ count }: { count: number }) {
  return (
    <div className={`${AUDIO_CARDS_GRID_CLASS} overflow-visible pt-1`}>
      {Array.from({ length: count }).map((_, index) => (
        <AudioCardSkeleton key={index} />
      ))}
    </div>
  );
}

export default AudiosPageLoading;
