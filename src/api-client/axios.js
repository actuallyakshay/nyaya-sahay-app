import { env } from '@/config/env';
import { ROUTES } from '@/constants/routes';
import { clearFcmTokenRegistrationCache } from '@/lib/fcm-token-registration-cache';
import { clearAccessToken, setAccessToken } from '@/lib/auth-token';
import { getCookie, resetCookies } from '@/lib/helpers';
import { queryClient } from '@/lib/query-client';
import axios from 'axios';
import routes from './routes';

const ACTIVE_ROLE_COOKIE = 'x-active-role';

/** Paths where we do not attach Bearer (login/register/refresh). */
const skipAccessTokenPaths = new Set([
  routes.REFRESH_TOKEN.URL,
  routes.GOOGLE_AUTH_LOGIN.URL,
  routes.LOGIN.URL,
  routes.ADMIN_LOGIN.URL,
  routes.ADMIN_LOGIN_VERIFY_OTP.URL,
  routes.ADMIN_LOGIN_RESEND_OTP.URL,
]);

// --- Axios instance ---

const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeoutMs,
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

const isRefreshRequest = (config) => {
  return config.url === routes.REFRESH_TOKEN.URL;
};

const redirectToLogin = async (requestUrl = '') => {
  queryClient.clear();
  const isAdminRequest = requestUrl.startsWith('/api/admin/');

  try {
    await fetch(`${env.apiBaseUrl}${routes.LOGOUT.URL}`, {
      method: routes.LOGOUT.METHOD,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    /* ignore — still clear client-visible session hints */
  }
  clearAccessToken();
  resetCookies();
  localStorage.removeItem('auth_user');
  clearFcmTokenRegistrationCache();

  window.location.href = isAdminRequest ? ROUTES.admin.login : ROUTES.login;
};

const attemptTokenRefresh = async () => {
  return apiClient({
    method: routes.REFRESH_TOKEN.METHOD,
    url: routes.REFRESH_TOKEN.URL,
    data: {},
  });
};

// --- Request interceptor ---

apiClient.interceptors.request.use(
  (config) => {
    const url = config.url ?? '';

    if (url === routes.REFRESH_TOKEN.URL) {
      // Refresh token is HttpOnly; sent as Cookie. Body is {}.
      return config;
    }

    if (skipAccessTokenPaths.has(url)) {
      return config;
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
  (response) => {
    if (typeof response.data?.accessToken === 'string') {
      setAccessToken(response.data.accessToken);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest?.url) {
      return Promise.reject(error);
    }

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
      if (isUnauthorized) await redirectToLogin(originalRequest.url);
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
      // Clear flag before waking the queue so retries do not see isRefreshing === true.
      isRefreshing = false;
      processQueue(null);
      return apiClient(originalRequest);
    } catch (refreshError) {
      isRefreshing = false;
      processQueue(refreshError);
      await redirectToLogin(originalRequest.url);
      return Promise.reject(refreshError);
    }
  }
);

export default apiClient;
