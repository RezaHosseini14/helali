import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface IDashboardPanelButton {
  readonly icon: string;
  readonly title: string;
  readonly onClick: () => void;
}

interface IDashboardPanelProps {
  readonly children: ReactNode;
  readonly title: string;
  readonly icon?: string;
  readonly buttons?: IDashboardPanelButton[];
  readonly className?: string;
}

function DashboardPanel(props: IDashboardPanelProps) {
  return (
    <div
      className={cn(
        'relative min-w-0 rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-sm',
        props.className,
      )}
    >
      <div className="mb-4 flex w-full items-center justify-center border-b border-border pb-3">
        <h2 className="flex-1 text-xl font-bold text-foreground">
          <i className={`ki-outline ${props.icon}`} />
          {props.title}
        </h2>
        <div className="flex items-center gap-2">
          {props.buttons?.map((button) => (
            <Button key={button.title} variant="default" size="sm" onClick={button.onClick} className="gap-1">
              <i className={`${button.icon} text-lg`} />
              <span className="leading-6">{button.title}</span>
            </Button>
          ))}
        </div>
      </div>
      {props.children}
    </div>
  );
}

export default DashboardPanel;
