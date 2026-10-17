'use client';

import { Icon } from '@iconify/react';

import { Button } from '@/components/ui/button';
import { toBrowserMediaUrl } from '@/lib/browser-media-url';
import { cn } from '@/lib/utils';

interface IDownloadButtonProps {
  readonly link: string;
  readonly className?: string;
}

function DownloadButton({ link, className }: IDownloadButtonProps) {
  const href = toBrowserMediaUrl(link);

  return (
    <Button
      render={<a href={href} download />}
      nativeButton={false}
      size="sm"
      className={cn(
        'h-10 gap-2 rounded-full border border-primary/15 bg-primary/10 px-4 text-primary shadow-none',
        'hover:border-primary/30 hover:bg-primary hover:text-primary-foreground',
        'transition-all duration-200',
        className,
      )}
    >
      <Icon icon="solar:download-minimalistic-bold-duotone" className="size-5" />
      <span className="hidden font-medium sm:inline">دانلود</span>
    </Button>
  );
}

export default DownloadButton;
