'use client';

import { ScrollText } from 'lucide-react';

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
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

function ChangelogItemList({ items }: { readonly items: string[] }) {
  return (
    <ul className="space-y-2.5" role="list">
      {items.map((item) => (
        <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
          <span
            className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-primary/75"
            aria-hidden
          />
          <span className="min-w-0 flex-1 text-pretty text-foreground/85">{item}</span>
        </li>
      ))}
    </ul>
  );
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
      <DialogContent
        className="flex max-h-[min(36rem,88dvh)] flex-col gap-0 p-0 sm:max-w-xl"
        dir="rtl"
      >
        <DialogHeader className="border-b border-border/70 bg-gradient-to-b from-primary/[0.07] to-transparent px-5 pb-4 pt-5">
          <div className="flex items-start gap-3 pe-7">
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15"
              aria-hidden
            >
              <ScrollText className="size-5" />
            </div>
            <div className="min-w-0 flex-1 space-y-1.5">
              <DialogTitle className="text-base tracking-tight">تغییرات نسخه</DialogTitle>
              <DialogDescription className="flex flex-wrap items-center gap-2 text-sm">
                <span>نسخه فعلی</span>
                <Badge variant="outline" className="font-mono text-[11px] tabular-nums">
                  v{APP_VERSION}
                </Badge>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogBody className="min-h-0 space-y-4 overflow-y-auto px-5 py-4">
          {CHANGELOG.map((entry) => (
            <section
              key={entry.version}
              className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm ring-1 ring-foreground/[0.04]"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 bg-muted/25 px-4 py-3">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-xs font-semibold tabular-nums text-primary">
                    v{entry.version}
                  </span>
                  <h3 className="text-sm font-semibold text-foreground">{entry.title}</h3>
                </div>
                <time
                  dateTime={entry.date}
                  className="shrink-0 rounded-full bg-background/80 px-2.5 py-0.5 text-xs text-muted-foreground ring-1 ring-border/60"
                >
                  {formatChangelogDate(entry.date)}
                </time>
              </div>
              <div className="space-y-4 p-4">
                {CHANGELOG_SECTION_ORDER.map((sectionKey) => {
                  const items = entry[sectionKey];
                  if (!items?.length) {
                    return null;
                  }

                  return (
                    <div
                      key={sectionKey}
                      className={cn(
                        'rounded-xl border border-border/50 bg-muted/20 p-3',
                        sectionKey === 'added' && 'border-primary/15 bg-primary/[0.04]',
                      )}
                    >
                      <Badge
                        variant={sectionBadgeVariant(sectionKey)}
                        className="mb-2.5 h-6 px-2.5 text-[11px]"
                      >
                        {CHANGELOG_SECTION_LABELS[sectionKey]}
                      </Badge>
                      <ChangelogItemList items={items} />
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
