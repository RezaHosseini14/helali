'use client';

import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

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

function buildPages(activePage: number, pageCount: number): number[] {
  const windowSize = 5;
  const half = Math.floor(windowSize / 2);
  let start = Math.max(1, activePage - half);
  const end = Math.min(pageCount, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  const pages: number[] = [];
  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }
  return pages;
}

export function AppPagination(props: IAppPaginationProps) {
  const pageCount = getPageCount(props.total, props.limit);
  const pages = buildPages(props.activePage, pageCount);

  return (
    <Pagination className={props.className}>
      <PaginationContent className="sp_pagination flex-wrap justify-center gap-1">
        <PaginationItem>
          <PaginationPrevious
            text="قبلی"
            href="#"
            onClick={(event) => {
              event.preventDefault();
              if (props.activePage > 1) {
                props.onChangePage(props.activePage - 1);
              }
            }}
          />
        </PaginationItem>
        {pages.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              href="#"
              isActive={page === props.activePage}
              className={
                page === props.activePage
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-muted'
              }
              onClick={(event) => {
                event.preventDefault();
                props.onChangePage(page);
              }}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            text="بعدی"
            href="#"
            onClick={(event) => {
              event.preventDefault();
              if (props.activePage < pageCount) {
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
          <label className="text-sm text-muted-foreground" htmlFor="table-limit">
            در صفحه
          </label>
          <select
            id="table-limit"
            className="h-8 rounded-md border border-input bg-background px-2 text-sm"
            value={props.limit}
            onChange={(event) => props.handleChangeLimit(Number(event.target.value))}
          >
            {[1, 5, 10].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
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
