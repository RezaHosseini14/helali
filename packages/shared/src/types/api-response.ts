export interface IApiResponse<TData> {
  readonly success: true;
  readonly message: string;
  readonly data: TData;
  readonly meta?: Record<string, unknown>;
}

export interface IApiErrorResponse {
  readonly success: false;
  readonly message: string;
  readonly data: {
    readonly errors?: ReadonlyArray<{
      readonly field: string;
      readonly message: string;
    }>;
    readonly retryAfter?: number;
  } | null;
}
