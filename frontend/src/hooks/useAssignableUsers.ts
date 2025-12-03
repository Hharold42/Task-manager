import { useEffect, useState } from 'react';
import { usersApi } from '../api/users';
import type { User } from '../api/types';

export const useAssignableUsers = (enabled: boolean) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!enabled) {
        if (!cancelled) {
          setUsers([]);
          setError(null);
        }
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await usersApi.list();
        if (!cancelled) {
          setUsers(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Не удалось загрузить пользователей',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { users, loading, error };
};
