import { Skeleton } from '@/components/ui/skeleton';

function VideosPageLoading({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex flex-col gap-3">
          <Skeleton className="aspect-video w-full rounded-2xl" />
          <div className="flex items-start justify-between gap-3 px-0.5">
            <Skeleton className="h-5 w-3/4 rounded-md" />
            <div className="flex shrink-0 items-center gap-2">
              <Skeleton className="h-4 w-10 rounded-md" />
              <Skeleton className="h-4 w-10 rounded-md" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default VideosPageLoading;
