'use client';

import type { ReactTable, RowData } from '@tanstack/react-table';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type { DataTableFeatures } from './data-table-features';

type TPageItem = number | 'ellipsis-start' | 'ellipsis-end';

interface IDataTablePaginationProps<TData extends RowData> {
  readonly table: ReactTable<DataTableFeatures, TData>;
  readonly totalItems?: number;
  readonly pageSizeOptions?: ReadonlyArray<number>;
}

function buildPageItems(activePage: number, pageCount: number): TPageItem[] {
  const windowSize = 5;
  const half = Math.floor(windowSize / 2);
  let start = Math.max(1, activePage - half);
  const end = Math.min(pageCount, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);

  const items: TPageItem[] = [];
  if (start > 1) {
    items.push('ellipsis-start');
  }
  for (let page = start; page <= end; page += 1) {
    items.push(page);
  }
  if (end < pageCount) {
    items.push('ellipsis-end');
  }
  return items;
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
  const activePage = pageIndex + 1;
  const pageItems = buildPageItems(activePage, pageCount);
  const canPrevious = table.getCanPreviousPage();
  const canNext = table.getCanNextPage();

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

        <Pagination className="mx-0 w-auto">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                aria-disabled={!canPrevious}
                className={!canPrevious ? 'pointer-events-none opacity-50' : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  if (canPrevious) {
                    table.previousPage();
                  }
                }}
              />
            </PaginationItem>
            {pageItems.map((item) =>
              item === 'ellipsis-start' || item === 'ellipsis-end' ? (
                <PaginationItem key={item}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={item}>
                  <PaginationLink
                    href="#"
                    isActive={item === activePage}
                    onClick={(event) => {
                      event.preventDefault();
                      table.setPageIndex(item - 1);
                    }}
                  >
                    {item}
                  </PaginationLink>
                </PaginationItem>
              ),
            )}
            <PaginationItem>
              <PaginationNext
                href="#"
                aria-disabled={!canNext}
                className={!canNext ? 'pointer-events-none opacity-50' : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  if (canNext) {
                    table.nextPage();
                  }
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
