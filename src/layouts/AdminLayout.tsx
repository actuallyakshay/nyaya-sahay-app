import { BrandLogo } from '@/components/BrandLogo';
import Breadcrumbs from '@/components/Breakcrumbs';
import { ADMIN_NAV, ROUTES } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { resetCookies } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import {
  Loader2,
  LogOut,
  Menu,
  PanelLeft,
  PanelLeftClose,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    resetCookies();
    navigate(ROUTES.login);
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-card px-4 lg:hidden">
        <button onClick={() => setSidebarOpen(true)} className="p-1">
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <BrandLogo size="sm" showText={false} />
          <span className="font-serif text-lg font-bold">Admin</span>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-xs font-bold text-primary-foreground">
          A
        </div>
      </header>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-foreground/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 transform bg-navy transition-all duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          collapsed ? 'lg:w-16' : 'lg:w-60',
          'w-60'
        )}
      >
        <div className="flex h-full flex-col">
          <div
            className={cn(
              'flex h-16 items-center px-5',
              collapsed ? 'lg:justify-center lg:px-0' : 'justify-between'
            )}
          >
            <div
              className={cn(
                'flex items-center gap-2.5',
                collapsed && 'lg:hidden'
              )}
            >
              <BrandLogo size="md" showText={false} />
              <span className="font-serif text-lg font-bold text-primary-foreground">
                Admin
              </span>
            </div>
            <div
              className={cn(
                'hidden',
                collapsed && 'items-center justify-center lg:flex'
              )}
            >
              <BrandLogo size="md" showText={false} />
            </div>
            <button
              className="p-1 text-primary-foreground/60 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav
            className={cn(
              'mt-2 flex-1 space-y-0.5',
              collapsed ? 'px-1.5' : 'px-3'
            )}
          >
            {ADMIN_NAV.map((item) => {
              const active =
                location.pathname === item.to ||
                location.pathname.startsWith(item.to + '/');
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    collapsed && 'lg:justify-center lg:px-0',
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
          </nav>

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

      <main className="min-h-screen flex-1">
        <div className="p-4 md:p-6 lg:p-8">
          <Breadcrumbs />
          {children}
        </div>
      </main>
    </div>
  );
};
