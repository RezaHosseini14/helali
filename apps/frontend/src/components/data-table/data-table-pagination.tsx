'use client';

import type { ReactTable, RowData } from '@tanstack/react-table';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type { DataTableFeatures } from './data-table-features';

interface IDataTablePaginationProps<TData extends RowData> {
  readonly table: ReactTable<DataTableFeatures, TData>;
  readonly totalItems?: number;
  readonly pageSizeOptions?: ReadonlyArray<number>;
}

export function DataTablePagination<TData extends RowData>({
  table,
  totalItems,
  pageSizeOptions = [5, 10, 20, 50],
}: IDataTablePaginationProps<TData>) {
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const filteredCount = table.getFilteredRowModel().rows.length;
  const pageSize = table.state.pagination.pageSize;
  const pageIndex = table.state.pagination.pageIndex;
  const pageCount = Math.max(1, table.getPageCount());

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-1 pt-4">
      <div className="flex flex-1 flex-wrap items-center gap-3 text-sm text-muted-foreground">
        {typeof totalItems === 'number' ? <span>مجموع: {totalItems}</span> : null}
        {selectedCount > 0 ? (
          <span>
            {selectedCount} از {filteredCount} ردیف انتخاب شده
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium whitespace-nowrap">در صفحه</span>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              if (value == null) {
                return;
              }
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger size="sm" className="h-8 w-[4.5rem]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((option) => (
                <SelectItem key={option} value={`${option}`}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex min-w-[6.5rem] items-center justify-center text-sm font-medium">
          صفحه {pageIndex + 1} از {pageCount}
        </div>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="hidden lg:inline-flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            aria-label="صفحه اول"
          >
            <ChevronsRightIcon />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="صفحه قبل"
          >
            <ChevronRightIcon />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="صفحه بعد"
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="hidden lg:inline-flex"
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!table.getCanNextPage()}
            aria-label="صفحه آخر"
          >
            <ChevronsLeftIcon />
          </Button>
        </div>
      </div>
    </div>
  );
}
