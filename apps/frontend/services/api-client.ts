import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

import type { IApiErrorResponse, IApiResponse } from '@helali/shared';

import { getApiBaseUrl } from '@/services/api-base-url';
import { getApiErrorMessage } from '@/services/get-api-error-message';
import { refreshAccessToken } from '@/services/session';
import { clearAccessToken, getAccessToken } from '@/services/token-store';

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  return config;
});

let hasRedirectedToLogin = false;

function redirectToLogin(): void {
  if (typeof window === 'undefined' || hasRedirectedToLogin) {
    return;
  }

  if (window.location.pathname.includes('/login')) {
    return;
  }

  hasRedirectedToLogin = true;
  window.location.replace('/login');
}

apiClient.interceptors.response.use((response) => response, async (error: AxiosError<IApiErrorResponse>) => {
  const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

  if (
    error.response?.status === 401 &&
    originalRequest &&
    !originalRequest._retry &&
    !originalRequest.url?.includes('/auth/login') &&
    !originalRequest.url?.includes('/auth/refresh')
  ) {
    originalRequest._retry = true;

    try {
      const newToken = await refreshAccessToken();
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      clearAccessToken();
      redirectToLogin();
      return Promise.reject(refreshError);
    }
  }

  return Promise.reject(error);
});

export async function unwrapApiResponse<TData>(promise: Promise<{ data: IApiResponse<TData> }>): Promise<TData> {
  const response = await promise;
  return response.data.data;
}

export { getApiErrorMessage };
