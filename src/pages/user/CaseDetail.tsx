import { useParams, Link } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { mockCases, mockLawyers } from '@/lib/mock-data';
import { StatusBadge } from '@/components/StatusBadge';
import { LEGAL_CATEGORIES, CASE_STATUS_LABELS } from '@/types';
import type { CaseStatus } from '@/types';
import {
  Send, User, Scale, Video, Phone, Calendar, ExternalLink,
  StickyNote, FileText, Clock, MessageSquare, Upload,
  ChevronRight, Shield, MapPin, Star, Briefcase
} from 'lucide-react';
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
import { Card, CardContent } from '@/components/ui/card';

// Progress steps
const STATUS_FLOW: CaseStatus[] = ['new', 'under_review', 'lawyer_assigned', 'in_consultation', 'resolved'];

const getStepIndex = (status: CaseStatus) => {
  if (status === 'closed') return STATUS_FLOW.length;
  if (status === 'emergency') return -1;
  if (status === 'waiting_for_user') return STATUS_FLOW.indexOf('in_consultation');
  return STATUS_FLOW.indexOf(status);
};

const CaseDetail = () => {
  const { id } = useParams();
  const caseData = mockCases.find((c) => c.id === id);
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

  const lawyer = caseData.lawyerId ? mockLawyers.find(l => l.id === caseData.lawyerId) : undefined;
  const currentStep = getStepIndex(caseData.status);
  const lastActivity = caseData.timeline.length > 0
    ? new Date(caseData.timeline[caseData.timeline.length - 1].timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

  return (
    <DashboardLayout>
      <div className="space-y-5">

        {/* ── Header ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-mono text-xs text-muted-foreground">{caseData.caseNumber}</span>
              <StatusBadge status={caseData.status} />
              {caseData.priority === 'urgent' && (
                <span className="rounded-full bg-destructive/10 text-destructive px-2 py-0.5 text-xs font-medium">Urgent</span>
              )}
              {caseData.priority === 'high' && (
                <span className="rounded-full bg-orange-500/10 text-orange-600 px-2 py-0.5 text-xs font-medium">High Priority</span>
              )}
            </div>
            <h1 className="text-lg font-bold sm:text-xl leading-tight">{caseData.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed max-w-2xl">{caseData.description}</p>
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-2 shrink-0">
            {caseData.lawyerName && (
              <Button variant="outline" size="sm" onClick={() => setBookingOpen(true)}>
                <Video className="mr-1.5 h-3.5 w-3.5" /> Book Session
              </Button>
            )}
          </div>
        </div>

        {/* ── Meeting banner ── */}
        {hasMeeting && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Video className="h-4 w-4 text-emerald-600" />
              <span className="font-medium text-emerald-800">Active consultation session</span>
            </div>
            <a href={meetingLink} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:underline">
              <ExternalLink className="h-3.5 w-3.5" /> Join Meeting
            </a>
          </div>
        )}

        {/* ── Progress Tracker ── */}
        {caseData.status !== 'emergency' && (
          <Card>
            <CardContent className="pt-5 pb-4">
              <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Case Progress</p>
              <div className="flex items-center gap-1">
                {STATUS_FLOW.map((step, i) => {
                  const isComplete = i < currentStep;
                  const isCurrent = i === currentStep;
                  return (
                    <div key={step} className="flex items-center flex-1 last:flex-none">
                      <div className="flex flex-col items-center gap-1.5 min-w-0">
                        <div className={`h-3 w-3 rounded-full shrink-0 transition-colors ${
                          isComplete ? 'bg-primary' : isCurrent ? 'bg-primary ring-4 ring-primary/20' : 'bg-muted-foreground/20'
                        }`} />
                        <span className={`text-[10px] leading-tight text-center hidden sm:block ${
                          isCurrent ? 'font-semibold text-foreground' : isComplete ? 'text-muted-foreground' : 'text-muted-foreground/50'
                        }`}>
                          {CASE_STATUS_LABELS[step]}
                        </span>
                      </div>
                      {i < STATUS_FLOW.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-1 rounded-full ${
                          isComplete ? 'bg-primary' : 'bg-muted-foreground/15'
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Info Grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setDocsDrawerOpen(true)}>
            <CardContent className="p-4 flex flex-col items-center text-center gap-1.5">
              <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-lg font-bold">{caseData.documents.length}</span>
              <span className="text-xs text-muted-foreground">Documents</span>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setTimelineDrawerOpen(true)}>
            <CardContent className="p-4 flex flex-col items-center text-center gap-1.5">
              <div className="h-9 w-9 rounded-full bg-purple-50 flex items-center justify-center">
                <Clock className="h-4 w-4 text-purple-600" />
              </div>
              <span className="text-lg font-bold">{caseData.timeline.length}</span>
              <span className="text-xs text-muted-foreground">Timeline Events</span>
            </CardContent>
          </Card>

          <Link
            to={`${isLawyer ? '/lawyer' : '/app'}/cases/${id}/chat`}
            className="block"
          >
            <Card className="h-full hover:bg-muted/30 transition-colors">
              <CardContent className="p-4 flex flex-col items-center text-center gap-1.5">
                <div className="h-9 w-9 rounded-full bg-emerald-50 flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-emerald-600" />
                </div>
                <span className="text-lg font-bold">{caseData.messages.length}</span>
                <span className="text-xs text-muted-foreground">Messages</span>
              </CardContent>
            </Card>
          </Link>

          {canSeeNotes ? (
            <Card className="cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setNotesDrawerOpen(true)}>
              <CardContent className="p-4 flex flex-col items-center text-center gap-1.5">
                <div className="h-9 w-9 rounded-full bg-amber-50 flex items-center justify-center">
                  <StickyNote className="h-4 w-4 text-amber-600" />
                </div>
                <span className="text-lg font-bold">{internalNotes.length}</span>
                <span className="text-xs text-muted-foreground">Internal Notes</span>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-4 flex flex-col items-center text-center gap-1.5">
                <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="text-xs font-medium">{lastActivity}</span>
                <span className="text-xs text-muted-foreground">Last Activity</span>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── Two-column: Lawyer + Details ── */}
        <div className="grid gap-4 md:grid-cols-5">
          {/* Lawyer Card */}
          <Card className="md:col-span-2">
            <CardContent className="p-5">
              <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Assigned Lawyer</p>
              {lawyer ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                      {lawyer.name.split(' ').pop()?.[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{lawyer.name}</p>
                      {lawyer.firm && <p className="text-xs text-muted-foreground">{lawyer.firm}</p>}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Star className="h-3.5 w-3.5 text-amber-500" />
                      <span>{lawyer.rating} rating · {lawyer.casesHandled} cases</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Briefcase className="h-3.5 w-3.5" />
                      <span>{lawyer.experience} years experience</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{lawyer.city}, {lawyer.state}</span>
                    </div>
                    {lawyer.isVerified && (
                      <div className="flex items-center gap-2 text-emerald-600">
                        <Shield className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium">Verified Advocate</span>
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <Link to={`/app/lawyers/${lawyer.id}`}>
                      <Button variant="outline" size="sm" className="w-full mt-1">
                        View Full Profile <ChevronRight className="ml-1 h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="h-12 w-12 rounded-full bg-muted mx-auto flex items-center justify-center mb-2">
                    <Scale className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">No lawyer assigned yet</p>
                  <p className="text-xs text-muted-foreground mt-1">A lawyer will be assigned after review</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Case Details */}
          <Card className="md:col-span-3">
            <CardContent className="p-5">
              <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Case Details</p>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Category</p>
                  <p className="font-medium">{LEGAL_CATEGORIES[caseData.category]}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Priority</p>
                  <p className="font-medium capitalize">{caseData.priority}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Filed On</p>
                  <p className="font-medium">{new Date(caseData.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Last Updated</p>
                  <p className="font-medium">{new Date(caseData.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                {isLawyer && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground text-xs">Client</p>
                    <p className="font-medium flex items-center gap-1.5"><User className="h-3.5 w-3.5" />{caseData.userName}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Quick Actions Row ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link to={`${isLawyer ? '/lawyer' : '/app'}/cases/${id}/chat`}>
            <Card className="hover:border-primary/30 hover:bg-primary/5 transition-colors cursor-pointer h-full">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Send className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">Open Chat</p>
                  <p className="text-xs text-muted-foreground">Communicate with {isLawyer ? 'client' : 'your lawyer'}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </CardContent>
            </Card>
          </Link>

          <Card className="hover:border-primary/30 hover:bg-primary/5 transition-colors cursor-pointer h-full" onClick={() => {
            setDocsDrawerOpen(false);
            fileInputRef.current?.click();
          }}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Upload className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">Upload Document</p>
                <p className="text-xs text-muted-foreground">Add files to this case</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </CardContent>
          </Card>
        </div>

        {/* ── Recent Activity (last 3 timeline events) ── */}
        {caseData.timeline.length > 0 && (
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Recent Activity</p>
                <button onClick={() => setTimelineDrawerOpen(true)} className="text-xs text-primary font-medium hover:underline">
                  View All →
                </button>
              </div>
              <div className="space-y-3">
                {caseData.timeline.slice(-3).reverse().map((event) => (
                  <div key={event.id} className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{event.description} · {new Date(event.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleUpload} />

      {/* Booking dialog */}
      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book Consultation</DialogTitle>
            <DialogDescription>Schedule a session with {caseData.lawyerName}.</DialogDescription>
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
