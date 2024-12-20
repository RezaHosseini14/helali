import { CategoryFormValue } from '@/components/pages/dashboard/category/CreateCategory.modal';
import http from '../httpService';

// export function allCategory() {
//   return http.get('/category');
// }

export function allCategory(page?: number, limit?: number) {
  const params = new URLSearchParams();

  if (page !== undefined) {
    params.append('page', String(page));
  }

  if (limit !== undefined) {
    params.append('limit', String(limit));
  }

  const queryString = params.toString();
  const url = queryString ? `/category?${queryString}` : '/category';

  return http.get(url);
}

export function deleteCategory(id: number) {
  return http.delete(`/category/${id}`);
}

export function categoryById(id: number) {
  return http.get(`/category/${id}`);
}

export function createCategory(data: CategoryFormValue) {
  return http.post('/category', data);
}

export function updateCategoryById(body: CategoryFormValue, id: number) {
  return http.patch(`/category/${id}`, body);
}
