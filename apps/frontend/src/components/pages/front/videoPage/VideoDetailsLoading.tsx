import { Skeleton } from '@/components/ui/skeleton';

function VideoDetailsLoading() {
  return (
    <div className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-mainshadow">
      <Skeleton className="aspect-video w-full rounded-none bg-mainstructure/80" />

      <div className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-3">
            <Skeleton className="h-4 w-16 rounded-full" />
            <Skeleton className="h-8 w-3/4 max-w-lg rounded-xl sm:h-9" />
          </div>
          <div className="flex flex-wrap gap-2 rounded-2xl border border-border/50 bg-secondary/40 p-2 sm:p-2.5">
            <Skeleton className="h-10 w-24 rounded-full" />
            <Skeleton className="h-10 w-24 rounded-full" />
            <Skeleton className="h-10 w-20 rounded-full" />
            <Skeleton className="h-10 w-20 rounded-full" />
          </div>
        </div>

        <div className="space-y-3 border-t border-border/70 pt-4">
          <Skeleton className="mx-auto h-5 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    </div>
  );
}

export default VideoDetailsLoading;
