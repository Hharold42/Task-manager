import { request } from '../lib/client';
import type { User } from './types';

export const usersApi = {
  list: () => request<User[]>({ method: 'GET', url: '/users' }),
};
