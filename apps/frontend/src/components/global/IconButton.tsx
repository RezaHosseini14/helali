'use client';

import type { MouseEvent } from 'react';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface IIconButtonProps {
  readonly onClick: () => void;
  readonly className: string;
  readonly icon: string;
  readonly tooltipText?: string;
  readonly disabled?: boolean;
}

function IconButton(props: IIconButtonProps) {
  const buttonClassName = `${props.className} disabled:cursor-not-allowed disabled:opacity-50`;

  function handleClick(event: MouseEvent<HTMLElement>): void {
    event.preventDefault();
    event.stopPropagation();

    if (props.disabled) {
      return;
    }

    props.onClick();
  }

  if (!props.tooltipText) {
    return (
      <button
        type="button"
        className={buttonClassName}
        onClick={handleClick}
        disabled={props.disabled}
      >
        <i className={props.icon} />
      </button>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger
        type="button"
        className={buttonClassName}
        disabled={props.disabled}
        delay={0}
        closeOnClick
        onClick={handleClick}
      >
        <i className={props.icon} />
      </TooltipTrigger>
      <TooltipContent>{props.tooltipText}</TooltipContent>
    </Tooltip>
  );
}

export default IconButton;
