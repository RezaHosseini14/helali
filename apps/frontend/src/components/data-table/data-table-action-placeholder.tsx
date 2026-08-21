import type { ReactNode } from 'react';

interface IDataTableActionSlotProps {
  readonly children?: ReactNode;
}

/** Fixed `size-7` cell — always reserve one action column. */
export function DataTableActionSlot({ children }: IDataTableActionSlotProps) {
  return (
    <div className="flex size-7 shrink-0 items-center justify-center">{children}</div>
  );
}

/** Empty action cell (same footprint as IconButton). */
export function DataTableActionPlaceholder() {
  return <DataTableActionSlot />;
}

interface IDataTableActionsProps {
  readonly children: ReactNode;
}

/**
 * Row action strip: each direct child is one fixed column so edit/delete
 * stay vertically aligned across every table row.
 */
export function DataTableActions({ children }: IDataTableActionsProps) {
  return (
    <div
      className="mx-auto inline-grid grid-flow-col auto-cols-[1.75rem] items-center justify-items-center gap-1"
      role="group"
      aria-label="عملیات"
    >
      {children}
    </div>
  );
}
