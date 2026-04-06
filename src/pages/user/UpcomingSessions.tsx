import { DashboardLayout } from '@/layouts/DashboardLayout';
import { mockCases } from '@/lib/mock-data';
import { StatusBadge } from '@/components/StatusBadge';
import { LEGAL_CATEGORIES } from '@/types';
import { Video, ExternalLink, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const mockSessions = [
  {
    id: 's1',
    caseId: 'c1',
    caseNumber: 'NYS-2024-001',
    caseTitle: 'Property Dispute — Ancestral Land',
    lawyerName: 'Adv. Priya Sharma',
    type: 'video' as const,
    date: '2026-04-08',
    time: '10:30',
    meetLink: 'https://meet.google.com/abc-defg-hij',
    status: 'confirmed' as const,
  },
  {
    id: 's2',
    caseId: 'c2',
    caseNumber: 'NYS-2024-002',
    caseTitle: 'Consumer Complaint — Defective Product',
    lawyerName: 'Adv. Vikram Desai',
    type: 'phone' as const,
    date: '2026-04-10',
    time: '14:00',
    meetLink: '',
    status: 'pending' as const,
  },
  {
    id: 's3',
    caseId: 'c1',
    caseNumber: 'NYS-2024-001',
    caseTitle: 'Property Dispute — Ancestral Land',
    lawyerName: 'Adv. Priya Sharma',
    type: 'video' as const,
    date: '2026-04-15',
    time: '11:00',
    meetLink: 'https://meet.google.com/xyz-abcd-efg',
    status: 'confirmed' as const,
  },
];

const UpcomingSessions = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Upcoming Sessions</h1>
          <p className="mt-1 text-muted-foreground">Your scheduled consultations with lawyers.</p>
        </div>

        {mockSessions.length === 0 ? (
          <div className="rounded-xl border bg-card p-12 text-center">
            <Calendar className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 text-muted-foreground">No upcoming sessions scheduled.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {mockSessions.map((session) => (
              <div key={session.id} className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-md">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-muted-foreground">{session.caseNumber}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        session.status === 'confirmed'
                          ? 'bg-success/10 text-success'
                          : 'bg-warning/10 text-warning'
                      }`}>
                        {session.status === 'confirmed' ? 'Confirmed' : 'Pending Approval'}
                      </span>
                    </div>
                    <p className="font-medium truncate">{session.caseTitle}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Video className="h-3.5 w-3.5" />
                        {session.type === 'video' ? 'Video Call' : 'Phone Call'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(session.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {session.time}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">with <span className="font-medium text-foreground">{session.lawyerName}</span></p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {session.status === 'confirmed' && session.meetLink && (
                      <a href={session.meetLink} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" className="gap-1.5">
                          <ExternalLink className="h-3.5 w-3.5" /> Join Meeting
                        </Button>
                      </a>
                    )}
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/app/cases/${session.caseId}`}>View Case</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UpcomingSessions;
