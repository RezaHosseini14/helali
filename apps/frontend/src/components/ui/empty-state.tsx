import type { ReactNode } from 'react';

interface IEmptyStateProps {
  readonly title: string;
  readonly description?: string;
  readonly action?: ReactNode;
}

export function EmptyState({ title, description, action }: IEmptyStateProps) {
  return (
    <div className="grid place-content-center gap-3 rounded-2xl border border-dashed border-border bg-card/60 px-6 py-16 text-center shadow-sm backdrop-blur-sm">
      <p className="text-xl font-semibold text-foreground">{title}</p>
      {description ? <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
      {action}
    </div>
  );
}
