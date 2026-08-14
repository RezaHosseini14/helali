import { Skeleton } from '@/components/ui/skeleton';

function AudioDetailsLoading() {
  return (
    <div className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-mainshadow">
      <div className="relative overflow-hidden bg-mainstructure/90 px-5 pb-6 pt-8 sm:px-8 sm:pb-8 sm:pt-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12),transparent_55%)]" />

        <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-end sm:gap-8">
          <Skeleton className="size-48 shrink-0 rounded-2xl sm:size-52" />

          <div className="flex w-full flex-1 flex-col items-center gap-4 sm:items-start sm:pb-1">
            <Skeleton className="h-4 w-24 rounded-full bg-white/20" />
            <Skeleton className="h-9 w-3/4 max-w-md rounded-xl bg-white/25 sm:h-10" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-16 rounded-full bg-white/20" />
              <Skeleton className="h-7 w-16 rounded-full bg-white/20" />
            </div>
            <div className="flex items-center gap-3 pt-1">
              <Skeleton className="size-14 rounded-full bg-white/30" />
              <Skeleton className="h-9 w-28 rounded-xl bg-white/20" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 border-t border-border/60 px-5 py-6 sm:px-8">
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-28 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
        <div className="space-y-3 pt-2">
          <Skeleton className="mx-auto h-5 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    </div>
  );
}

export default AudioDetailsLoading;
