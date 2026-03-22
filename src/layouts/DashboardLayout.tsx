import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Scale, LayoutDashboard, Briefcase, Plus, CreditCard, User, Bell, LogOut, Menu, X, ChevronLeft, MessageSquare, PanelLeftClose, PanelLeft, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const userNav = [
  { label: 'Dashboard', to: '/app/dashboard', icon: LayoutDashboard },
  { label: 'My Cases', to: '/app/cases', icon: Briefcase },
  { label: 'New Case', to: '/app/new-case', icon: Plus },
  { label: 'Our Lawyers', to: '/app/lawyers', icon: Users },
  { label: 'Subscription', to: '/app/subscription', icon: CreditCard },
  { label: 'Notifications', to: '/app/notifications', icon: Bell },
  { label: 'Profile', to: '/app/profile', icon: User },
];

const lawyerNav = [
  { label: 'Dashboard', to: '/lawyer/dashboard', icon: LayoutDashboard },
  { label: 'Cases', to: '/lawyer/cases', icon: Briefcase },
  { label: 'Messages', to: '/lawyer/cases', icon: MessageSquare },
  { label: 'Notifications', to: '/lawyer/notifications', icon: Bell },
  { label: 'Profile', to: '/lawyer/profile', icon: User },
];

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const nav = user?.role === 'lawyer' ? lawyerNav : userNav;
  const roleName = user?.role === 'lawyer' ? 'Advocate' : 'User';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Mobile header */}
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-card px-4 lg:hidden">
        <button onClick={() => setSidebarOpen(true)} className="p-1">
          <Menu className="h-5 w-5" />
        </button>
        <Link to="/" className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-gold" />
          <span className="font-serif text-lg font-bold">NyayaSetu</span>
        </Link>
        <div className="h-8 w-8 rounded-full bg-navy flex items-center justify-center text-xs font-bold text-primary-foreground">
          {user?.name?.charAt(0)}
        </div>
      </header>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 bg-foreground/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar — sticky + collapsible */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 transform bg-navy transition-all duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        collapsed ? 'lg:w-16' : 'lg:w-64',
        'w-64'
      )}>
        <div className="flex h-full flex-col">
          <div className={cn("flex h-16 items-center px-5", collapsed ? 'lg:justify-center lg:px-0' : 'justify-between')}>
            <Link to="/" className={cn("flex items-center gap-2.5", collapsed && 'lg:hidden')}>
              <Scale className="h-5 w-5 text-gold" />
              <span className="font-serif text-lg font-bold text-primary-foreground">NyayaSetu</span>
            </Link>
            <Link to="/" className={cn("hidden", collapsed && 'lg:flex items-center justify-center')}>
              <Scale className="h-5 w-5 text-gold" />
            </Link>
            <button className="p-1 text-primary-foreground/60 lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Profile section in sidebar */}
          {!collapsed && (
            <div className="mx-4 mb-4 rounded-lg bg-sidebar-accent px-3 py-2.5 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold text-sm shrink-0">
                {user?.name?.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gold">{roleName} Panel</p>
                <p className="truncate text-sm font-semibold text-primary-foreground">{user?.name}</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="mx-auto mb-4">
              <div className="h-9 w-9 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold text-sm">
                {user?.name?.charAt(0)}
              </div>
            </div>
          )}

          <nav className={cn("flex-1 space-y-0.5", collapsed ? 'px-1.5' : 'px-3')}>
            {nav.map((item) => {
              const active = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
              return (
                <Link key={item.to + item.label} to={item.to} onClick={() => setSidebarOpen(false)}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    collapsed && 'lg:justify-center lg:px-0 lg:py-2.5',
                    active ? 'bg-sidebar-accent text-primary-foreground' : 'text-primary-foreground/60 hover:bg-sidebar-accent/50 hover:text-primary-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className={cn(collapsed && 'lg:hidden')}>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Collapse toggle — desktop only */}
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
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-primary-foreground/60 hover:bg-sidebar-accent/50 hover:text-primary-foreground',
                collapsed && 'lg:justify-center lg:px-0'
              )}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span className={cn(collapsed && 'lg:hidden')}>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen">
        <div className="hidden lg:flex h-14 items-center border-b bg-card px-6">
          <Button variant="ghost" size="sm" asChild className="gap-1 text-muted-foreground">
            <Link to="/"><ChevronLeft className="h-4 w-4" /> Back to site</Link>
          </Button>
        </div>
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
