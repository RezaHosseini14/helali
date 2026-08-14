import axios from 'axios';

import type { IApiResponse } from '@helali/shared';

import { getApiBaseUrl } from '@/services/api-base-url';
import { clearAccessToken, getAccessToken, setAccessToken } from '@/services/token-store';

let sessionBootstrapPromise: Promise<boolean> | null = null;
let refreshPromise: Promise<string> | null = null;

/**
 * Single-flight access-token refresh to avoid refresh-token rotation races.
 * Uses a bare axios call so it never re-enters the apiClient interceptor.
 */
export function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const token = getAccessToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await axios.post<IApiResponse<{ accessToken: string }>>(
        `${getApiBaseUrl()}/auth/refresh`,
        {},
        {
          withCredentials: true,
          headers,
        },
      );

      const accessToken = response.data.data.accessToken;
      setAccessToken(accessToken);
      return accessToken;
    })()
      .catch((error: unknown) => {
        clearAccessToken();
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

/**
 * Restore session once per page load when only the refresh cookie exists.
 */
export function bootstrapSession(): Promise<boolean> {
  if (getAccessToken()) {
    return Promise.resolve(true);
  }

  if (!sessionBootstrapPromise) {
    sessionBootstrapPromise = refreshAccessToken()
      .then(() => true)
      .catch(() => false);
  }

  return sessionBootstrapPromise;
}
