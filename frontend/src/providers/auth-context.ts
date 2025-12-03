import { createContext } from 'react';
import type {
  LoginPayload,
  RegisterPayload,
  User,
} from '../api/types';

export interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => void;
  refreshProfile: () => Promise<User | null>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);
