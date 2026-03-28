import apiClient from './axios';
import routes from './routes';

export const googleAuthLogin = (body) => {
  return apiClient({
    method: routes.GOOGLE_AUTH_LOGIN.METHOD,
    url: routes.GOOGLE_AUTH_LOGIN.URL,
    data: body,
  });
};

export const login = (body) => {
  return apiClient({
    method: routes.LOGIN.METHOD,
    url: routes.LOGIN.URL,
    data: body,
  });
};

export const refreshAuthToken = () => {
  return apiClient({
    method: routes.REFRESH_TOKEN.METHOD,
    url: routes.REFRESH_TOKEN.URL,
  });
};

export const logout = () => {
  return apiClient({
    method: routes.LOGOUT.METHOD,
    url: routes.LOGOUT.URL,
  });
};

export const register = (body) => {
  return apiClient({
    method: routes.REGISTER.METHOD,
    url: routes.REGISTER.URL,
    data: body,
  });
};

export const getCurrentUser = () => {
  return apiClient({
    method: routes.USERS_ME.METHOD,
    url: routes.USERS_ME.URL,
  });
};

export const getCasesCategories = () => {
  return apiClient({
    method: routes.CATEGORIES.METHOD,
    url: routes.CATEGORIES.URL,
  });
};

export const createCase = (body) => {
  return apiClient({
    method: routes.CREATE_CASE.METHOD,
    url: routes.CREATE_CASE.URL,
    data: body,
  });
};

export const uploadAsset = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient({
    method: routes.UPLOAD_ASSET.METHOD,
    url: routes.UPLOAD_ASSET.URL,
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getCases = (params) => {
  return apiClient({
    method: routes.GET_CASES.METHOD,
    url: routes.GET_CASES.URL,
    params,
  });
};

export const getUserRole = () => {
  return apiClient({
    method: routes.CHECK_ROLE.METHOD,
    url: routes.CHECK_ROLE.URL,
  });
};

export const getUserAnalytics = () => {
  return apiClient({
    method: routes.USER_ANALYTICS.METHOD,
    url: routes.USER_ANALYTICS.URL,
  });
};

export const getCaseDetails = (params) => {
  return apiClient({
    method: routes.CASE_DETAILS.METHOD,
    url: routes.CASE_DETAILS.URL,
    params: params,
  });
};

export const getLawyerAnalytics = () => {
  return apiClient({
    method: routes.LAWYER_ANALYTICS.METHOD,
    url: routes.LAWYER_ANALYTICS.URL,
  });
};

export const resetPassword = (body) => {
  return apiClient({
    method: routes.RESET_PASSWORD.METHOD,
    url: routes.RESET_PASSWORD.URL,
    data: body,
  });
};

export const getSubscriptionPlans = () => {
  return apiClient({
    method: routes.SUBSCRIPTION_PLANS.METHOD,
    url: routes.SUBSCRIPTION_PLANS.URL,
  });
};

export const getLawyersList = (params) => {
  return apiClient({
    method: routes.LAWYERS_LIST.METHOD,
    url: routes.LAWYERS_LIST.URL,
    params,
  });
};

export const updateUserProfile = (data) => {
  return apiClient({
    method: routes.UPDATE_ME.METHOD,
    url: routes.UPDATE_ME.URL,
    data,
  });
};
