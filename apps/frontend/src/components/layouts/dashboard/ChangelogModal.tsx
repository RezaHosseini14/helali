'use client';

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { APP_VERSION, CHANGELOG } from '@/data/changelog';

interface IChangelogModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
}

function formatChangelogDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(parsed);
}

function ChangelogModal({ open, onClose }: IChangelogModalProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle>تغییرات نسخه</DialogTitle>
          <DialogDescription>
            نسخه فعلی: <span className="font-medium text-foreground">v{APP_VERSION}</span>
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4 pb-4">
          {CHANGELOG.map((entry) => (
            <section
              key={entry.version}
              className="rounded-xl border border-border bg-muted/30 p-3"
            >
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-sm font-semibold text-foreground">
                  v{entry.version} — {entry.title}
                </h3>
                <time
                  dateTime={entry.date}
                  className="text-xs text-muted-foreground"
                >
                  {formatChangelogDate(entry.date)}
                </time>
              </div>
              <ul className="list-disc space-y-1.5 pe-4 text-sm text-muted-foreground">
                {entry.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

export default ChangelogModal;
