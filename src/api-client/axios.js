import axios from "axios";
import { env } from "@/config/env";
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

const isRefreshRequest = (config) => {
  return config.url === routes.REFRESH_TOKEN.URL;
};

const redirectToLogin = () => {
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
  (config) => config,
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
