import axios from 'axios';

export const axiosJWT = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

axiosJWT.interceptors.request.use(
  async (config) => {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/refreshtoken`, {
      withCredentials: true,
    });

    config.headers.authorization = `Bearer ${res.data.accessToken}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export const jwtHttp = {
  get: axiosJWT.get,
  post: axiosJWT.post,
  delete: axiosJWT.delete,
  put: axiosJWT.put,
  patch: axiosJWT.patch,
};
