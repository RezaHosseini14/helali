'use client';

import type { ColumnDef, RowData } from '@tanstack/react-table';

import { Checkbox } from '@/components/ui/checkbox';

import type { DataTableFeatures } from './data-table-features';

/** Select column matching shadcn/ui Data Table row-selection pattern. */
export function createDataTableSelectColumn<TData extends RowData>(): ColumnDef<
  DataTableFeatures,
  TData
> {
  return {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={
          table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="انتخاب همه"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="انتخاب ردیف"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  };
}
