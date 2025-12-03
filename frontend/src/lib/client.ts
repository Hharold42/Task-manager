import axios, { type AxiosRequestConfig } from 'axios';

export const AUTH_TOKEN_STORAGE_KEY = 'auth_token';

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

const client = axios.create({
  baseURL: apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
});

let authToken: string | null =
  typeof window === 'undefined'
    ? null
    : window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);

client.interceptors.request.use((config) => {
  if (authToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

export const setClientAuthToken = (token?: string | null) => {
  authToken = token ?? null;
  if (typeof window === 'undefined') return;
  if (authToken) {
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, authToken);
  } else {
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  }
};

export const getStoredAuthToken = () => authToken;

export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await client.request<T>(config);
  return response.data;
}

export default client;
