import { ROUTES } from '@/constants/routes';
import { env } from '@/config/env';
import { getCookie, setCookie } from '@/lib/helpers';
import { queryClient } from '@/lib/query-client';
import axios from 'axios';
import routes from './routes';

const ACCESS_TOKEN_COOKIE = 'access-token';
const REFRESH_TOKEN_COOKIE = 'refresh-token';
const ACTIVE_ROLE_COOKIE = 'x-active-role';

/** Paths where we do not attach Bearer (login/register/refresh). */
const skipAccessTokenPaths = new Set([
  routes.REFRESH_TOKEN.URL,
  routes.GOOGLE_AUTH_LOGIN.URL,
  routes.LOGIN.URL,
  routes.ADMIN_LOGIN.URL,
]);

// --- Axios instance ---

const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// --- Refresh state (prevents parallel refresh calls) ---

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve();
  });
  failedQueue = [];
};

const enqueueFailedRequest = () => {
  return new Promise((resolve, reject) => {
    failedQueue.push({ resolve, reject });
  });
};

// --- Helpers ---

const getStoredRole = () => {
  try {
    const stored = getCookie('auth_user');
    return stored ? JSON.parse(stored).role : null;
  } catch {
    return null;
  }
};

const isRefreshRequest = (config) => {
  return config.url === routes.REFRESH_TOKEN.URL;
};

const redirectToLogin = (requestUrl = '') => {
  queryClient.clear();
  const isAdminRequest = requestUrl.startsWith('/api/admin/');
  if (isAdminRequest) {
    document.cookie = 'access-token=; Max-Age=0; path=/';
    document.cookie = 'refresh-token=; Max-Age=0; path=/';
    window.location.href = ROUTES.admin.login;
  } else {
    localStorage.removeItem('auth_user');
    window.location.href = ROUTES.login;
  }
};

const attemptTokenRefresh = async () => {
  const refreshToken = getCookie('refresh-token');
  const response = await apiClient({
    method: routes.REFRESH_TOKEN.METHOD,
    url: routes.REFRESH_TOKEN.URL,
    data: { refreshToken },
  });
  if (response.data.accessToken) {
    setCookie('access-token', response.data.accessToken);
  }
  if (response.data.refreshToken) {
    setCookie('refresh-token', response.data.refreshToken);
  }
  return response;
};

// --- Request interceptor ---

apiClient.interceptors.request.use(
  (config) => {
    const url = config.url ?? '';

    if (url === routes.REFRESH_TOKEN.URL) {
      // Token is sent in JSON body only. A custom header would trigger an extra
      // CORS preflight field (x-refresh-token) that must be allowlisted on the API.
      return config;
    }

    if (skipAccessTokenPaths.has(url)) {
      return config;
    }

    const accessToken = getCookie(ACCESS_TOKEN_COOKIE);
    if (accessToken) {
      config.headers.set('Authorization', `Bearer ${accessToken}`);
    }

    const activeRole = getCookie(ACTIVE_ROLE_COOKIE);
    if (activeRole) {
      config.headers.set('x-active-role', activeRole);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// --- Response interceptor ---

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isUnauthorized = error.response?.status === 401;
    const isAlreadyRetried = originalRequest._retry;
    const isRefreshCall = isRefreshRequest(originalRequest);
    const isAuthEndpoint = skipAccessTokenPaths.has(originalRequest.url);

    // Auth endpoints (login/register) — just reject, don't redirect
    if (isAuthEndpoint) {
      return Promise.reject(error);
    }

    // If refresh itself failed or already retried, bail out
    if (!isUnauthorized || isAlreadyRetried || isRefreshCall) {
      if (isUnauthorized) redirectToLogin(originalRequest.url);
      return Promise.reject(error);
    }

    // If another request is already refreshing, queue this one
    if (isRefreshing) {
      await enqueueFailedRequest();
      return apiClient(originalRequest);
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      await attemptTokenRefresh();
      processQueue(null);
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);
      redirectToLogin(originalRequest.url);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;
