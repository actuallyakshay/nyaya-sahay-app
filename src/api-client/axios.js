import axios from "axios";
import { env } from "@/config/env";
import { getCookie } from "@/lib/helpers";
import { queryClient } from "@/lib/query-client";
import routes from "./routes";

const ACCESS_TOKEN_COOKIE = "access-token";
const REFRESH_TOKEN_COOKIE = "refresh-token";

/** Paths where we do not attach Bearer (login/register/refresh). */
const skipAccessTokenPaths = new Set([
  routes.REFRESH_TOKEN.URL,
  routes.GOOGLE_AUTH_LOGIN.URL,
  routes.LOGIN.URL,
]);

// --- Axios instance ---

const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
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

const redirectToLogin = () => {
  queryClient.clear();
  localStorage.removeItem("auth_user");
  window.location.href = "/login";
};

const attemptTokenRefresh = async () => {
  return apiClient({
    method: routes.REFRESH_TOKEN.METHOD,
    url: routes.REFRESH_TOKEN.URL,
  });
};

// --- Request interceptor ---

apiClient.interceptors.request.use(
  (config) => {
    const url = config.url ?? "";

    if (url === routes.REFRESH_TOKEN.URL) {
      const refreshToken = getCookie(REFRESH_TOKEN_COOKIE);
      if (refreshToken) {
        config.headers.set("X-Refresh-Token", refreshToken);
      }
      return config;
    }

    if (skipAccessTokenPaths.has(url)) {
      return config;
    }

    const accessToken = getCookie(ACCESS_TOKEN_COOKIE);
    if (accessToken) {
      config.headers.set("Authorization", `Bearer ${accessToken}`);
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// --- Response interceptor ---

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isUnauthorized = error.response?.status === 401;
    const isAlreadyRetried = originalRequest._retry;
    const isRefreshCall = isRefreshRequest(originalRequest);

    // If refresh itself failed or already retried, bail out
    if (!isUnauthorized || isAlreadyRetried || isRefreshCall) {
      if (isUnauthorized) redirectToLogin();
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
      redirectToLogin();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default apiClient;
