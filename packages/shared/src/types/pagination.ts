export interface IPaginatedResponse<TItem> {
  readonly items: ReadonlyArray<TItem>;
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly totalPages: number;
}
