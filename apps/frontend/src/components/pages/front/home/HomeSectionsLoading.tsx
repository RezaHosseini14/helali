import type { ReactNode } from 'react';

import { Skeleton } from '@/components/ui/skeleton';

import { cn } from '@/lib/utils';

interface IPanelSkeletonProps {
  readonly children: ReactNode;
  readonly showMore?: boolean;
  readonly dark?: boolean;
}

function PanelSkeleton({ children, showMore = true, dark = false }: IPanelSkeletonProps) {
  const skeletonTone = dark ? 'bg-white/15' : undefined;

  return (
    <section
      className={cn(
        dark
          ? 'pattern-panel-dark relative isolate overflow-hidden rounded-3xl border border-white/10 bg-mainstructure p-5 text-white shadow-mainshadow backdrop-blur-md sm:p-6'
          : 'rounded-3xl border border-border/50 bg-card/80 p-5 shadow-mainshadow backdrop-blur-md sm:p-6',
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Skeleton className={cn('size-10 shrink-0 rounded-2xl sm:size-11', skeletonTone)} />
          <Skeleton className={cn('h-7 w-20 rounded-lg sm:h-8 sm:w-28', skeletonTone)} />
        </div>
        {showMore ? <Skeleton className={cn('h-9 w-28 shrink-0 rounded-full', skeletonTone)} /> : null}
      </div>
      <div
        className={cn(
          'mt-4 mb-6 h-px w-full sm:mb-7',
          dark ? 'bg-white/20' : 'bg-linear-to-l from-transparent via-primary/25 to-transparent',
        )}
      />
      {children}
    </section>
  );
}

export function HomeSliderSkeleton() {
  return (
    <div className="home-slider-frame relative overflow-hidden">
      <Skeleton className="absolute inset-0 size-full rounded-[inherit] bg-muted/80" />
      <div className="absolute inset-x-0 bottom-0 z-10 space-y-3 p-5 sm:p-8 lg:p-10">
        <Skeleton className="h-6 w-2/3 max-w-md rounded-lg bg-white/20 sm:h-8" />
        <Skeleton className="h-4 w-1/2 max-w-xs rounded-md bg-white/15 sm:h-5" />
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 justify-between px-3 sm:px-5">
        <Skeleton className="size-10 rounded-full bg-white/15 sm:size-11" />
        <Skeleton className="size-10 rounded-full bg-white/15 sm:size-11" />
      </div>
    </div>
  );
}

export function StoriesSectionSkeleton() {
  return (
    <PanelSkeleton showMore={false}>
      <div className="flex gap-3.5 overflow-hidden sm:gap-4 lg:gap-5">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className={cn(
              'relative w-[42%] shrink-0 overflow-hidden rounded-2xl border border-border/40 sm:w-[30%] md:w-[22%] lg:w-[18%]',
              index > 1 && 'hidden sm:block',
              index > 2 && 'sm:hidden md:block',
              index > 3 && 'md:hidden lg:block',
              index > 4 && 'lg:hidden xl:block',
            )}
          >
            <Skeleton className="aspect-192/341 w-full rounded-2xl" />
            <div className="absolute inset-x-0 bottom-0 space-y-2 p-3 pt-10">
              <Skeleton className="h-3.5 w-4/5 rounded-md bg-white/25" />
            </div>
          </div>
        ))}
      </div>
    </PanelSkeleton>
  );
}

export function AudiosSectionSkeleton() {
  return (
    <PanelSkeleton>
      <div className="grid grid-cols-12 gap-x-4 gap-y-10 overflow-visible pt-1">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className={cn(
              'col-span-12 overflow-visible pt-5 sm:col-span-6 lg:col-span-4 xl:col-span-3',
              index > 3 && 'hidden sm:block',
              index > 5 && 'sm:hidden lg:block',
            )}
          >
            <div className="pattern relative flex h-[4.5rem] items-end justify-between rounded-2xl bg-primary/10 p-2">
              <div className="flex flex-1 items-end gap-2">
                <Skeleton className="-mt-5 size-20 shrink-0 rounded-2xl" />
                <div className="flex flex-1 flex-col gap-2 pb-0.5">
                  <Skeleton className="h-4 w-3/4 rounded-md" />
                  <Skeleton className="h-3 w-20 rounded-md" />
                </div>
              </div>
              <Skeleton className="size-11 shrink-0 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </PanelSkeleton>
  );
}

export function ImagesSectionSkeleton() {
  return (
    <PanelSkeleton>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className={cn(
              'relative overflow-hidden rounded-2xl border border-border/40',
              index > 3 && 'hidden sm:block',
              index > 5 && 'sm:hidden lg:block',
            )}
          >
            <Skeleton className="aspect-square w-full rounded-2xl" />
            <div className="absolute inset-x-0 bottom-0 p-3">
              <Skeleton className="h-3.5 w-3/4 rounded-md bg-white/20" />
            </div>
          </div>
        ))}
      </div>
    </PanelSkeleton>
  );
}

export function VideosSectionSkeleton() {
  return (
    <PanelSkeleton dark>
      <div className="grid h-[30rem] grid-cols-12 grid-rows-12 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className={cn(
              'relative overflow-hidden rounded-xl',
              index === 0
                ? 'col-span-12 row-span-6 md:col-span-12 md:row-span-9 lg:col-span-9 lg:row-span-12'
                : 'col-span-6 row-span-3 md:col-span-4 md:row-span-3 lg:col-span-3 lg:row-span-4',
            )}
          >
            <Skeleton className="size-full rounded-xl bg-white/10" />
            <Skeleton className="absolute top-1/2 left-1/2 size-11 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20" />
          </div>
        ))}
      </div>
    </PanelSkeleton>
  );
}

export function TweetsSectionSkeleton() {
  return (
    <PanelSkeleton>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 lg:gap-5">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className={cn(
              'min-h-[17rem] space-y-4 rounded-[1.75rem] border border-primary/10 bg-gradient-to-br from-card to-primary/[0.04] p-5',
              index > 0 && 'hidden sm:block',
              index > 1 && 'hidden xl:block',
            )}
          >
            <div className="flex items-center gap-3">
              <Skeleton className="size-14 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-28 rounded-md" />
                <Skeleton className="h-3 w-20 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-5/6 rounded-md" />
            <Skeleton className="h-4 w-2/3 rounded-md" />
            <div className="flex items-center justify-between border-t border-primary/10 pt-4">
              <Skeleton className="h-3.5 w-24 rounded-md" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-3.5 w-8 rounded-md" />
                <Skeleton className="h-3.5 w-8 rounded-md" />
                <Skeleton className="h-3.5 w-8 rounded-md" />
                <Skeleton className="h-3.5 w-8 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </PanelSkeleton>
  );
}
