import Breadcrumbs from '@/components/Breakcrumbs';
import { LAWYER_NAV, ROUTES, USER_NAV } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { getCookie, resetCookies, setCookie } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import {
  ArrowRightLeft,
  Loader2,
  LogOut,
  Menu,
  PanelLeft,
  PanelLeftClose,
  Scale,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export const DashboardLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user, logout, isLoading } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  /** Google CDN avatars often 403 with a cross-origin Referer; `no-referrer` fixes load. */
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [user?.avatarUrl]);

  const showAvatar =
    Boolean(user?.avatarUrl && user.avatarUrl.length > 0) && !avatarLoadFailed;
  const activeRole = getCookie('x-active-role');

  const nav = activeRole === 'lawyer' ? LAWYER_NAV : USER_NAV;
  const roleName = activeRole === 'lawyer' ? 'Advocate' : 'User';

  const hasMultipleRoles = user?.roles?.length > 1;
  const switchToText =
    activeRole === 'lawyer' ? 'Switch to User' : 'Switch to Lawyer';

  const handleLogout = async () => {
    await logout();
    resetCookies();
    navigate(ROUTES.login);
  };

  const handleSwitchRole = () => {
    const newRole = activeRole === 'lawyer' ? 'user' : 'lawyer';
    setCookie('x-active-role', newRole);
    navigate(
      newRole === 'lawyer' ? ROUTES.lawyer.dashboard : ROUTES.user.dashboard
    );
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Mobile header */}
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-card px-4 lg:hidden">
        <button onClick={() => setSidebarOpen(true)} className="p-1">
          <Menu className="h-5 w-5" />
        </button>
        <Link to={ROUTES.home} className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-gold" />
          <span className="font-serif text-lg font-bold">NyayaSetu</span>
        </Link>
        {showAvatar ? (
          <img
            src={user!.avatarUrl}
            alt=""
            referrerPolicy="no-referrer"
            className="h-8 w-8 rounded-full object-cover"
            onError={() => setAvatarLoadFailed(true)}
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-xs font-bold text-primary-foreground">
            {user?.fullName?.charAt(0)?.toUpperCase()}
          </div>
        )}
      </header>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-foreground/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — sticky + collapsible */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 transform bg-navy transition-all duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          collapsed ? 'lg:w-16' : 'lg:w-64',
          'w-64'
        )}
      >
        <div className="flex h-full flex-col">
          <div
            className={cn(
              'flex h-16 items-center px-5',
              collapsed ? 'lg:justify-center lg:px-0' : 'justify-between'
            )}
          >
            <Link
              to={ROUTES.home}
              className={cn(
                'flex items-center gap-2.5',
                collapsed && 'lg:hidden'
              )}
            >
              <Scale className="h-5 w-5 text-gold" />
              <span className="font-serif text-lg font-bold text-primary-foreground">
                NyayaSetu
              </span>
            </Link>
            <Link
              to={ROUTES.home}
              className={cn(
                'hidden',
                collapsed && 'items-center justify-center lg:flex'
              )}
            >
              <Scale className="h-5 w-5 text-gold" />
            </Link>
            <button
              className="p-1 text-primary-foreground/60 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Profile section in sidebar */}
          {!collapsed && (
            <div className="mx-4 mb-4 flex items-center gap-3 rounded-lg bg-sidebar-accent px-3 py-2.5">
              {showAvatar ? (
                <img
                  src={user!.avatarUrl}
                  alt={user?.fullName ?? ''}
                  referrerPolicy="no-referrer"
                  className="h-9 w-9 rounded-full object-cover"
                  onError={() => setAvatarLoadFailed(true)}
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/20 text-sm font-bold text-gold">
                  {user?.fullName?.charAt(0)?.toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-medium text-gold">
                  {roleName} Panel
                </p>
                <p className="truncate text-sm font-semibold text-primary-foreground">
                  {user?.fullName}
                </p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="mx-auto mb-4">
              {showAvatar ? (
                <img
                  src={user!.avatarUrl}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="mx-auto h-9 w-9 rounded-full object-cover"
                  onError={() => setAvatarLoadFailed(true)}
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/20 text-sm font-bold text-gold">
                  {user?.fullName?.charAt(0)?.toUpperCase()}
                </div>
              )}
            </div>
          )}

          <nav
            className={cn('flex-1 space-y-0.5', collapsed ? 'px-1.5' : 'px-3')}
          >
            {nav.map((item) => {
              const active =
                location.pathname === item.to ||
                location.pathname.startsWith(item.to + '/');
              return (
                <Link
                  key={item.to + item.label}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    collapsed && 'lg:justify-center lg:px-0 lg:py-2.5',
                    active
                      ? 'bg-sidebar-accent text-primary-foreground'
                      : 'text-primary-foreground/60 hover:bg-sidebar-accent/50 hover:text-primary-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className={cn(collapsed && 'lg:hidden')}>
                    {item.label}
                  </span>
                </Link>
              );
            })}

            {/* Role Switch - Only show if user has multiple roles */}
            {hasMultipleRoles && (
              <>
                {!collapsed && (
                  <div className="px-3 py-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-primary-foreground/40">
                      Switch Profile
                    </p>
                  </div>
                )}
                <button
                  onClick={handleSwitchRole}
                  title={collapsed ? switchToText : undefined}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    collapsed && 'lg:justify-center lg:px-0 lg:py-2.5',
                    'text-primary-foreground/60 hover:bg-sidebar-accent/50 hover:text-primary-foreground'
                  )}
                >
                  <ArrowRightLeft className="h-4 w-4 shrink-0" />
                  <span className={cn(collapsed && 'lg:hidden')}>
                    {switchToText}
                  </span>
                </button>
              </>
            )}
          </nav>

          {/* Collapse toggle — desktop only */}
          <div className="hidden border-t border-sidebar-border p-2 lg:block">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-primary-foreground/60 hover:bg-sidebar-accent/50 hover:text-primary-foreground"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? (
                <PanelLeft className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
              {!collapsed && <span>Collapse</span>}
            </button>
          </div>

          <div className="border-t border-sidebar-border p-3">
            <button
              onClick={handleLogout}
              title={collapsed ? 'Sign Out' : undefined}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-primary-foreground/60 hover:bg-sidebar-accent/50 hover:text-primary-foreground',
                collapsed && 'lg:justify-center lg:px-0'
              )}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4 shrink-0" />
              )}
              <span className={cn(collapsed && 'lg:hidden')}>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="min-h-screen flex-1">
        <div className="p-4 md:p-6 lg:p-8">
          <Breadcrumbs />
          {children}
        </div>
      </main>
    </div>
  );
};
