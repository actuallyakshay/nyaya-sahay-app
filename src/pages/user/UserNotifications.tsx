import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Bell, CheckCircle, Info, AlertTriangle, XCircle, Video, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { usePagination } from '@/hooks/usePagination';
import { PaginationControls } from '@/components/PaginationControls';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockLawyerNotifications, mockUserNotifications, NOTIFICATION_FILTER_OPTIONS } from '@/lib/mock-data';
import type { ConsultationNotification } from '@/types';

const iconMap: Record<string, React.ReactNode> = {
  info: <Info className="h-4 w-4 text-info" />,
  success: <CheckCircle className="h-4 w-4 text-success" />,
  warning: <AlertTriangle className="h-4 w-4 text-warning" />,
  error: <XCircle className="h-4 w-4 text-destructive" />,
  consultation: <Video className="h-4 w-4 text-gold" />,
};

const UserNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isLawyer = user?.role === 'lawyer';
  const notifications = isLawyer ? mockLawyerNotifications : mockUserNotifications;
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    return notifications.filter(n => {
      if (filter === 'all') return true;
      if (filter === 'unread') return !n.isRead;
      return n.type === filter;
    });
  }, [notifications, filter]);

  const { paginated, page, totalPages, next, prev } = usePagination(filtered, 5);

  const handleAccept = (notif: ConsultationNotification) => {
    setStatuses(prev => ({ ...prev, [notif.id]: 'accepted' }));
    toast({ title: 'Consultation Accepted', description: 'Google Meet link has been generated and shared with the client.' });
  };

  const handleDecline = (notif: ConsultationNotification) => {
    setStatuses(prev => ({ ...prev, [notif.id]: 'declined' }));
    toast({ title: 'Consultation Declined', description: 'The client will be notified.' });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Notifications</h1>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {NOTIFICATION_FILTER_OPTIONS.map(f => (
                <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          {paginated.length === 0 ? (
            <div className="rounded-xl border bg-card p-8 text-center">
              <p className="text-muted-foreground">No notifications found.</p>
            </div>
          ) : paginated.map((n) => {
            const cd = n.consultationDetails;
            const currentStatus = statuses[n.id] || cd?.status;

            return (
              <div key={n.id} className={`rounded-xl border bg-card p-4 ${!n.isRead ? 'border-l-4 border-l-gold' : ''}`}>
                <div className="flex gap-3 items-start">
                  <div className="mt-0.5">{iconMap[n.type]}</div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm ${!n.isRead ? 'font-semibold' : 'font-medium'}`}>{n.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>

                    {cd && (
                      <div className="mt-3 rounded-lg bg-muted p-3 space-y-2">
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                          <span><span className="text-muted-foreground">Type:</span> {cd.sessionType}</span>
                          <span><span className="text-muted-foreground">Date:</span> {new Date(cd.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          <span><span className="text-muted-foreground">Time:</span> {cd.time}</span>
                          <span><span className="text-muted-foreground">Case:</span> {cd.caseNumber}</span>
                        </div>

                        {isLawyer && currentStatus === 'pending' && (
                          <div className="flex gap-2 pt-1">
                            <Button size="sm" onClick={() => handleAccept(n)}>
                              <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Accept
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDecline(n)}>
                              <XCircle className="mr-1.5 h-3.5 w-3.5" /> Decline
                            </Button>
                          </div>
                        )}

                        {currentStatus === 'accepted' && (
                          <div className="flex items-center gap-2 pt-1">
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
                              <CheckCircle className="h-3 w-3" /> Accepted
                            </span>
                            {(cd.meetLink || statuses[n.id] === 'accepted') && (
                              <a href={cd.meetLink || 'https://meet.google.com/new-generated-link'} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-medium text-gold hover:underline">
                                <ExternalLink className="h-3 w-3" /> Join Google Meet
                              </a>
                            )}
                          </div>
                        )}

                        {currentStatus === 'declined' && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive pt-1">
                            <XCircle className="h-3 w-3" /> Declined
                          </span>
                        )}
                      </div>
                    )}

                    <p className="mt-2 text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  {n.link && <Link to={n.link} className="text-xs text-gold hover:underline shrink-0">View</Link>}
                </div>
              </div>
            );
          })}
        </div>

        <PaginationControls page={page} totalPages={totalPages} onNext={next} onPrev={prev} />
      </div>
    </DashboardLayout>
  );
};

export default UserNotifications;
