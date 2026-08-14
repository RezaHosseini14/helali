import axios from 'axios';

import { getApiErrorMessage } from '@/services/get-api-error-message';

describe('getApiErrorMessage', () => {
  it('reads message from axios API envelope', () => {
    const error = new axios.AxiosError(
      'Request failed',
      'ERR_BAD_REQUEST',
      undefined,
      undefined,
      {
        status: 404,
        statusText: 'Not Found',
        headers: {},
        config: {} as never,
        data: { success: false, message: 'ویدیویی یافت نشد', data: null },
      },
    );

    expect(getApiErrorMessage(error)).toBe('ویدیویی یافت نشد');
  });

  it('falls back for unknown errors', () => {
    expect(getApiErrorMessage('boom')).toBe('خطای غیرمنتظره رخ داد');
  });
});
