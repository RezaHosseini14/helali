import type { AxiosResponse } from 'axios';

import { apiClient } from '@/services/api-client';
import { bootstrapSession } from '@/services/session';

type ApiEnvelope<TData> = {
  success?: boolean;
  message?: string;
  data?: TData;
};

export type LegacyHttpResponse<T = any> = Omit<AxiosResponse, 'data'> & {
  data: T & { message?: string };
};

function normalizeEntity(entity: Record<string, unknown>): Record<string, unknown> {
  if (!entity || typeof entity !== 'object') {
    return entity;
  }

  return {
    ...entity,
    created_at: entity.created_at ?? entity.createdAt,
    updated_at: entity.updated_at ?? entity.updatedAt,
  };
}

function normalizePayload(data: unknown): unknown {
  if (Array.isArray(data)) {
    return data.map((item) => normalizeEntity(item as Record<string, unknown>));
  }

  if (!data || typeof data !== 'object') {
    return data;
  }

  const payload = data as Record<string, unknown>;

  if (Array.isArray(payload.audios)) {
    return {
      ...payload,
      audios: payload.audios.map((item) => normalizeEntity(item as Record<string, unknown>)),
    };
  }

  if (Array.isArray(payload.videos)) {
    return {
      ...payload,
      videos: payload.videos.map((item) => normalizeEntity(item as Record<string, unknown>)),
    };
  }

  if (Array.isArray(payload.images)) {
    return {
      ...payload,
      images: payload.images.map((item) => normalizeEntity(item as Record<string, unknown>)),
    };
  }

  if (Array.isArray(payload.comments)) {
    return {
      ...payload,
      comments: payload.comments.map((item) => normalizeEntity(item as Record<string, unknown>)),
      total:
        typeof payload.total === 'number'
          ? payload.total
          : (payload.comments as unknown[]).length,
    };
  }

  if (Array.isArray(payload.users)) {
    return {
      ...payload,
      users: payload.users.map((item) => normalizeEntity(item as Record<string, unknown>)),
    };
  }

  if (payload.audio && typeof payload.audio === 'object') {
    return {
      ...payload,
      audio: normalizeEntity(payload.audio as Record<string, unknown>),
    };
  }

  if (payload.video && typeof payload.video === 'object') {
    return {
      ...payload,
      video: normalizeEntity(payload.video as Record<string, unknown>),
    };
  }

  if (Array.isArray(payload.items) && typeof payload.total === 'number') {
    const items = payload.items.map((item) => normalizeEntity(item as Record<string, unknown>));
    const first = items[0] as Record<string, unknown> | undefined;

    if (first && 'sort' in first && 'title' in first) {
      return {
        categories: items,
        total: payload.total,
        currentPage: payload.page,
        totalPages: payload.totalPages,
      };
    }

    if (first && 'username' in first) {
      return {
        users: items,
        total: payload.total,
        currentPage: payload.page,
        totalPages: payload.totalPages,
      };
    }
  }

  if (Array.isArray(payload.stories)) {
    return {
      ...payload,
      stories: payload.stories.map((item) => normalizeEntity(item as Record<string, unknown>)),
    };
  }

  return payload;
}

function toLegacyResponse<T = any>(
  response: AxiosResponse<ApiEnvelope<T>>,
): LegacyHttpResponse<T> {
  const envelope = response.data;
  const payload = normalizePayload(envelope?.data ?? envelope);
  const normalizedPayload =
    payload && typeof payload === 'object' && !Array.isArray(payload) ? payload : {};

  return {
    ...response,
    data: {
      ...(normalizedPayload as T),
      message: envelope?.message,
    },
  };
}

async function request<T = any>(
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  url: string,
  body?: unknown,
  config?: Record<string, unknown>,
): Promise<LegacyHttpResponse<T>> {
  // Public GETs must not wait on anonymous refresh round-trips.
  if (method !== 'get') {
    await bootstrapSession();
  } else {
    void bootstrapSession();
  }

  const response =
    method === 'get' || method === 'delete'
      ? await apiClient[method]<ApiEnvelope<T>>(url, config as never)
      : await apiClient[method]<ApiEnvelope<T>>(url, body, config as never);

  return toLegacyResponse(response);
}

const http = {
  get: <T = any>(url: string, config?: Record<string, unknown>) =>
    request<T>('get', url, undefined, config),
  post: <T = any>(url: string, body?: unknown, config?: Record<string, unknown>) =>
    request<T>('post', url, body, config),
  put: <T = any>(url: string, body?: unknown, config?: Record<string, unknown>) =>
    request<T>('put', url, body, config),
  patch: <T = any>(url: string, body?: unknown, config?: Record<string, unknown>) =>
    request<T>('patch', url, body, config),
  delete: <T = any>(url: string, config?: Record<string, unknown>) =>
    request<T>('delete', url, undefined, config),
};

export default http;
