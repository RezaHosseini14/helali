import { RegisterFormValue } from 'app/(dashboard)/dashboard/user/create/page';
import http from '../httpService';
type loginDataType = {
  username: string;
  password: string;
};
export function login(data: loginDataType) {
  return http.post('/auth/login', data);
}
export function logout() {
  return http.get('/auth/logout');
}
export function verify() {
  return http.get('/auth/verifylogin');
}

export function registerUser(data: RegisterFormValue) {
  return http.post('/auth/register', data);
}
