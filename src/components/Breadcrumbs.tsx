import { Link, useLocation, useParams } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface BreadcrumbItem {
  label: string;
  to?: string;
}

const ROUTE_LABELS: Record<string, string> = {
  app: 'Dashboard',
  lawyer: 'Dashboard',
  admin: 'Dashboard',
  dashboard: 'Dashboard',
  cases: 'Cases',
  'new-case': 'New Case',
  lawyers: 'Our Lawyers',
  sessions: 'Sessions',
  subscription: 'Subscription',
  profile: 'Profile',
  users: 'Users',
  payments: 'Payments',
  settings: 'Settings',
  subscriptions: 'Subscriptions',
  'case-requests': 'Case Requests',
  'session-requests': 'Session Requests',
  'lawyer-verifications': 'Verifications',
};

const Breadcrumbs = () => {
  const location = useLocation();
  const { user } = useAuth();
  const params = useParams();

  const segments = location.pathname.split('/').filter(Boolean);
  if (segments.length <= 1) return null;

  const rolePrefix = segments[0]; // 'app', 'lawyer', or 'admin'

  const dashboardPath = rolePrefix === 'app' ? '/app/dashboard'
    : rolePrefix === 'lawyer' ? '/lawyer/dashboard'
    : '/admin/dashboard';

  const crumbs: BreadcrumbItem[] = [
    { label: 'Home', to: dashboardPath },
  ];

  let pathSoFar = '';
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    pathSoFar += '/' + seg;

    // Skip the role prefix itself (app/lawyer/admin) — already covered by Home
    if (i === 0) continue;
    // Skip 'dashboard' since Home already points there
    if (seg === 'dashboard') continue;

    // Check if this is a dynamic param (like a case ID)
    const isParam = params.id && seg === params.id;

    const label = isParam
      ? `#${seg.substring(0, 8)}`
      : ROUTE_LABELS[seg] || seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ');

    const isLast = i === segments.length - 1;

    crumbs.push({
      label,
      to: isLast ? undefined : pathSoFar,
    });
  }

  if (crumbs.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm mb-4">
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />}
          {crumb.to ? (
            <Link
              to={crumb.to}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {i === 0 ? (
                <span className="flex items-center gap-1">
                  <Home className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{crumb.label}</span>
                </span>
              ) : (
                crumb.label
              )}
            </Link>
          ) : (
            <span className="font-medium text-foreground truncate max-w-[200px]">
              {crumb.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
