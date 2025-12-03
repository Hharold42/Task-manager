import { useMemo } from 'react';
import { useAuth } from './useAuth';

export const useUser = () => {
  const { user, loading, isAuthenticated, refreshProfile } = useAuth();

  return useMemo(
    () => ({ user, loading, isAuthenticated, refreshProfile }),
    [user, loading, isAuthenticated, refreshProfile],
  );
};
