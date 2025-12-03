import { request } from '../lib/client';
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  User,
} from './types';

export const authApi = {
  login: (payload: LoginPayload) =>
    request<AuthResponse>({ method: 'POST', url: '/auth/login', data: payload }),
  register: (payload: RegisterPayload) =>
    request<User>({ method: 'POST', url: '/auth/register', data: payload }),
  profile: () => request<User>({ method: 'GET', url: '/users/me' }),
};
