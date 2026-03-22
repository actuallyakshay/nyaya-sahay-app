import { DashboardLayout } from '@/layouts/DashboardLayout';
import { mockNotifications } from '@/lib/mock-data';
import { Bell, CheckCircle, Info, AlertTriangle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const iconMap = {
  info: <Info className="h-4 w-4 text-info" />,
  success: <CheckCircle className="h-4 w-4 text-success" />,
  warning: <AlertTriangle className="h-4 w-4 text-warning" />,
  error: <XCircle className="h-4 w-4 text-destructive" />,
};

const UserNotifications = () => (
  <DashboardLayout>
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Notifications</h1>
      <div className="space-y-2">
        {mockNotifications.map((n) => (
          <div key={n.id} className={`rounded-xl border bg-card p-4 flex gap-3 items-start ${!n.isRead ? 'border-l-4 border-l-gold' : ''}`}>
            <div className="mt-0.5">{iconMap[n.type]}</div>
            <div className="min-w-0 flex-1">
              <p className={`text-sm ${!n.isRead ? 'font-semibold' : 'font-medium'}`}>{n.title}</p>
              <p className="text-sm text-muted-foreground">{n.message}</p>
              <p className="mt-1 text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleDateString('en-IN')}</p>
            </div>
            {n.link && <Link to={n.link} className="text-xs text-gold hover:underline shrink-0">View</Link>}
          </div>
        ))}
      </div>
    </div>
  </DashboardLayout>
);

export default UserNotifications;
