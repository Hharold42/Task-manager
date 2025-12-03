import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { tasksApi } from '../api/tasks';
import type {
  CreateTaskPayload,
  Task,
  UpdateTaskPayload,
} from '../api/types';

interface UseTasksOptions {
  autoFetch?: boolean;
  initialPage?: number;
  initialLimit?: number;
  enabled?: boolean;
  filters?: Partial<{
    title: string;
    authorId: number;
    assigneeId: number;
    dateFrom: Date;
    dateTo: Date;
    sortBy: 'createdAt' | 'title';
    order: 'asc' | 'desc';
  }>;
}

interface PaginationControls {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  setPage: (value: number) => void;
  setLimit: (value: number) => void;
  nextPage: () => void;
  prevPage: () => void;
}

interface UseTasksResult {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createTask: (payload: CreateTaskPayload) => Promise<Task>;
  updateTask: (id: number, payload: UpdateTaskPayload) => Promise<Task>;
  removeTask: (id: number) => Promise<void>;
  pagination: PaginationControls;
}

export const useTasks = (options: UseTasksOptions = {}): UseTasksResult => {
  const {
    autoFetch = true,
    initialPage = 1,
    initialLimit = 9,
    enabled = true,
    filters,
  } = options;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const pageRef = useRef(page);
  const limitRef = useRef(limit);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  useEffect(() => {
    limitRef.current = limit;
  }, [limit]);

  const normalizedFilters = useMemo(() => {
    if (!filters) return undefined;
    const cleaned: Record<string, unknown> = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        cleaned[key] = value;
      }
    });
    return cleaned;
  }, [filters]);

  const fetchTasks = useCallback(
    async (params?: { page?: number; limit?: number }) => {
      if (!enabled) {
        setTasks([]);
        return;
      }

      const targetPage = params?.page ?? pageRef.current;
      const targetLimit = params?.limit ?? limitRef.current;

      setLoading(true);
      setError(null);

      try {
        const response = await tasksApi.list({
          page: targetPage,
          limit: targetLimit,
          ...(normalizedFilters ?? {}),
        });

        setTasks(response.data);
        setPage((prev) =>
          prev === response.meta.page ? prev : response.meta.page,
        );
        setLimit((prev) =>
          prev === response.meta.limit ? prev : response.meta.limit,
        );
        setTotal(response.meta.total);
        setTotalPages(response.meta.totalPages);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Не удалось загрузить задачи',
        );
      } finally {
        setLoading(false);
      }
    },
    [enabled, normalizedFilters],
  );

  useEffect(() => {
    if (!enabled) {
      setTasks([]);
      setTotal(0);
      setTotalPages(0);
      return;
    }

    if (autoFetch) {
      void fetchTasks({ page, limit });
    }
  }, [enabled, autoFetch, fetchTasks, page, limit]);

  const refresh = useCallback(() => fetchTasks(), [fetchTasks]);

  const createTask = useCallback(
    async (payload: CreateTaskPayload) => {
      const created = await tasksApi.create(payload);
      await fetchTasks({ page: 1, limit: limitRef.current });
      setPage(1);
      return created;
    },
    [fetchTasks],
  );

  const updateTask = useCallback(
    async (id: number, payload: UpdateTaskPayload) => {
      const updated = await tasksApi.update(id, payload);
      await fetchTasks({ page: pageRef.current, limit: limitRef.current });
      return updated;
    },
    [fetchTasks],
  );

  const removeTask = useCallback(
    async (id: number) => {
      await tasksApi.remove(id);
      await fetchTasks({ page: pageRef.current, limit: limitRef.current });
    },
    [fetchTasks],
  );

  const pagination = useMemo<PaginationControls>(
    () => ({
      page,
      limit,
      total,
      totalPages,
      hasNext: totalPages > 0 && page < totalPages,
      hasPrevious: page > 1,
      setPage,
      setLimit,
      nextPage: () =>
        setPage((prev) => (totalPages ? Math.min(prev + 1, totalPages) : prev)),
      prevPage: () => setPage((prev) => Math.max(prev - 1, 1)),
    }),
    [page, limit, total, totalPages],
  );

  return useMemo(
    () => ({
      tasks,
      loading,
      error,
      refresh,
      createTask,
      updateTask,
      removeTask,
      pagination,
    }),
    [tasks, loading, error, refresh, createTask, updateTask, removeTask, pagination],
  );
};
