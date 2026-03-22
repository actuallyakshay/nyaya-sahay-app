import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Scale, LayoutDashboard, Users, Briefcase, UserCheck, CreditCard, BarChart3, Settings, LogOut, Menu, X, FileText, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const adminNav = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Users', to: '/admin/users', icon: Users },
  { label: 'Lawyers', to: '/admin/lawyers', icon: UserCheck },
  { label: 'Cases', to: '/admin/cases', icon: Briefcase },
  { label: 'Subscriptions', to: '/admin/subscriptions', icon: FileText },
  { label: 'Payments', to: '/admin/payments', icon: CreditCard },
  { label: 'Reports', to: '/admin/reports', icon: BarChart3 },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
];

export const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-card px-4 lg:hidden">
        <button onClick={() => setSidebarOpen(true)} className="p-1"><Menu className="h-5 w-5" /></button>
        <span className="font-serif text-lg font-bold">Admin</span>
        <div className="h-8 w-8 rounded-full bg-navy flex items-center justify-center text-xs font-bold text-primary-foreground">A</div>
      </header>

      {sidebarOpen && <div className="fixed inset-0 z-50 bg-foreground/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-60 transform bg-navy transition-transform duration-200 lg:relative lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between px-5">
            <div className="flex items-center gap-2.5">
              <Scale className="h-5 w-5 text-gold" />
              <span className="font-serif text-lg font-bold text-primary-foreground">Admin</span>
            </div>
            <button className="p-1 text-primary-foreground/60 lg:hidden" onClick={() => setSidebarOpen(false)}><X className="h-5 w-5" /></button>
          </div>

          <nav className="flex-1 space-y-0.5 px-3 mt-2">
            {adminNav.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link key={item.to} to={item.to} onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    active ? 'bg-sidebar-accent text-primary-foreground' : 'text-primary-foreground/60 hover:bg-sidebar-accent/50 hover:text-primary-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-sidebar-border p-3">
            <button onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-primary-foreground/60 hover:bg-sidebar-accent/50 hover:text-primary-foreground"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-h-screen p-4 md:p-6 lg:p-8">{children}</main>
    </div>
  );
};
