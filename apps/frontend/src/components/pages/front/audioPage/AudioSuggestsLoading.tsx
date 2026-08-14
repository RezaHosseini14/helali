import { Skeleton } from '@/components/ui/skeleton';

function AudioSuggestsLoading() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="mb-1 h-5 w-28" />
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-2.5"
        >
          <Skeleton className="size-18 shrink-0 rounded-xl" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-full max-w-[9rem]" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default AudioSuggestsLoading;
