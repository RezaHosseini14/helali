import http from './httpService';

export const axiosJWT = {
  get: http.get,
  post: http.post,
  delete: http.delete,
  put: http.put,
  patch: http.patch,
};

export const jwtHttp = axiosJWT;
