/**
 * Fixed widths for compact / numeric columns.
 * Unlisted columns share remaining space under `table-fixed`.
 * `max-w-none` overrides the default `max-w-0` on TableHead/TableCell.
 *
 * Media tables: `size` + `mimetype` must use shared `FileSizeBadge` / `FileTypeBadge`
 * from `@/components/data-table` (or `@/components/global/file-*-badge`).
 */
export const DATA_TABLE_COLUMN_CLASS: Readonly<Record<string, string>> = {
  select: 'w-10 max-w-none overflow-hidden px-1.5',
  id: 'w-12 max-w-none overflow-hidden px-1.5',
  actions: 'w-28 max-w-none overflow-hidden px-1',
  like: 'w-14 max-w-none overflow-hidden px-1.5 max-lg:hidden',
  view: 'w-14 max-w-none overflow-hidden px-1.5 max-lg:hidden',
  size: 'w-[8.5rem] max-w-none overflow-hidden px-1.5',
  age: 'w-12 max-w-none overflow-hidden px-1.5',
  sort: 'w-16 max-w-none overflow-hidden px-1.5',
  type: 'w-16 max-w-none overflow-hidden px-1.5',
  mimetype: 'w-[5.5rem] max-w-none overflow-hidden px-1.5 max-md:hidden',
  status: 'w-28 max-w-none overflow-hidden px-1.5',
  created_at: 'w-[5.5rem] max-w-none overflow-hidden px-1.5',
  updated_at: 'w-[5.5rem] max-w-none overflow-hidden px-1.5 max-xl:hidden',
  phone_number: 'w-28 max-w-none overflow-hidden px-1.5 max-md:hidden',
  email: 'overflow-hidden max-lg:hidden',
  last_name: 'overflow-hidden max-md:hidden',
};

/** Columns that must not wrap content in the truncate shell (controls / badges). */
export const DATA_TABLE_NO_TRUNCATE_COLUMNS: ReadonlySet<string> = new Set([
  'select',
  'id',
  'actions',
  'like',
  'view',
  'size',
  'age',
  'sort',
  'type',
  'mimetype',
  'status',
]);

export function getDataTableColumnClass(
  columnId: string,
  metaClassName?: string,
): string | undefined {
  return [DATA_TABLE_COLUMN_CLASS[columnId], metaClassName].filter(Boolean).join(' ') || undefined;
}
