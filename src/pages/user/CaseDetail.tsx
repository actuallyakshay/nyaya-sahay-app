import { useParams, Link } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { mockCases } from '@/lib/mock-data';
import { StatusBadge } from '@/components/StatusBadge';
import { LEGAL_CATEGORIES } from '@/types';
import { Send, User, Scale, Upload, Video, Phone, Calendar, ExternalLink, StickyNote, FileText, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InternalNotesDrawer } from '@/components/InternalNotesDrawer';
import { DocumentsDrawer } from '@/components/DocumentsDrawer';
import { TimelineDrawer } from '@/components/TimelineDrawer';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

const CaseDetail = () => {
  const { id } = useParams();
  const caseData = mockCases.find((c) => c.id === id);
  const [message, setMessage] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [sessionType, setSessionType] = useState('video');
  const [notesDrawerOpen, setNotesDrawerOpen] = useState(false);
  const [docsDrawerOpen, setDocsDrawerOpen] = useState(false);
  const [timelineDrawerOpen, setTimelineDrawerOpen] = useState(false);
  const [internalNotes, setInternalNotes] = useState<{ text: string; by: string; at: string }[]>([
    { text: 'Ancestral property — multiple legal heirs involved', by: 'Adv. Priya Sharma', at: '2024-09-03T14:00:00' },
    { text: 'Mutation pending since 2019, recommend civil suit', by: 'Platform Admin', at: '2024-09-04T10:00:00' },
  ]);

  const [meetingLink] = useState('https://meet.google.com/abc-defg-hij');
  const hasMeeting = caseData?.status === 'in_consultation';

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      toast({ title: 'Documents uploaded', description: `${files.length} file(s) uploaded successfully.` });
    }
  };

  const handleBookSession = () => {
    toast({ title: 'Session Booked', description: `Your ${sessionType} consultation request has been sent for admin approval.` });
    setBookingOpen(false);
  };

  const handleAddNote = (note: { text: string; by: string; at: string }) => {
    setInternalNotes(prev => [...prev, note]);
  };

  if (!caseData) return (
    <DashboardLayout>
      <div className="py-16 text-center">
        <p className="text-muted-foreground">Case not found.</p>
      </div>
    </DashboardLayout>
  );

  const isLawyer = user?.role === 'lawyer';
  const isUser = user?.role === 'user';
  const isAdmin = user?.role === 'admin';
  const canSeeNotes = isLawyer || isAdmin;
  const lawyerProfileLink = isUser && caseData.lawyerId ? `/app/lawyers/${caseData.lawyerId}` : undefined;

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm text-muted-foreground">{caseData.caseNumber}</span>
            <StatusBadge status={caseData.status} />
            {caseData.priority === 'urgent' && (
              <span className="rounded-full bg-destructive/10 text-destructive px-2 py-0.5 text-xs font-medium">Urgent</span>
            )}
          </div>
          <h1 className="mt-1 text-xl font-bold sm:text-2xl">{caseData.title}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground leading-relaxed">{caseData.description}</p>
        </div>

        {/* Action bar */}
        <div className="flex flex-wrap items-center gap-2">
          {caseData.lawyerName && !isLawyer && (
            lawyerProfileLink ? (
              <Link to={lawyerProfileLink} className="inline-flex items-center gap-1.5 rounded-full bg-gold/10 text-gold px-3 py-1 text-xs font-medium hover:bg-gold/20 transition-colors">
                <Scale className="h-3 w-3" />{caseData.lawyerName}
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/10 text-gold px-3 py-1 text-xs font-medium">
                <Scale className="h-3 w-3" />{caseData.lawyerName}
              </span>
            )
          )}
          {isLawyer && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              <User className="h-3 w-3" />Client: {caseData.userName}
            </span>
          )}
          <span className="text-xs text-muted-foreground">{LEGAL_CATEGORIES[caseData.category]}</span>
          <div className="flex-1" />

          <TooltipProvider delayDuration={300}>
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDocsDrawerOpen(true)}>
                    <FileText className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Documents ({caseData.documents.length})</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setTimelineDrawerOpen(true)}>
                    <Clock className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Timeline</TooltipContent>
              </Tooltip>

              {canSeeNotes && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setNotesDrawerOpen(true)}>
                      <StickyNote className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Internal Notes ({internalNotes.length})</TooltipContent>
                </Tooltip>
              )}

              {caseData.lawyerName && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setBookingOpen(true)}>
                      <Video className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Book Session</TooltipContent>
                </Tooltip>
              )}
            </div>
          </TooltipProvider>
        </div>

        {/* Meeting link banner */}
        {hasMeeting && (
          <div className="rounded-lg border border-gold/30 bg-gold/5 p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Video className="h-4 w-4 text-gold" />
              <span className="font-medium">Active consultation session</span>
            </div>
            <a href={meetingLink} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gold hover:underline">
              <ExternalLink className="h-3.5 w-3.5" /> Join Google Meet
            </a>
          </div>
        )}

        {/* Chat — full width now */}
        <div className="rounded-xl border bg-card flex flex-col" style={{ height: '600px' }}>
          <div className="border-b p-3 shrink-0 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Case Communication</h3>
            <span className="text-xs text-muted-foreground">{caseData.messages.length} messages</span>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {caseData.messages.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No messages yet. Start the conversation.</p>
            ) : caseData.messages.map((m) => (
              <div key={m.id} className={`flex gap-3 ${m.senderRole === 'user' ? '' : 'flex-row-reverse'}`}>
                <div className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center ${m.senderRole === 'lawyer' ? 'bg-gold/20 text-gold' : 'bg-muted text-muted-foreground'}`}>
                  {m.senderRole === 'lawyer' ? <Scale className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                </div>
                <div className={`max-w-[75%] rounded-xl px-4 py-2.5 text-sm ${m.senderRole === 'user' ? 'bg-muted' : 'bg-navy text-primary-foreground'}`}>
                  <p className="mb-0.5 text-xs font-medium opacity-70">{m.senderName}</p>
                  <p>{m.content}</p>
                  <p className="mt-1 text-[10px] opacity-50">{new Date(m.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t p-3 flex gap-2 shrink-0">
            <Input placeholder="Type a message..." value={message} onChange={(e) => setMessage(e.target.value)} className="flex-1" />
            <input ref={fileInputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="hidden" onChange={handleUpload} />
            <Button size="icon" variant="ghost" onClick={() => fileInputRef.current?.click()}><Upload className="h-4 w-4" /></Button>
            <Button size="icon"><Send className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>

      {/* Booking dialog */}
      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book Consultation</DialogTitle>
            <DialogDescription>Schedule a session with {caseData.lawyerName}. The request will be sent to admin for approval.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Session Type</Label>
              <Select value={sessionType} onValueChange={setSessionType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="video"><div className="flex items-center gap-2"><Video className="h-3.5 w-3.5" /> Video Call</div></SelectItem>
                  <SelectItem value="phone"><div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> Phone Call</div></SelectItem>
                  <SelectItem value="chat"><div className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5" /> Chat Session</div></SelectItem>
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
            <Button className="w-full" onClick={handleBookSession}>Send Booking Request</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Drawers */}
      <DocumentsDrawer
        open={docsDrawerOpen}
        onOpenChange={setDocsDrawerOpen}
        documents={caseData.documents}
        onUploadClick={() => { setDocsDrawerOpen(false); fileInputRef.current?.click(); }}
      />

      <TimelineDrawer
        open={timelineDrawerOpen}
        onOpenChange={setTimelineDrawerOpen}
        events={caseData.timeline}
      />

      {canSeeNotes && (
        <InternalNotesDrawer
          open={notesDrawerOpen}
          onOpenChange={setNotesDrawerOpen}
          notes={internalNotes}
          onAddNote={handleAddNote}
          currentUserName={user?.name || 'Unknown'}
        />
      )}
    </DashboardLayout>
  );
};

export default CaseDetail;
