import axios from 'axios';
import type { AppDispatch, RootState } from '@/store';
import { logout } from '@/store/slices/authSlice';

let _store: { getState: () => RootState; dispatch: AppDispatch } | null = null;
export const injectStore = (s: typeof _store) => { _store = s; };
const getStore = () => {
  if (!_store) throw new Error('Store not injected into axiosInstance');
  return _store;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
}> = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(null);
    }
  });
  failedQueue = [];
};

function isAccessTokenExpired(): boolean {
  try {
    const cookies = document.cookie.split('; ');
    const accessCookie = cookies.find((c) => c.startsWith('access='));
    if (!accessCookie) return false;
    const token = accessCookie.split('=')[1];
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    // Consider expired if less than 30 seconds remaining
    return payload.exp - now < 30;
  } catch {
    return true;
  }
}

async function refreshToken(): Promise<void> {
  await axiosInstance.post('/auth/token/refresh/', {});
}

axiosInstance.interceptors.request.use(
  async (config) => {
    const skipPaths = ['/auth/login/', '/auth/register/', '/auth/google/', '/auth/token/refresh/', '/auth/logout/'];
    if (skipPaths.some((p) => config.url?.includes(p))) return config;

    if (isAccessTokenExpired()) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => config)
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;
      try {
        await refreshToken();
        processQueue(null);
      } catch (refreshError) {
        processQueue(refreshError);
        getStore().dispatch(logout());
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthEndpoint = originalRequest.url?.includes('/auth/');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => axiosInstance(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;
      try {
        await refreshToken();
        processQueue(null);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        getStore().dispatch(logout());
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
