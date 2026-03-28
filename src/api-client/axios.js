import axios from "axios";
import { env } from "@/config/env";
import { getCookie, setCookie, removeCookie } from "@/lib/cookies";
import routes from "./routes";

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

const getStoredRole = () => {
  try {
    const stored = getCookie("auth_user");
    return stored ? JSON.parse(stored).role : null;
  } catch {
    return null;
  }
};

const isRefreshRequest = (config) => {
  return config.url === routes.REFRESH_TOKEN.URL;
};

const redirectToLogin = () => {
  removeCookie("auth_user");
  removeCookie("access_token");
  removeCookie("refresh_token");
  window.location.href = "/login";
};

const attemptTokenRefresh = async () => {
  const refreshToken = getCookie("refresh_token");
  const response = await apiClient({
    method: routes.REFRESH_TOKEN.METHOD,
    url: routes.REFRESH_TOKEN.URL,
    data: { refreshToken },
  });
  if (response.data.accessToken) {
    setCookie("access_token", response.data.accessToken);
  }
  if (response.data.refreshToken) {
    setCookie("refresh_token", response.data.refreshToken);
  }
  return response;
};

// --- Request interceptor ---

apiClient.interceptors.request.use(
  (config) => {
    const token = getCookie("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const role = getStoredRole();
    if (role) {
      config.headers["x-active-role"] = role;
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
