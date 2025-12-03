import { request } from '../lib/client';
import type {
  CreateTaskPayload,
  PaginatedResponse,
  Task,
  TaskFilters,
  UpdateTaskPayload,
} from './types';

export const tasksApi = {
  list: (params?: {
    page?: number;
    limit?: number;
  } & TaskFilters) =>
    request<PaginatedResponse<Task[]>>({
      method: 'GET',
      url: '/tasks',
      params,
    }),
  create: (payload: CreateTaskPayload) =>
    request<Task>({ method: 'POST', url: '/tasks', data: payload }),
  update: (id: number, payload: UpdateTaskPayload) =>
    request<Task>({ method: 'PATCH', url: `/tasks/${id}`, data: payload }),
  remove: (id: number) =>
    request<void>({ method: 'DELETE', url: `/tasks/${id}` }),
};
