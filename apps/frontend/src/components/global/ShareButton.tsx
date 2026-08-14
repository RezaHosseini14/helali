'use client';

import { Icon } from '@iconify/react';
import { useState } from 'react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface IShareButtonProps {
  readonly className?: string;
  readonly title?: string;
  readonly text?: string;
}

function ShareButton({ className, title, text }: IShareButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: title ?? document.title,
      text: text ?? 'اشتراک‌گذاری از پایگاه عبدالرضا هلالی',
      url: window.location.href,
    };

    try {
      setLoading(true);

      if (typeof navigator.share === 'function') {
        await navigator.share(shareData);
        return;
      }

      await navigator.clipboard.writeText(shareData.url);
      toast.success('لینک کپی شد');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }

      try {
        await navigator.clipboard.writeText(shareData.url);
        toast.success('لینک کپی شد');
      } catch {
        toast.error('اشتراک‌گذاری ممکن نشد');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      isLoading={loading}
      onClick={() => void handleShare()}
      className={cn(
        'h-10 gap-2 rounded-full border-border/80 bg-card px-4 text-foreground shadow-none',
        'hover:border-mainstructure/25 hover:bg-secondary hover:text-primary',
        'transition-all duration-200',
        className,
      )}
    >
      <Icon icon="solar:share-circle-bold-duotone" className="size-5" />
      <span className="hidden font-medium sm:inline">اشتراک‌گذاری</span>
    </Button>
  );
}

export default ShareButton;
