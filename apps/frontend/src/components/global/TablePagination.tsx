'use client';

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

type TPageItem = number | 'ellipsis-start' | 'ellipsis-end';

interface IAppPaginationProps {
  readonly activePage: number;
  readonly total: number;
  readonly limit: number;
  readonly onChangePage: (page: number) => void;
  readonly className?: string;
}

function getPageCount(total: number, limit: number): number {
  if (limit <= 0) {
    return 1;
  }
  return Math.max(1, Math.ceil(total / limit));
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

export function AppPagination(props: IAppPaginationProps) {
  const pageCount = getPageCount(props.total, props.limit);
  const pageItems = buildPageItems(props.activePage, pageCount);
  const canPrevious = props.activePage > 1;
  const canNext = props.activePage < pageCount;

  return (
    <Pagination className={props.className}>
      <PaginationContent className="sp_pagination flex-wrap justify-center gap-1">
        <PaginationItem>
          <PaginationPrevious
            href="#"
            aria-disabled={!canPrevious}
            className={!canPrevious ? 'pointer-events-none opacity-50' : undefined}
            onClick={(event) => {
              event.preventDefault();
              if (canPrevious) {
                props.onChangePage(props.activePage - 1);
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
                isActive={item === props.activePage}
                onClick={(event) => {
                  event.preventDefault();
                  props.onChangePage(item);
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
                props.onChangePage(props.activePage + 1);
              }
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

interface ITablePaginationProps {
  readonly children: React.ReactNode;
  readonly total: number;
  readonly limit: number;
  readonly page: number;
  readonly setPage: (page: number) => void;
  readonly handleChangeLimit: (limit: number) => void;
}

function TablePagination(props: ITablePaginationProps) {
  return (
    <>
      {props.children}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
        <p className="text-sm text-muted-foreground">مجموع: {props.total}</p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">در صفحه</span>
          <Select
            value={`${props.limit}`}
            onValueChange={(value) => {
              if (value == null) {
                return;
              }
              props.handleChangeLimit(Number(value));
            }}
          >
            <SelectTrigger size="sm" className="h-8 w-[4.5rem]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {[1, 5, 10].map((option) => (
                <SelectItem key={option} value={`${option}`}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <AppPagination
          activePage={props.page}
          total={props.total}
          limit={props.limit}
          onChangePage={props.setPage}
        />
      </div>
    </>
  );
}

export default TablePagination;
