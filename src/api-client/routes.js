const routes = {
  GOOGLE_AUTH_LOGIN: {
    URL: '/api/auth/google',
    METHOD: 'POST',
  },
  LOGIN: {
    URL: '/api/auth/email',
    METHOD: 'POST',
  },
  REFRESH_TOKEN: {
    URL: '/api/auth/refresh',
    METHOD: 'POST',
  },
  LOGOUT: {
    URL: '/api/auth/logout',
    METHOD: 'POST',
  },
  REGISTER: {
    URL: '/api/auth/email',
    METHOD: 'POST',
  },
  USERS_ME: {
    URL: '/api/users/me',
    METHOD: 'GET',
  },
  UPDATE_ME: {
    URL: '/api/users',
    METHOD: 'PATCH',
  },
  CATEGORIES: {
    URL: '/api/cases/categories',
    METHOD: 'GET',
  },
  CREATE_CASE: {
    URL: '/api/cases',
    METHOD: 'POST',
  },
  UPLOAD_ASSET: {
    URL: '/api/assets/upload',
    METHOD: 'POST',
  },
  GET_CASES: {
    URL: '/api/cases',
    METHOD: 'GET',
  },
  CHECK_ROLE: {
    URL: '/api/users/me',
    METHOD: 'GET',
  },
  USER_ANALYTICS: {
    URL: '/api/users/analytics',
    METHOD: 'GET',
  },
  USER_ANALYTICS: {
    URL: '/api/users/analytics',
    METHOD: 'GET',
  },
  CASE_DETAILS: {
    URL: '/api/cases/',
    METHOD: 'GET',
  },
  LAWYER_ANALYTICS: {
    URL: '/api/lawyers/analytics',
    METHOD: 'GET',
  },
  RESET_PASSWORD: {
    URL: '/api/admin/reset-password',
    METHOD: 'PATCH',
  },
  SUBSCRIPTION_PLANS: {
    URL: '/api/subscriptions',
    METHOD: 'GET',
  },
  LAWYERS_LIST: {
    URL: '/api/lawyers',
    METHOD: 'GET',
  },
  LAWYERS_CASES: {
    URL: '/api/lawyers/cases',
    METHOD: 'GET',
  },
  LAWYERS_ME: {
    URL: '/api/lawyers',
    METHOD: 'GET',
  },
  UPDATE_LAWYER_PROFILE: {
    URL: '/api/lawyers',
    METHOD: 'PATCH',
  },
};

export default routes;
