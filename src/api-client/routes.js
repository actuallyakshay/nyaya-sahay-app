const routes = {
  GOOGLE_AUTH_LOGIN: {
    URL: "/api/auth/google",
    METHOD: "POST",
  },
  LOGIN: {
    URL: "/api/auth/email",
    METHOD: "POST",
  },
  REFRESH_TOKEN: {
    URL: "/api/auth/refresh",
    METHOD: "POST",
  },
  LOGOUT: {
    URL: "/api/auth/logout",
    METHOD: "POST",
  },
  REGISTER: {
    URL: "/api/auth/email",
    METHOD: "POST",
  },
};

export default routes;
