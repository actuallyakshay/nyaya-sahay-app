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
