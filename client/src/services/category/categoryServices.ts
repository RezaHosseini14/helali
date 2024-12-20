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
