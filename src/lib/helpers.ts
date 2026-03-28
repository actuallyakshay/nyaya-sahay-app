import Cookies from 'js-cookie';

export const setCookie = (name: string, value: string) => {
  Cookies.set(name, value);
};

export const getCookie = (name: string) => {
  return Cookies.get(name);
};

export const deleteCookie = (name: string) => {
  Cookies.remove(name);
};

const APP_SESSION_COOKIES = [
  'user',
  'x-active-role',
  'access-token',
  'refresh-token',
  'auth-user',
] as const;

export const resetCookies = () => {
  for (const name of APP_SESSION_COOKIES) {
    Cookies.remove(name, { path: '/' });
  }
};

export const removeCookie = (
  name: string,
  options: Cookies.CookieAttributes = {}
) => {
  Cookies.remove(name, options);
};
