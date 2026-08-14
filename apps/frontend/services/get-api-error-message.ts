import axios from 'axios';

import type { IApiErrorResponse } from '@helali/shared';

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<IApiErrorResponse>(error)) {
    const message = error.response?.data?.message;

    if (typeof message === 'string' && message.length > 0) {
      return message;
    }

    return error.message || 'خطای غیرمنتظره رخ داد';
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'خطای غیرمنتظره رخ داد';
}
