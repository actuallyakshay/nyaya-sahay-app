import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Scale, LayoutDashboard, Users, Briefcase, UserCheck, CreditCard, Settings, LogOut, Menu, X, FileText, PanelLeftClose, PanelLeft, FilePlus, CalendarCheck, ArrowRightLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types';

const adminNav = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Case Requests', to: '/admin/case-requests', icon: FilePlus },
  { label: 'Session Requests', to: '/admin/session-requests', icon: CalendarCheck },
  { label: 'Users', to: '/admin/users', icon: Users },
  { label: 'Lawyers', to: '/admin/lawyers', icon: UserCheck },
  { label: 'Cases', to: '/admin/cases', icon: Briefcase },
  { label: 'Subscriptions', to: '/admin/subscriptions', icon: FileText },
  { label: 'Payments', to: '/admin/payments', icon: CreditCard },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
];

const ROLE_LABELS: Record<UserRole, string> = {
  user: 'User',
  lawyer: 'Advocate',
  admin: 'Admin',
};

const ROLE_DASHBOARDS: Record<UserRole, string> = {
  user: '/app/dashboard',
  lawyer: '/lawyer/dashboard',
  admin: '/admin/dashboard',
};

export const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout, switchRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const availableRoles = user?.availableRoles || [user?.role || 'admin'];
  const hasMultipleRoles = availableRoles.length > 1;

  const handleLogout = () => { logout(); navigate('/'); };

  const handleSwitchRole = (role: UserRole) => {
    switchRole(role);
    navigate(ROLE_DASHBOARDS[role]);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-card px-4 lg:hidden">
        <button onClick={() => setSidebarOpen(true)} className="p-1"><Menu className="h-5 w-5" /></button>
        <span className="font-serif text-lg font-bold">Admin</span>
        <div className="h-8 w-8 rounded-full bg-navy flex items-center justify-center text-xs font-bold text-primary-foreground">
          {user?.name?.charAt(0) || 'A'}
        </div>
      </header>

      {sidebarOpen && <div className="fixed inset-0 z-50 bg-foreground/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 transform bg-navy transition-all duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        collapsed ? 'lg:w-16' : 'lg:w-60',
        'w-60'
      )}>
        <div className="flex h-full flex-col">
          <div className={cn("flex h-16 items-center px-5", collapsed ? 'lg:justify-center lg:px-0' : 'justify-between')}>
            <div className={cn("flex items-center gap-2.5", collapsed && 'lg:hidden')}>
              <Scale className="h-5 w-5 text-gold" />
              <span className="font-serif text-lg font-bold text-primary-foreground">Admin</span>
            </div>
            <div className={cn("hidden", collapsed && 'lg:flex items-center justify-center')}>
              <Scale className="h-5 w-5 text-gold" />
            </div>
            <button className="p-1 text-primary-foreground/60 lg:hidden" onClick={() => setSidebarOpen(false)}><X className="h-5 w-5" /></button>
          </div>

          {/* Profile section */}
          {!collapsed && (
            <div className="mx-4 mb-4 rounded-lg bg-sidebar-accent px-3 py-2.5 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold text-sm shrink-0">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gold">Admin Panel</p>
                <p className="truncate text-sm font-semibold text-primary-foreground">{user?.name || 'Admin'}</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="mx-auto mb-4">
              <div className="h-9 w-9 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold text-sm">
                {user?.name?.charAt(0) || 'A'}
              </div>
            </div>
          )}

          <nav className={cn("flex-1 space-y-0.5 mt-2", collapsed ? 'px-1.5' : 'px-3')}>
            {adminNav.map((item) => {
              const active = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
              return (
                <Link key={item.to} to={item.to} onClick={() => setSidebarOpen(false)}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    collapsed && 'lg:justify-center lg:px-0',
                    active ? 'bg-sidebar-accent text-primary-foreground' : 'text-primary-foreground/60 hover:bg-sidebar-accent/50 hover:text-primary-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className={cn(collapsed && 'lg:hidden')}>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Role switcher */}
          {hasMultipleRoles && !collapsed && (
            <div className="border-t border-sidebar-border px-3 py-2">
              <p className="text-[10px] uppercase tracking-wider text-primary-foreground/40 mb-1.5 px-3">Switch Profile</p>
              {availableRoles.filter(r => r !== user?.role).map(role => (
                <button key={role} onClick={() => handleSwitchRole(role)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-primary-foreground/60 hover:bg-sidebar-accent/50 hover:text-primary-foreground transition-colors"
                >
                  <ArrowRightLeft className="h-3.5 w-3.5" />
                  Switch to {ROLE_LABELS[role]}
                </button>
              ))}
            </div>
          )}
          {hasMultipleRoles && collapsed && (
            <div className="border-t border-sidebar-border p-2">
              {availableRoles.filter(r => r !== user?.role).map(role => (
                <button key={role} onClick={() => handleSwitchRole(role)}
                  title={`Switch to ${ROLE_LABELS[role]}`}
                  className="flex w-full items-center justify-center rounded-lg py-2 text-primary-foreground/60 hover:bg-sidebar-accent/50 hover:text-primary-foreground"
                >
                  <ArrowRightLeft className="h-4 w-4" />
                </button>
              ))}
            </div>
          )}

          <div className="hidden lg:block border-t border-sidebar-border p-2">
            <button onClick={() => setCollapsed(!collapsed)}
              className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-primary-foreground/60 hover:bg-sidebar-accent/50 hover:text-primary-foreground"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
              {!collapsed && <span>Collapse</span>}
            </button>
          </div>

          <div className="border-t border-sidebar-border p-3">
            <button onClick={handleLogout}
              title={collapsed ? 'Sign Out' : undefined}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-primary-foreground/60 hover:bg-sidebar-accent/50 hover:text-primary-foreground",
                collapsed && 'lg:justify-center lg:px-0'
              )}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span className={cn(collapsed && 'lg:hidden')}>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-h-screen p-4 md:p-6 lg:p-8">{children}</main>
    </div>
  );
};
