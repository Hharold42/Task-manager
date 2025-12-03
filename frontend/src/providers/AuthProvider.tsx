import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authApi } from '../api/auth';
import type { User } from '../api/types';
import { getStoredAuthToken, setClientAuthToken } from '../lib/client';
import { AuthContext, type AuthContextValue } from './auth-context';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => getStoredAuthToken());
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(token));

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    setClientAuthToken(token);

    authApi
      .profile()
      .then((profile) => {
        if (!cancelled) {
          setUser(profile);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setToken(null);
          setUser(null);
          setClientAuthToken(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = useCallback<AuthContextValue['login']>(async (payload) => {
    const { accessToken, user } = await authApi.login(payload);
    setClientAuthToken(accessToken);
    setToken(accessToken);
    setUser(user);
    return user;
  }, []);

  const register = useCallback<AuthContextValue['register']>(
    async (payload) => {
      await authApi.register(payload);
      return login({ email: payload.email, password: payload.password });
    },
    [login],
  );

  const logout = useCallback<AuthContextValue['logout']>(() => {
    setToken(null);
    setUser(null);
    setClientAuthToken(null);
    setLoading(false);
  }, []);

  const refreshProfile = useCallback<AuthContextValue['refreshProfile']>(async () => {
    if (!token) return null;
    const profile = await authApi.profile();
    setUser(profile);
    return profile;
  }, [token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user && token),
      login,
      register,
      logout,
      refreshProfile,
    }),
    [user, token, loading, login, register, logout, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
