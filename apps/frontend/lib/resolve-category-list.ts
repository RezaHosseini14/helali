import type { categoryType } from 'types/category.type';

export function resolveCategoryList(payload: unknown): categoryType[] {
  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const data = payload as {
    categories?: categoryType[];
    items?: categoryType[];
  };

  if (Array.isArray(data.categories)) {
    return data.categories;
  }

  if (Array.isArray(data.items)) {
    return data.items;
  }

  return [];
}
