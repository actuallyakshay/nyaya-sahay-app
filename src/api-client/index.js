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
}