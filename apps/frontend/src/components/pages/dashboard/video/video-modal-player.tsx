'use client';

import { VideoPlayer } from '@/components/global/VideoPlayer';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface IVideoModalPlayerProps {
  readonly src: string;
  readonly poster?: string | null;
  readonly title?: string;
  readonly mimeType?: string;
  readonly className?: string;
  readonly disabled?: boolean;
  readonly onReplace: () => void;
  readonly onRemove: () => void;
}

export function VideoModalPlayer({
  src,
  poster,
  title,
  mimeType,
  className,
  disabled = false,
  onReplace,
  onRemove,
}: IVideoModalPlayerProps) {
  return (
    <div className={cn('flex w-full flex-col gap-2', className)}>
      <div className="flex items-start justify-between gap-2 px-0.5">
        <div className="min-w-0">
          <p className="text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
            پیش‌نمایش ویدیو
          </p>
          {title ? (
            <p className="truncate text-xs font-semibold text-foreground">{title}</p>
          ) : null}
        </div>
        <div className="relative z-20 flex shrink-0 items-center gap-1.5">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={disabled}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onReplace();
            }}
            className="h-8 rounded-full px-3 text-xs"
          >
            تعویض
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            disabled={disabled}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onRemove();
            }}
            aria-label="حذف ویدیو"
            className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <i className="ki-outline ki-cross text-sm" />
          </Button>
        </div>
      </div>

      <div
        className={cn(
          'overflow-hidden rounded-2xl',
          'bg-[linear-gradient(160deg,#164842_0%,#0f6e61_58%,#178a7a_100%)]',
          'shadow-[0_18px_40px_-24px_rgba(22,72,66,0.85)]',
          'ring-1 ring-white/10',
        )}
      >
        <VideoPlayer
          key={src}
          src={src}
          mimeType={mimeType}
          title={title}
          poster={poster || undefined}
          compact
          variant="plain"
          className="aspect-video w-full"
        />
      </div>
    </div>
  );
}
