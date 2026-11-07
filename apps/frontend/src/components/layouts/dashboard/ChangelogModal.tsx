'use client';

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  APP_VERSION,
  CHANGELOG,
  CHANGELOG_SECTION_LABELS,
  CHANGELOG_SECTION_ORDER,
  type ChangelogSectionKey,
} from '@/data/changelog';

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

function sectionBadgeVariant(
  key: ChangelogSectionKey,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (key) {
    case 'added':
      return 'default';
    case 'changed':
      return 'secondary';
    case 'fixed':
      return 'outline';
    case 'security':
      return 'destructive';
    default:
      return 'outline';
  }
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
      <DialogContent className="flex max-h-[min(32rem,85dvh)] flex-col sm:max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle>تغییرات نسخه</DialogTitle>
          <DialogDescription>
            نسخه فعلی: <span className="font-medium text-foreground">v{APP_VERSION}</span>
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="min-h-0 space-y-4 overflow-y-auto pb-4">
          {CHANGELOG.map((entry) => (
            <section
              key={entry.version}
              className="rounded-xl border border-border bg-muted/30 p-3"
            >
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-sm font-semibold text-foreground">
                  v{entry.version} — {entry.title}
                </h3>
                <time dateTime={entry.date} className="text-xs text-muted-foreground">
                  {formatChangelogDate(entry.date)}
                </time>
              </div>
              <div className="space-y-3">
                {CHANGELOG_SECTION_ORDER.map((sectionKey) => {
                  const items = entry[sectionKey];
                  if (!items?.length) {
                    return null;
                  }

                  return (
                    <div key={sectionKey}>
                      <Badge variant={sectionBadgeVariant(sectionKey)} className="mb-1.5">
                        {CHANGELOG_SECTION_LABELS[sectionKey]}
                      </Badge>
                      <ul className="list-disc space-y-1 pe-4 text-sm text-muted-foreground">
                        {items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

export default ChangelogModal;
