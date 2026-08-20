'use client';

import { Icon } from '@iconify/react';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface IChartPanelProps {
  readonly title: string;
  readonly description?: string;
  readonly icon: string;
  readonly accentClassName: string;
  readonly children?: React.ReactNode;
  readonly headerExtra?: React.ReactNode;
  readonly className?: string;
  readonly isLoading?: boolean;
  readonly chartHeightClassName?: string;
}

function ChartCanvasSkeleton() {
  return <Skeleton className="h-full min-h-[14rem] w-full rounded-xl" aria-hidden="true" />;
}

export function DashboardChartPanel({
  title,
  description,
  icon,
  accentClassName,
  children,
  headerExtra,
  className,
  isLoading = false,
  chartHeightClassName = 'h-[16rem] sm:h-[17.5rem]',
}: IChartPanelProps) {
  return (
    <section
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm backdrop-blur-sm',
        className,
      )}
      aria-busy={isLoading}
    >
      <div
        className={cn(
          'pointer-events-none absolute -start-12 -top-12 h-36 w-36 rounded-full opacity-25 blur-3xl transition-opacity duration-500 group-hover:opacity-40',
          accentClassName,
        )}
        aria-hidden="true"
      />
      <div
        className={cn(
          'pointer-events-none absolute -bottom-16 -end-10 h-28 w-28 rounded-full opacity-15 blur-2xl',
          accentClassName,
        )}
        aria-hidden="true"
      />

      <div className="relative mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          {isLoading ? (
            <Skeleton className="h-10 w-10 shrink-0 rounded-xl" aria-hidden="true" />
          ) : (
            <span
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-md ring-1 ring-white/15',
                accentClassName,
              )}
            >
              <Icon icon={icon} className="text-xl" />
            </span>
          )}
          <div className="min-w-0">
            {isLoading ? (
              <>
                <Skeleton className="mb-2 h-5 w-36 rounded-md" aria-hidden="true" />
                <Skeleton className="h-4 w-52 rounded-md" aria-hidden="true" />
              </>
            ) : (
              <>
                <h3 className="font-semibold text-foreground">{title}</h3>
                {description ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
                ) : null}
              </>
            )}
          </div>
        </div>
        {headerExtra}
      </div>

      <div className={cn('relative', chartHeightClassName)}>
        {isLoading ? <ChartCanvasSkeleton /> : children}
      </div>
    </section>
  );
}

export function ChartEmptyState({ message }: { readonly message: string }) {
  return (
    <div className="flex h-full min-h-[14rem] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 text-center">
      <Icon icon="solar:chart-2-bold-duotone" className="text-3xl text-muted-foreground/60" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
