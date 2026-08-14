'use client';

import Link from 'next/link';
import type { JSX, ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface IMoreButton {
  url: string;
  title?: string;
}

export interface IPanelProps {
  children: ReactNode;
  title: string;
  fill?: boolean;
  classPrifix?: string;
  className?: string;
  icon?: string | JSX.Element;
  container?: boolean;
  dark?: boolean;
  moreButton?: IMoreButton;
}

/** @deprecated Prefer IPanelProps */
export type PanelPropsType = IPanelProps;

function Panel(props: IPanelProps) {
  return (
    <section
      className={cn(
        props.dark ? 'bg-mainstructure text-white' : 'text-foreground',
        props.fill && !props.dark && 'rounded-3xl border border-border/50 bg-card/80 p-5 shadow-mainshadow backdrop-blur-md sm:p-6',
        props.fill && props.dark && 'overflow-hidden rounded-3xl border border-white/10 p-5 shadow-mainshadow backdrop-blur-md sm:p-6',
        props.className,
      )}
    >
      <div className={cn('flex items-center justify-between gap-4', props.container && 'container')}>
        <h2 className="flex min-w-0 items-center gap-3 text-xl sm:text-2xl">
          {props.icon ? (
            <span
              className={cn(
                'grid size-10 shrink-0 place-content-center rounded-2xl text-lg sm:size-11',
                props.dark ? 'bg-white/15 text-white' : 'bg-primary/10 text-primary',
              )}
            >
              {typeof props.icon === 'string' ? <i className={props.icon} /> : props.icon}
            </span>
          ) : null}
          <span className="truncate font-bold tracking-tight">{props.title}</span>
        </h2>

        {props.moreButton ? (
          <Link
            href={props.moreButton.url}
            className={cn(
              'inline-flex shrink-0 items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition',
              props.dark
                ? 'bg-white/15 text-white hover:bg-white/25'
                : 'bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground',
            )}
          >
            {props.moreButton.title ? props.moreButton.title : 'مشاهده همه'}
          </Link>
        ) : null}
      </div>

      <div className={cn(props.container && 'container')}>
        <div
          className={cn(
            'mt-4 mb-6 h-px w-full sm:mb-7',
            props.dark ? 'bg-white/20' : 'bg-gradient-to-l from-transparent via-primary/35 to-transparent',
          )}
        />
      </div>

      {props.children}
    </section>
  );
}

export default Panel;
