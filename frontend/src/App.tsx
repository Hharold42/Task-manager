import {
  Button,
  DatePicker,
  Flex,
  Form,
  Input,
  Modal,
  Pagination,
  Select,
  Spin,
  message,
} from 'antd';
import { Dayjs } from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import styles from './App.module.scss';
import useModalManager from './hooks/useModal';
import { useAuth } from './hooks/useAuth';
import { useUser } from './hooks/useUser';
import { useTasks } from './hooks/useTasks';
import { useAssignableUsers } from './hooks/useAssignableUsers';
import type { Task } from './api/types';
import { CreateTaskForm, LoginForm, RegisterForm } from './components/Modals';
import { TaskChip } from './components/Task';

const getInitialPage = () => {
  if (typeof window === 'undefined') return 1;
  const params = new URLSearchParams(window.location.search);
  const pageFromQuery = Number(params.get('page'));
  return Number.isFinite(pageFromQuery) && pageFromQuery > 0
    ? Math.floor(pageFromQuery)
    : 1;
};

function App() {
  const { modal, open, close, isOpen } = useModalManager();
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const { login, register, logout, loading } = useAuth();
  const {
    user,
    loading: userLoading,
    isAuthenticated,
    refreshProfile,
  } = useUser();
  const initialPage = getInitialPage();
  const [filters, setFilters] = useState({
    title: '',
    authorId: undefined as number | undefined,
    assigneeId: undefined as number | undefined,
    dateRange: null as [Dayjs | null, Dayjs | null] | null,
    sortBy: 'createdAt' as 'createdAt' | 'title',
    order: 'desc' as 'asc' | 'desc',
  });
  const taskFilters = useMemo(
    () => ({
      title: filters.title || undefined,
      authorId: filters.authorId,
      assigneeId: filters.assigneeId,
      dateFrom: filters.dateRange?.[0]?.toDate(),
      dateTo: filters.dateRange?.[1]?.toDate(),
      sortBy: filters.sortBy,
      order: filters.order,
    }),
    [filters],
  );

  const {
    tasks,
    loading: loadingTasks,
    pagination,
    createTask,
    updateTask,
  } = useTasks({
    autoFetch: true,
    enabled: true,
    initialLimit: 12,
    initialPage,
    filters: taskFilters,
  });
  const { page, limit, total, setPage, setLimit } = pagination;
  const {
    users: assignableUsersRaw,
    loading: loadingAssignableUsers,
  } = useAssignableUsers(isAuthenticated);
  const assignableUsers = useMemo(
    () => assignableUsersRaw.filter((u) => u.id !== user?.id),
    [assignableUsersRaw, user?.id],
  );
  const [submitting, setSubmitting] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const onModalClose = () => {
    form.resetFields();
    close();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      let shouldRefreshProfile = false;

      if (modal === 'login') {
        await login({ email: values.email, password: values.password });
        messageApi.success('Вы успешно вошли');
        shouldRefreshProfile = true;
      }

      if (modal === 'register') {
        await register({ email: values.email, password: values.password });
        messageApi.success('Регистрация завершена');
        shouldRefreshProfile = true;
      }

      if (modal === 'task') {
        await createTask({
          title: values.title,
          description: values.description,
          assigneeId: values.assigneeId ?? undefined,
        });
        messageApi.success('Задача создана');
      }

      if (shouldRefreshProfile) {
        await refreshProfile();
      }
      onModalClose();
    } catch (error) {
      if (!(error as { errorFields?: unknown }).errorFields) {
        messageApi.error(
          error instanceof Error ? error.message : 'Что-то пошло не так',
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (editingTask) {
      editForm.setFieldsValue({
        title: editingTask.title,
        description: editingTask.description,
        assigneeId: editingTask.asigneeId ?? editingTask.asignee?.id,
      });
    } else {
      editForm.resetFields();
    }
  }, [editingTask, editForm]);

  const handleEditSubmit = async () => {
    if (!editingTask) return;
    try {
      const values = await editForm.validateFields();
      setEditSubmitting(true);
      await updateTask(editingTask.id, {
        title: values.title,
        description: values.description,
        assigneeId: values.assigneeId ?? undefined,
      });
      messageApi.success('Задача обновлена');
      setEditingTask(null);
    } catch (error) {
      if (!(error as { errorFields?: unknown }).errorFields) {
        messageApi.error(
          error instanceof Error ? error.message : 'Не удалось обновить задачу',
        );
      }
    } finally {
      setEditSubmitting(false);
    }
  };

  const tasksFormatted = useMemo(() => {
    if (!tasks.length) return [] as Task[][];

    return tasks.reduce<Task[][]>((acc, task) => {
      let currentRow = acc.at(-1);

      if (!currentRow || currentRow.length === 4) {
        currentRow = [task];
        acc.push(currentRow);
      } else {
        currentRow.push(task);
      }

      return acc;
    }, []);
  }, [tasks]);

  const handlePaginationChange = (nextPage: number, nextSize?: number) => {
    if (nextSize && nextSize !== limit) {
      setLimit(nextSize);
      setPage(1);
      return;
    }
    setPage(nextPage);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (page > 1) {
      url.searchParams.set('page', String(page));
    } else {
      url.searchParams.delete('page');
    }
    window.history.replaceState(null, '', `${url.pathname}${url.search}`);
  }, [page]);

  return (
    <Flex className={styles.root}>
      {contextHolder}
      <Flex className={styles.header}>
        <div>Задачки</div>
        <Flex className={styles.header__nav}>
          {isAuthenticated ? (
            <>
              <div>Привет, {user?.email}</div>
              <Button loading={loading || userLoading} onClick={logout}>
                Выйти
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => open('login')}>Войти</Button>
              <Button type="primary" onClick={() => open('register')}>
                Зарегистрироваться
              </Button>
            </>
          )}
        </Flex>
      </Flex>

      <Flex className={styles.content} vertical gap={16}>
        {isAuthenticated && (
          <Flex className={styles.filters} gap={12} wrap="wrap">
            <Input
              placeholder="Название"
              value={filters.title}
              onChange={(e) => setFilters((prev) => ({ ...prev, title: e.target.value }))}
              allowClear
              style={{ width: 200 }}
            />
            <Select
              placeholder="Автор"
              allowClear
              value={filters.authorId}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, authorId: value ?? undefined }))
              }
              options={assignableUsersRaw.map((u) => ({ label: u.email, value: u.id }))}
              style={{ width: 200 }}
              loading={loadingAssignableUsers}
            />
            <Select
              placeholder="Исполнитель"
              allowClear
              value={filters.assigneeId}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, assigneeId: value ?? undefined }))
              }
              options={assignableUsersRaw.map((u) => ({ label: u.email, value: u.id }))}
              style={{ width: 200 }}
              loading={loadingAssignableUsers}
            />
            <DatePicker.RangePicker
              value={filters.dateRange ?? undefined}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, dateRange: value ?? null }))
              }
              allowEmpty={[true, true]}
            />
            <Select
              value={filters.sortBy}
              onChange={(value) => setFilters((prev) => ({ ...prev, sortBy: value }))}
              options={[
                { label: 'По дате', value: 'createdAt' },
                { label: 'По названию', value: 'title' },
              ]}
            />
            <Select
              value={filters.order}
              onChange={(value) => setFilters((prev) => ({ ...prev, order: value }))}
              options={[
                { label: 'По убыванию', value: 'desc' },
                { label: 'По возрастанию', value: 'asc' },
              ]}
            />

            <Button type="primary" size="large" onClick={() => open('task')} disabled={!isAuthenticated}>
              Создать задачу
            </Button>
          </Flex>
        )}
        {loadingTasks ? (
          <Flex justify="center" align="center" className={styles.loaderWrapper}>
            <Spin size="large" />
          </Flex>
        ) : tasksFormatted.length ? (
          <>
            {tasksFormatted.map((row, rowIndex) => (
              <Flex key={`task-row-${rowIndex}`} gap={16}>
                {row.map((task) => (
                  <TaskChip
                    key={task.id}
                    id={task.id}
                    title={task.title}
                    description={task.description}
                    authorEmail={task.author.email}
                    assigneeEmail={task.asignee.email}
                    createdAt={task.createdAt}
                    canEdit={isAuthenticated && user?.id === task.author.id}
                    onEdit={() => setEditingTask(task)}
                  />
                ))}
              </Flex>
            ))}
            {total > limit && (
              <div className={styles.paginationBar}>
                <Pagination
                  current={page}
                  total={total}
                  pageSize={limit}
                  showSizeChanger={false}
                  onChange={handlePaginationChange}
                  disabled={loadingTasks}
                />
              </div>
            )}
          </>
        ) : (
          <Flex className={styles.emptyState} align="center" justify="center">
            Задач пока нет
          </Flex>
        )}
      </Flex>

      <Modal
        open={isOpen}
        confirmLoading={submitting}
        onCancel={onModalClose}
        onOk={handleSubmit}
      >
        {modal === 'login' && <LoginForm form={form} />}
        {modal === 'register' && <RegisterForm form={form} />}
        {modal === 'task' && (
          <CreateTaskForm
            form={form}
            users={assignableUsers}
            loadingUsers={loadingAssignableUsers}
          />
        )}
      </Modal>

      <Modal
        open={Boolean(editingTask)}
        confirmLoading={editSubmitting}
        onCancel={() => setEditingTask(null)}
        onOk={handleEditSubmit}
        title="Редактировать задачу"
      >
        {editingTask && (
          <CreateTaskForm
            form={editForm}
            users={assignableUsers}
            loadingUsers={loadingAssignableUsers}
          />
        )}
      </Modal>
    </Flex>
  );
}

export default App;
