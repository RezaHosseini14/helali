import { cn } from '@/lib/utils';

interface IFrontPageHeaderProps {
  readonly title: string;
  readonly description?: string;
  readonly icon?: string;
}

export function FrontPageHeader({ title, description, icon }: IFrontPageHeaderProps) {
  return (
    <header className="mb-7 space-y-1 border-b border-border/60 pb-4">
      <h1 className="flex items-center gap-2 text-lg tracking-tight text-foreground sm:text-xl">
        {icon ? <i className={cn(icon, 'text-base text-primary sm:text-lg')} aria-hidden /> : null}
        <strong className="!font-extrabold">{title}</strong>
      </h1>
      {description ? <p className="text-xs text-muted-foreground sm:text-sm">{description}</p> : null}
    </header>
  );
}
