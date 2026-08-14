'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { fileExtension } from 'utils/functions';

interface IFileTypeStyle {
  readonly label: string;
  readonly className: string;
}

const DEFAULT_STYLE: IFileTypeStyle = {
  label: 'FILE',
  className: 'border-primary/25 bg-primary/8 text-primary',
};

const FILE_TYPE_STYLES: Readonly<Record<string, IFileTypeStyle>> = {
  // Audio
  mpeg: {
    label: 'MP3',
    className: 'border-primary/30 bg-primary/10 text-primary',
  },
  mp3: {
    label: 'MP3',
    className: 'border-primary/30 bg-primary/10 text-primary',
  },
  wav: {
    label: 'WAV',
    className: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
  },
  'x-wav': {
    label: 'WAV',
    className: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
  },
  wave: {
    label: 'WAV',
    className: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
  },
  ogg: {
    label: 'OGG',
    className: 'border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300',
  },
  opus: {
    label: 'OPUS',
    className: 'border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300',
  },
  aac: {
    label: 'AAC',
    className: 'border-brand-accent/30 bg-brand-accent/10 text-brand-accent',
  },
  'x-m4a': {
    label: 'M4A',
    className: 'border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-teal-300',
  },
  m4a: {
    label: 'M4A',
    className: 'border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-teal-300',
  },
  flac: {
    label: 'FLAC',
    className: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  },
  'x-flac': {
    label: 'FLAC',
    className: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  },
  'x-ms-wma': {
    label: 'WMA',
    className: 'border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-300',
  },
  wma: {
    label: 'WMA',
    className: 'border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-300',
  },

  // Video
  mp4: {
    label: 'MP4',
    className: 'border-primary/30 bg-primary/10 text-primary',
  },
  webm: {
    label: 'WEBM',
    className: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300',
  },
  quicktime: {
    label: 'MOV',
    className: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
  },
  mov: {
    label: 'MOV',
    className: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
  },
  'x-matroska': {
    label: 'MKV',
    className: 'border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300',
  },
  mkv: {
    label: 'MKV',
    className: 'border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300',
  },
  'x-msvideo': {
    label: 'AVI',
    className: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  },
  avi: {
    label: 'AVI',
    className: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  },

  // Image
  jpeg: {
    label: 'JPEG',
    className: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
  },
  jpg: {
    label: 'JPG',
    className: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
  },
  png: {
    label: 'PNG',
    className: 'border-primary/30 bg-primary/10 text-primary',
  },
  webp: {
    label: 'WEBP',
    className: 'border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-teal-300',
  },
  gif: {
    label: 'GIF',
    className: 'border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300',
  },
  'svg+xml': {
    label: 'SVG',
    className: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  },
  svg: {
    label: 'SVG',
    className: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  },
  avif: {
    label: 'AVIF',
    className: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300',
  },
};

function resolveFileType(mimetype: string): IFileTypeStyle {
  const mediaKind = mimetype.split('/')[0]?.trim().toLowerCase() ?? '';
  const raw = (fileExtension(mimetype) || mimetype || '').trim().toLowerCase();

  if (!raw) {
    return DEFAULT_STYLE;
  }

  // `audio/mp4` is M4A; `video/mp4` stays MP4
  if (raw === 'mp4' && mediaKind === 'audio') {
    return {
      label: 'M4A',
      className: 'border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-teal-300',
    };
  }

  return (
    FILE_TYPE_STYLES[raw] ?? {
      ...DEFAULT_STYLE,
      label: raw.replace(/^x-/, '').toUpperCase(),
    }
  );
}

interface IFileTypeBadgeProps {
  readonly mimetype: string;
  readonly className?: string;
}

/** Shared dashboard table badge for `mimetype` columns — no icon, color per type. */
export function FileTypeBadge({ mimetype, className }: IFileTypeBadgeProps) {
  const style = resolveFileType(mimetype);

  return (
    <Badge
      variant="outline"
      title={mimetype}
      className={cn(
        'mx-auto h-7 w-fit max-w-none shrink-0 truncate rounded-full px-2.5 text-[11px] font-semibold tracking-wide',
        style.className,
        className,
      )}
    >
      <span dir="ltr">{style.label}</span>
    </Badge>
  );
}
