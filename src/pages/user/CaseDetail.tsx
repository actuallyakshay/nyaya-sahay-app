import { CaseTimeline } from '@/components/CaseTimeline';
import { DocumentList } from '@/components/DocumentList';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { getCookie } from '@/lib/helpers';
import { mockCases } from '@/lib/mock-data';
import { LEGAL_CATEGORIES } from '@/types';
import {
  Calendar,
  ExternalLink,
  Phone,
  Scale,
  Send,
  Upload,
  User,
  Video,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

const CaseDetail = () => {
  const { id } = useParams();
  console.log('Case ID from URL:', id);
  console.log(
    'Available mock case IDs:',
    mockCases.map((c) => c.id)
  );

  const caseData = mockCases.find((c) => c.id === id);
  console.log('Found case data:', caseData);

  // Temporary fallback - use first case if no match found
  const fallbackCaseData = caseData || mockCases[0];

  const [message, setMessage] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [sessionType, setSessionType] = useState('video');

  // Mock meeting link (shows when consultation is booked)
  const [meetingLink] = useState('https://meet.google.com/abc-defg-hij');
  const hasMeeting = fallbackCaseData?.status === 'in_consultation';

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      toast({
        title: 'Documents uploaded',
        description: `${files.length} file(s) uploaded successfully.`,
      });
    }
  };

  const handleBookSession = () => {
    toast({
      title: 'Session Booked',
      description: `Your ${sessionType} consultation request has been sent to the lawyer.`,
    });
    setBookingOpen(false);
  };

  if (!fallbackCaseData)
    return (
      <DashboardLayout>
        <div className="py-16 text-center">
          <p className="text-muted-foreground">Case not found.</p>
          <p className="mt-2 text-xs text-muted-foreground">ID: {id}</p>
        </div>
      </DashboardLayout>
    );

  const isLawyer = getCookie('x-active-role') === 'lawyer';
  const isUser = getCookie('x-active-role') === 'user';
  const lawyerProfileLink =
    isUser && fallbackCaseData.lawyerId
      ? `/app/lawyers/${fallbackCaseData.lawyerId}`
      : undefined;

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header — compact */}
        <div>
          {!caseData && (
            <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
              <p className="text-sm text-yellow-800">
                Debug: Using fallback case data (ID mismatch: {id} vs{' '}
                {fallbackCaseData.id})
              </p>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm text-muted-foreground">
              {fallbackCaseData.caseNumber}
            </span>
            <StatusBadge status={fallbackCaseData.status} />
            {fallbackCaseData.priority === 'urgent' && (
              <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                Urgent
              </span>
            )}
          </div>
          <h1 className="mt-1 text-xl font-bold sm:text-2xl">
            {fallbackCaseData.title}
          </h1>
          <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
            {fallbackCaseData.description}
            ''{' '}
          </p>
        </div>

        {/* Action bar — compact */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Assigned lawyer — small chip */}
          {fallbackCaseData.lawyerName &&
            !isLawyer &&
            (lawyerProfileLink ? (
              <Link
                to={lawyerProfileLink}
                className="inline-flex items-center gap-1.5 rounded-full bg-gold/10 px-3 py-1 text-xs font-medium text-gold transition-colors hover:bg-gold/20"
              >
                <Scale className="h-3 w-3" />
                {fallbackCaseData.lawyerName}
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/10 px-3 py-1 text-xs font-medium text-gold">
                <Scale className="h-3 w-3" />
                {fallbackCaseData.lawyerName}
              </span>
            ))}

          {/* Client name — for lawyer view */}
          {isLawyer && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              <User className="h-3 w-3" />
              Client: {fallbackCaseData.userName}
            </span>
          )}

          <span className="text-xs text-muted-foreground">
            {LEGAL_CATEGORIES[fallbackCaseData.category]}
          </span>

          <div className="flex-1" />

          {fallbackCaseData.lawyerName && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBookingOpen(true)}
            >
              <Video className="mr-1.5 h-3.5 w-3.5" /> Book Session
            </Button>
          )}
        </div>

        {/* Meeting link banner */}
        {hasMeeting && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-gold/30 bg-gold/5 p-3">
            <div className="flex items-center gap-2 text-sm">
              <Video className="h-4 w-4 text-gold" />
              <span className="font-medium">Active consultation session</span>
            </div>
            <a
              href={meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gold hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Join Google Meet
            </a>
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-4">
          {/* Chat — main focus, takes 3 cols */}
          <div
            className="flex flex-col rounded-xl border bg-card lg:col-span-3"
            style={{ height: '600px' }}
          >
            <div className="flex shrink-0 items-center justify-between border-b p-3">
              <h3 className="text-sm font-semibold">Case Communication</h3>
              <span className="text-xs text-muted-foreground">
                {fallbackCaseData.messages.length} messages
              </span>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {fallbackCaseData.messages.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No messages yet. Start the conversation.
                </p>
              ) : (
                fallbackCaseData.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex gap-3 ${m.senderRole === 'user' ? '' : 'flex-row-reverse'}`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${m.senderRole === 'lawyer' ? 'bg-gold/20 text-gold' : 'bg-muted text-muted-foreground'}`}
                    >
                      {m.senderRole === 'lawyer' ? (
                        <Scale className="h-3.5 w-3.5" />
                      ) : (
                        <User className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <div
                      className={`max-w-[75%] rounded-xl px-4 py-2.5 text-sm ${m.senderRole === 'user' ? 'bg-muted' : 'bg-navy text-primary-foreground'}`}
                    >
                      <p className="mb-0.5 text-xs font-medium opacity-70">
                        {m.senderName}
                      </p>
                      <p>{m.content}</p>
                      <p className="mt-1 text-[10px] opacity-50">
                        {new Date(m.timestamp).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex shrink-0 gap-2 border-t p-3">
              <Input
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1"
              />
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                className="hidden"
                onChange={handleUpload}
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
              </Button>
              <Button size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Sidebar — compact, 1 col */}
          <div className="space-y-4">
            {/* Documents */}
            <div className="rounded-xl border bg-card p-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Documents
              </h3>
              <DocumentList documents={fallbackCaseData.documents} />
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full text-xs"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-1.5 h-3 w-3" /> Upload
              </Button>
            </div>

            {/* Timeline — compact */}
            <div className="rounded-xl border bg-card p-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Timeline
              </h3>
              <div className="max-h-[200px] overflow-y-auto">
                <CaseTimeline events={fallbackCaseData.timeline} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking dialog */}
      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book Consultation</DialogTitle>
            <DialogDescription>
              Schedule a session with {fallbackCaseData.lawyerName}. The lawyer
              will receive a notification.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Session Type</Label>
              <Select value={sessionType} onValueChange={setSessionType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">
                    <div className="flex items-center gap-2">
                      <Video className="h-3.5 w-3.5" /> Video Call
                    </div>
                  </SelectItem>
                  <SelectItem value="phone">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5" /> Phone Call
                    </div>
                  </SelectItem>
                  <SelectItem value="chat">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" /> Chat Session
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Preferred Date</Label>
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <Label>Preferred Time</Label>
              <Input type="time" />
            </div>
            <Button className="w-full" onClick={handleBookSession}>
              Send Booking Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default CaseDetail;
