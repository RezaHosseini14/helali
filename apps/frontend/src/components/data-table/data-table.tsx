'use client';

import * as React from 'react';

import {
  useTable,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type PaginationState,
  type RowData,
  type SortingState,
  type Updater,
} from '@tanstack/react-table';
import { Trash2Icon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

import {
  DATA_TABLE_NO_TRUNCATE_COLUMNS,
  getDataTableColumnClass,
} from './data-table-column-class';
import { dataTableFeatures, type DataTableFeatures } from './data-table-features';
import { DataTablePagination } from './data-table-pagination';
import { createDataTableSelectColumn } from './data-table-select-column';

interface IDataTableColumnMeta {
  readonly className?: string;
}

export interface IDataTableBulkActionContext {
  readonly selectedIds: ReadonlyArray<string>;
  readonly clearSelection: () => void;
}

interface IDataTableProps<TData extends RowData> {
  readonly columns: ColumnDef<DataTableFeatures, TData>[];
  readonly data: TData[];
  readonly isLoading?: boolean;
  readonly emptyMessage?: string;
  readonly className?: string;
  /** Server-side pagination: total number of pages from the API. */
  readonly pageCount?: number;
  /** 1-based page index used by Helali list APIs. */
  readonly page?: number;
  readonly pageSize?: number;
  readonly totalItems?: number;
  readonly pageSizeOptions?: ReadonlyArray<number>;
  readonly onPageChange?: (page: number) => void;
  readonly onPageSizeChange?: (pageSize: number) => void;
  readonly toolbar?: React.ReactNode;
  readonly enableRowSelection?: boolean;
  readonly isRowSelectable?: (row: TData) => boolean;
  /** Called with selected row ids when bulk delete is requested. */
  readonly onBulkDelete?: (ids: string[], clearSelection: () => void) => void;
  readonly isBulkDeleting?: boolean;
  /** Extra actions shown in the selection bar (before delete). */
  readonly renderBulkActions?: (context: IDataTableBulkActionContext) => React.ReactNode;
}

function resolveRowId<TData extends RowData>(row: TData, index: number): string {
  if (row && typeof row === 'object' && 'id' in row && row.id != null) {
    return String(row.id);
  }

  return String(index);
}

function getCellTitle(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }

  return undefined;
}

function resolveColumnClassName(column: {
  id: string;
  columnDef: { meta?: unknown };
}): string | undefined {
  const meta = column.columnDef.meta as IDataTableColumnMeta | undefined;
  return getDataTableColumnClass(column.id, meta?.className);
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'موردی یافت نشد.',
  className,
  pageCount,
  page = 1,
  pageSize = 10,
  totalItems,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
  toolbar,
  enableRowSelection = true,
  isRowSelectable,
  onBulkDelete,
  isBulkDeleting = false,
  renderBulkActions,
}: IDataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<ColumnVisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [clientPagination, setClientPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  const isManualPagination = typeof pageCount === 'number' || Boolean(onPageChange);

  const pagination = isManualPagination
    ? { pageIndex: Math.max(0, page - 1), pageSize }
    : clientPagination;

  const tableColumns = React.useMemo(() => {
    if (!enableRowSelection) {
      return columns;
    }

    return [createDataTableSelectColumn<TData>(), ...columns];
  }, [columns, enableRowSelection]);

  function clearSelection(): void {
    setRowSelection({});
  }

  function handlePaginationChange(updater: Updater<PaginationState>): void {
    const next = typeof updater === 'function' ? updater(pagination) : updater;

    if (isManualPagination) {
      if (next.pageSize !== pageSize) {
        clearSelection();
        onPageSizeChange?.(next.pageSize);
      }
      if (next.pageIndex !== pagination.pageIndex) {
        clearSelection();
        onPageChange?.(next.pageIndex + 1);
      }
      return;
    }

    setClientPagination(next);
  }

  const table = useTable({
    features: dataTableFeatures,
    data,
    columns: tableColumns,
    pageCount: isManualPagination ? Math.max(1, pageCount ?? 1) : undefined,
    manualPagination: isManualPagination,
    enableRowSelection: isRowSelectable
      ? (row) => isRowSelectable(row.original)
      : enableRowSelection,
    getRowId: resolveRowId,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: handlePaginationChange,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  });

  const selectedIds = table.getFilteredSelectedRowModel().rows.map((row) => row.id);
  const selectedCount = selectedIds.length;
  const showBulkBar =
    selectedCount > 0 && (Boolean(onBulkDelete) || Boolean(renderBulkActions));

  return (
    <div className={cn('flex min-w-0 flex-col gap-2', className)}>
      {toolbar ? <div className="flex items-center gap-2">{toolbar}</div> : null}

      {showBulkBar ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted/40 px-3 py-2.5">
          <p className="text-sm font-medium text-foreground">
            {selectedCount} مورد انتخاب شده
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isBulkDeleting}
              onClick={clearSelection}
            >
              لغو انتخاب
            </Button>
            {renderBulkActions?.({ selectedIds, clearSelection })}
            {onBulkDelete ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={isBulkDeleting}
                onClick={() => {
                  onBulkDelete(selectedIds, clearSelection);
                }}
              >
                {isBulkDeleting ? <Spinner data-icon="inline-start" /> : <Trash2Icon />}
                حذف انتخاب‌شده‌ها
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="relative min-w-0">
        {isLoading ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/50">
            <Spinner className="size-8 text-primary" />
          </div>
        ) : null}

        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  const columnClassName = resolveColumnClassName(header.column);

                  return (
                    <TableHead
                      key={header.id}
                      className={columnClassName}
                      title={
                        typeof header.column.columnDef.header === 'string'
                          ? header.column.columnDef.header
                          : undefined
                      }
                    >
                      {header.isPlaceholder ? null : (
                        <div className="truncate">
                          <table.FlexRender header={header} />
                        </div>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? 'selected' : undefined}
                >
                  {row.getVisibleCells().map((cell) => {
                    const columnId = cell.column.id;
                    const isCompact = DATA_TABLE_NO_TRUNCATE_COLUMNS.has(columnId);
                    const title = isCompact ? undefined : getCellTitle(cell.getValue());

                    return (
                      <TableCell
                        key={cell.id}
                        className={resolveColumnClassName(cell.column)}
                        title={title}
                      >
                        {isCompact ? (
                          <table.FlexRender cell={cell} />
                        ) : (
                          <div className="truncate *:truncate">
                            <table.FlexRender cell={cell} />
                          </div>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={tableColumns.length}
                  className="h-24 max-w-none text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination
        table={table}
        totalItems={totalItems}
        pageSizeOptions={pageSizeOptions}
      />
    </div>
  );
}
