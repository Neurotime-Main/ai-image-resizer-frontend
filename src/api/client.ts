import axios from 'axios';

export const TOKEN_KEY = 'bannerai_token';
export const USER_KEY = 'bannerai_user';

/** Backend origin from the build-time env; empty means same origin. */
export const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');

/**
 * Resolves a backend-relative asset path (e.g. /uploads/results/x.png)
 * against the API origin. Absolute, blob: and data: URLs pass through.
 */
export function assetUrl(path: string): string {
  if (!path || /^(https?:|blob:|data:)/.test(path)) return path;
  return `${API_URL}${path}`;
}

const client = axios.create({ baseURL: `${API_URL}/api` });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url: string = error?.config?.url ?? '';
    // Expired/invalid session anywhere outside the auth endpoints -> force re-login.
    if (status === 401 && !url.includes('/auth/login') && !url.includes('/auth/register')) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  }
);

export function extractErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: string } | undefined)?.message;
    if (message) return message;
    if (error.code === 'ERR_NETWORK') return 'Cannot reach the server. Is the backend running?';
    return error.message;
  }
  return fallback;
}

export function isRequestCancelled(error: unknown): boolean {
  return axios.isCancel(error) || (error instanceof DOMException && error.name === 'AbortError');
}

export default client;
