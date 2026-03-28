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
  CATEGORIES: {
    URL: "/api/cases/categories",
    METHOD: "GET",
  },
  CREATE_CASE: {
    URL: "/api/cases",
    METHOD: "POST",
  },
  UPLOAD_ASSET: {
    URL: "/api/assets/upload",
    METHOD: "POST",
  },
  GET_CASES: {
    URL: "/api/cases",
    METHOD: "GET",
  },
  CHECK_ROLE: {
    URL: "/api/users/me",
    METHOD: "GET",
  },
};

export default routes;
