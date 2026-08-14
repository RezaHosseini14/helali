'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const UNITS = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت', 'ترابایت'] as const;

interface IFormattedFileSize {
  readonly value: string;
  readonly unit: (typeof UNITS)[number];
}

function toByteCount(input: number | string): number {
  if (typeof input === 'number') {
    return Number.isFinite(input) ? input : 0;
  }

  const parsed = Number.parseFloat(input);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatFileSizeParts(input: number | string): IFormattedFileSize {
  const bytes = toByteCount(input);

  if (bytes <= 0) {
    return { value: '0', unit: 'بایت' };
  }

  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < UNITS.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const digits = unitIndex === 0 ? 0 : value >= 100 ? 0 : value >= 10 ? 1 : 2;

  return {
    value: value.toFixed(digits),
    unit: UNITS[unitIndex],
  };
}

interface IFileSizeBadgeProps {
  readonly bytes: number | string;
  readonly className?: string;
}

/** Shared dashboard table badge for `size` columns — Persian units, accepts string|number bytes. */
export function FileSizeBadge({ bytes, className }: IFileSizeBadgeProps) {
  const { value, unit } = formatFileSizeParts(bytes);

  return (
    <Badge
      variant="outline"
      title={`${value} ${unit}`}
      className={cn(
        'mx-auto h-7 w-fit max-w-none shrink-0 gap-1.5 whitespace-nowrap rounded-full border-primary/20 bg-primary/6 px-2.5 text-primary',
        className,
      )}
    >
      <span dir="ltr" className="text-[12px] font-semibold tabular-nums tracking-tight">
        {value}
      </span>
      <span className="text-[11px] font-bold text-primary">{unit}</span>
    </Badge>
  );
}
