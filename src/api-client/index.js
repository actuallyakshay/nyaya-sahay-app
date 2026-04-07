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

export const getAdminSessionRequests = (params) => {
  return apiClient({
    method: routes.ADMIN_SESSION_REQUESTS.METHOD,
    url: routes.ADMIN_SESSION_REQUESTS.URL,
    params,
  });
};

export const getAdminCaseRequests = (params) => {
  return apiClient({
    method: routes.ADMIN_CASE_REQUESTS.METHOD,
    url: routes.ADMIN_CASE_REQUESTS.URL,
    params,
  });
};

export const getAdminLawyerVerifications = (params, body) => {
  return apiClient({
    method: routes.ADMIN_LAWYER_VERIFICATIONS.METHOD,
    url: routes.ADMIN_LAWYER_VERIFICATIONS.URL,
    params,
  });
};

export const createAdminUser = (body) => {
  return apiClient({
    method: routes.CREATE_ADMIN_USER.METHOD,
    url: routes.CREATE_ADMIN_USER.URL,
    data: body,
  });
};

export const getAdminUsers = (params) => {
  return apiClient({
    method: routes.ADMIN_USERS.METHOD,
    url: routes.ADMIN_USERS.URL,
    params,
  });
};

export const updateAdminCaseStatus = (caseId, status) => {
  return apiClient({
    method: routes.ADMIN_CASE_STATUS.METHOD,
    url: routes.ADMIN_CASE_STATUS.URL.replace(':caseId', caseId),
    data: { status },
  });
};

export const updateLawyerRoleStatus = (userId, roleCode, status) => {
  return apiClient({
    method: routes.UPDATE_LAWYER_ROLE_STATUS.METHOD,
    url: routes.UPDATE_LAWYER_ROLE_STATUS.URL.replace(
      ':userId',
      userId
    ).replace(':roleCode', roleCode),
    data: { status },
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

export const getAdminAnalytics = () => {
  return apiClient({
    method: routes.ADMIN_ANALYTICS.METHOD,
    url: routes.ADMIN_ANALYTICS.URL,
  });
};

export const getLawyerAnalytics = () => {
  return apiClient({
    method: routes.LAWYER_ANALYTICS.METHOD,
    url: routes.LAWYER_ANALYTICS.URL,
  });
};

export const getCaseDetails = (id) => {
  return apiClient({
    method: routes.CASE_DETAILS.METHOD,
    url: routes.CASE_DETAILS.URL.replace(':id', id),
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

export const getLawyersCases = (params) => {
  return apiClient({
    method: routes.LAWYERS_CASES.METHOD,
    url: routes.LAWYERS_CASES.URL,
    params,
  });
};

export const getAdminCases = (params) => {
  return apiClient({
    method: routes.ADMIN_CASES.METHOD,
    url: routes.ADMIN_CASES.URL,
    params,
  });
};

export const getLawyerProfile = () => {
  return apiClient({
    method: routes.LAWYERS_ME.METHOD,
    url: routes.LAWYERS_ME.URL,
  });
};

export const getAdminLawyerDetails = (id) => {
  return apiClient({
    method: routes.ADMIN_LAWYER_DETAILS.METHOD,
    url: routes.ADMIN_LAWYER_DETAILS.URL.replace(':id', id),
  });
};

export const updateLawyerProfile = (data) => {
  return apiClient({
    method: routes.UPDATE_LAWYER_PROFILE.METHOD,
    url: routes.UPDATE_LAWYER_PROFILE.URL,
    data,
  });
};

export const getAdminUserDetails = (id) => {
  return apiClient({
    method: routes.ADMIN_USER_DETAILS.METHOD,
    url: routes.ADMIN_USER_DETAILS.URL.replace(':id', id),
  });
};

export const getAdminUserCases = (id, params) => {
  return apiClient({
    method: routes.ADMIN_USER_CASES.METHOD,
    url: routes.ADMIN_USER_CASES.URL.replace(':id', id),
    params,
  });
};

export const getAdminLawyerCases = (lawyerId, params) => {
  return apiClient({
    method: routes.ADMIN_LAWYER_CASES.METHOD,
    url: routes.ADMIN_LAWYER_CASES.URL.replace(':lawyerId', lawyerId),
    params,
  });
};

export const getAdminSettings = () => {
  return apiClient({
    method: routes.ADMIN_SETTINGS.METHOD,
    url: routes.ADMIN_SETTINGS.URL,
  });
};

export const updateAdminSettings = (data) => {
  return apiClient({
    method: routes.UPDATE_ADMIN_SETTINGS.METHOD,
    url: routes.UPDATE_ADMIN_SETTINGS.URL,
    data,
  });
};

export const getCaseDocuments = (caseId, params) => {
  return apiClient({
    method: routes.CASE_DOCUMENTS.METHOD,
    url: routes.CASE_DOCUMENTS.URL.replace(':caseId', caseId),
    params,
  });
};

export const uploadCaseDocument = (caseId, body) => {
  return apiClient({
    method: routes.UPLOAD_CASE_DOCUMENT.METHOD,
    url: routes.UPLOAD_CASE_DOCUMENT.URL.replace(':caseId', caseId),
    data: body,
  });
};

export const createCaseSessionRequest = (caseId, body) => {
  return apiClient({
    method: routes.CASE_SESSION_REQUEST.METHOD,
    url: routes.CASE_SESSION_REQUEST.URL.replace(':caseId', caseId),
    data: body,
  });
};
