/**
 * Browser paths for React Router and redirects.
 * API URLs stay in `src/api-client/routes`.
 */

export const PATH_PREFIX = {
  admin: '/admin',
  lawyer: '/lawyer',
} as const;

/** Static marketing / auth paths */
export const ROUTES = {
  home: '/',
  plans: '/plans',
  about: '/about',
  howItWorks: '/how-it-works',
  faq: '/faq',
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  user: {
    dashboard: `/dashboard`,
    cases: `/cases`,
    newCase: `/new-case`,
    subscription: `/subscription`,
    profile: `/profile`,
    lawyers: `/lawyers`,
  },
  lawyer: {
    dashboard: `${PATH_PREFIX.lawyer}/dashboard`,
    cases: `${PATH_PREFIX.lawyer}/cases`,
    profile: `${PATH_PREFIX.lawyer}/profile`,
  },
  admin: {
    dashboard: `${PATH_PREFIX.admin}/dashboard`,
    users: `${PATH_PREFIX.admin}/users`,
    lawyers: `${PATH_PREFIX.admin}/lawyers`,
    lawyerVerifications: `${PATH_PREFIX.admin}/lawyer-verifications`,
    cases: `${PATH_PREFIX.admin}/cases`,
    caseRequests: `${PATH_PREFIX.admin}/case-requests`,
    sessionRequests: `${PATH_PREFIX.admin}/session-requests`,
    subscriptions: `${PATH_PREFIX.admin}/subscriptions`,
    payments: `${PATH_PREFIX.admin}/payments`,
    settings: `${PATH_PREFIX.admin}/settings`,
    login: `${PATH_PREFIX.admin}/login`,
  },
} as const;

/** Route patterns for `<Route path={...} />` (includes param tokens). */
export const ROUTE_PATTERNS = {
  caseDetail: '/cases/:id',
  adminUserDetail: `${PATH_PREFIX.admin}/users/:id`,
  adminLawyerDetail: `${PATH_PREFIX.admin}/lawyers/:id`,
  adminCaseDetail: `${PATH_PREFIX.admin}/cases/:id`,
} as const;

export const path = {
  caseDetail: (id: string) => `/cases/${id}`,
  adminCase: (id: string) => `${ROUTES.admin.cases}/${id}`,
  adminUser: (id: string) => `${ROUTES.admin.users}/${id}`,
  adminLawyer: (id: string) => `${ROUTES.admin.lawyers}/${id}`,
} as const;

export function dashboardForRole(
  role: 'user' | 'lawyer' | 'admin' | string | undefined
) {
  if (role === 'admin') return ROUTES.admin.dashboard;
  if (role === 'lawyer') return ROUTES.lawyer.dashboard;
  return ROUTES.user.dashboard;
}
