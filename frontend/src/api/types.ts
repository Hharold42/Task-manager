export interface User {
  id: number;
  email: string;
  createdAt: string;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  createdAt: string;
  authorId: number;
  asigneeId: number;
  author: User;
  asignee: User;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T;
  meta: PaginationMeta;
}

export interface TaskFilters {
  title?: string;
  authorId?: number;
  assigneeId?: number;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: 'createdAt' | 'title';
  order?: 'asc' | 'desc';
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  assigneeId?: number;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  assigneeId?: number;
}
