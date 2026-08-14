import { clearAccessToken, setAccessToken } from '@/services/token-store';

import http from '../httpService';

type loginDataType = {
  username: string;
  password: string;
};

export async function login(data: loginDataType) {
  const response = await http.post<{ accessToken?: string }>('/auth/login', data);

  if (response.data?.accessToken) {
    setAccessToken(response.data.accessToken);
  }

  return response;
}

export async function logout() {
  try {
    return await http.post('/auth/logout');
  } finally {
    clearAccessToken();
  }
}

export { registerUser } from '../user/userServices';