import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Bell, CheckCircle, Info, AlertTriangle, XCircle, Video, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface ConsultationNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'consultation';
  isRead: boolean;
  createdAt: string;
  link?: string;
  consultationDetails?: {
    sessionType: string;
    date: string;
    time: string;
    userName: string;
    caseNumber: string;
    status: 'pending' | 'accepted' | 'declined';
    meetLink?: string;
  };
}

const mockLawyerNotifications: ConsultationNotification[] = [
  {
    id: 'ln1',
    title: 'Consultation Request',
    message: 'Rajesh Kumar has requested a video consultation for case LSP-2024-001.',
    type: 'consultation',
    isRead: false,
    createdAt: '2024-09-06T10:00:00',
    link: '/lawyer/cases/c1',
    consultationDetails: {
      sessionType: 'Video Call',
      date: '2024-09-10',
      time: '14:00',
      userName: 'Rajesh Kumar',
      caseNumber: 'LSP-2024-001',
      status: 'pending',
    },
  },
  {
    id: 'ln2',
    title: 'Consultation Accepted',
    message: 'You accepted the consultation with Rajesh Kumar. Google Meet link is ready.',
    type: 'success',
    isRead: true,
    createdAt: '2024-09-05T16:00:00',
    link: '/lawyer/cases/c1',
    consultationDetails: {
      sessionType: 'Video Call',
      date: '2024-09-08',
      time: '11:00',
      userName: 'Rajesh Kumar',
      caseNumber: 'LSP-2024-001',
      status: 'accepted',
      meetLink: 'https://meet.google.com/abc-defg-hij',
    },
  },
  { id: 'ln3', title: 'New Case Assigned', message: 'You have been assigned to a new property dispute case.', type: 'info', isRead: false, createdAt: '2024-09-02T09:00:00', link: '/lawyer/cases/c1' },
  { id: 'ln4', title: 'New Message', message: 'Rajesh Kumar sent a new message on case LSP-2024-001.', type: 'info', isRead: true, createdAt: '2024-09-01T10:30:00', link: '/lawyer/cases/c1' },
];

const mockUserNotifications: ConsultationNotification[] = [
  {
    id: 'un1',
    title: 'Consultation Accepted',
    message: 'Adv. Priya Sharma accepted your consultation request. Join via the link below.',
    type: 'success',
    isRead: false,
    createdAt: '2024-09-06T16:00:00',
    link: '/app/cases/c1',
    consultationDetails: {
      sessionType: 'Video Call',
      date: '2024-09-10',
      time: '14:00',
      userName: 'Adv. Priya Sharma',
      caseNumber: 'LSP-2024-001',
      status: 'accepted',
      meetLink: 'https://meet.google.com/abc-defg-hij',
    },
  },
  { id: 'un2', title: 'Lawyer Assigned', message: 'Adv. Priya Sharma has been assigned to your property case.', type: 'success', isRead: false, createdAt: '2024-09-02T09:00:00', link: '/app/cases/c1' },
  { id: 'un3', title: 'New Message', message: 'You have a new message from your lawyer regarding case LSP-2024-001.', type: 'info', isRead: true, createdAt: '2024-09-03T11:30:00', link: '/app/cases/c1' },
  { id: 'un4', title: 'Subscription Active', message: 'Your Professional plan is now active until August 2025.', type: 'success', isRead: true, createdAt: '2024-08-15T10:00:00' },
];

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
        <h1 className="text-2xl font-bold">Notifications</h1>
        <div className="space-y-3">
          {notifications.map((n) => {
            const cd = n.consultationDetails;
            const currentStatus = statuses[n.id] || cd?.status;

            return (
              <div key={n.id} className={`rounded-xl border bg-card p-4 ${!n.isRead ? 'border-l-4 border-l-gold' : ''}`}>
                <div className="flex gap-3 items-start">
                  <div className="mt-0.5">{iconMap[n.type]}</div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm ${!n.isRead ? 'font-semibold' : 'font-medium'}`}>{n.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>

                    {/* Consultation details */}
                    {cd && (
                      <div className="mt-3 rounded-lg bg-muted p-3 space-y-2">
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                          <span><span className="text-muted-foreground">Type:</span> {cd.sessionType}</span>
                          <span><span className="text-muted-foreground">Date:</span> {new Date(cd.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          <span><span className="text-muted-foreground">Time:</span> {cd.time}</span>
                          <span><span className="text-muted-foreground">Case:</span> {cd.caseNumber}</span>
                        </div>

                        {/* Lawyer: accept/decline pending requests */}
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

                        {/* Accepted — show meet link */}
                        {currentStatus === 'accepted' && (
                          <div className="flex items-center gap-2 pt-1">
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
                              <CheckCircle className="h-3 w-3" /> Accepted
                            </span>
                            {cd.meetLink && (
                              <a
                                href={cd.meetLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-medium text-gold hover:underline"
                              >
                                <ExternalLink className="h-3 w-3" /> Join Google Meet
                              </a>
                            )}
                            {/* If just accepted by lawyer, show generated link */}
                            {isLawyer && statuses[n.id] === 'accepted' && !cd.meetLink && (
                              <a
                                href="https://meet.google.com/new-generated-link"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-medium text-gold hover:underline"
                              >
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
      </div>
    </DashboardLayout>
  );
};

export default UserNotifications;
