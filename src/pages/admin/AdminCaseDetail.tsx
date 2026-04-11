import { useParams, Link } from 'react-router-dom';
import { AdminLayout } from '@/layouts/AdminLayout';
import { mockCases, mockLawyers } from '@/lib/mock-data';
import { StatusBadge } from '@/components/StatusBadge';
import { SearchableSelect } from '@/components/SearchableSelect';
import { LEGAL_CATEGORIES } from '@/types';
import { User, Scale, CheckCircle, XCircle, RotateCcw, StickyNote, FileText, Clock, AlertTriangle, CalendarDays, Hash, Tag, Gavel, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { InternalNotesDrawer } from '@/components/InternalNotesDrawer';
import { DocumentsDrawer } from '@/components/DocumentsDrawer';
import { TimelineDrawer } from '@/components/TimelineDrawer';
import { Badge } from '@/components/ui/badge';

const AdminCaseDetail = () => {
  const { id } = useParams();
  const caseData = mockCases.find((c) => c.id === id);
  const { toast } = useToast();
  const [selectedLawyer, setSelectedLawyer] = useState(caseData?.lawyerId || '');
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [closeReason, setCloseReason] = useState('');
  const [notesDrawerOpen, setNotesDrawerOpen] = useState(false);
  const [docsDrawerOpen, setDocsDrawerOpen] = useState(false);
  const [timelineDrawerOpen, setTimelineDrawerOpen] = useState(false);
  const [internalNotes, setInternalNotes] = useState<{ text: string; by: string; at: string }[]>([
    { text: 'Ancestral property — multiple legal heirs involved', by: 'Platform Admin', at: '2024-09-03T14:00:00' },
  ]);

  if (!caseData) return (
    <AdminLayout>
      <div className="py-16 text-center">
        <p className="text-muted-foreground">Case not found.</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link to="/admin/cases">Back to Cases</Link>
        </Button>
      </div>
    </AdminLayout>
  );

  const lawyerOptions = mockLawyers.filter(l => l.isVerified && l.isAvailable).map(l => ({
    value: l.id,
    label: l.name,
    sublabel: `${l.specializations.map(s => LEGAL_CATEGORIES[s]).join(', ')} • ${l.experience} yrs`,
  }));

  const handleAssign = () => {
    const lawyer = mockLawyers.find(l => l.id === selectedLawyer);
    if (lawyer) {
      toast({ title: 'Lawyer Assigned', description: `${lawyer.name} assigned to case ${caseData.caseNumber}` });
    }
  };

  const handleCloseCase = () => {
    toast({ title: 'Case Closed', description: `Case ${caseData.caseNumber} has been closed.` });
    setCloseDialogOpen(false);
    setCloseReason('');
  };

  const handleResetCase = () => {
    toast({ title: 'Case Reset', description: `Case ${caseData.caseNumber} has been reset to New status.` });
  };

  const handleAddNote = (note: { text: string; by: string; at: string }) => {
    setInternalNotes(prev => [...prev, note]);
  };

  const priorityConfig = {
    urgent: { color: 'bg-destructive/10 text-destructive border-destructive/20', icon: AlertTriangle },
    high: { color: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: AlertTriangle },
    normal: { color: 'bg-muted text-muted-foreground border-border', icon: null },
    low: { color: 'bg-muted text-muted-foreground border-border', icon: null },
  };

  const pConfig = priorityConfig[caseData.priority as keyof typeof priorityConfig] || priorityConfig.normal;

  return (
    <AdminLayout>
      <div className="space-y-4">
        {/* Header card */}
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="border-b bg-muted/30 px-5 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-lg font-bold tracking-tight">{caseData.title}</h1>
              <StatusBadge status={caseData.status} />
              <Badge variant="outline" className={`text-[11px] gap-1 ${pConfig.color}`}>
                {pConfig.icon && <pConfig.icon className="h-3 w-3" />}
                {caseData.priority.toUpperCase()}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5">
              {caseData.status !== 'closed' && caseData.status !== 'resolved' && (
                <>
                  <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => {
                    toast({ title: 'Case Finalized', description: `Case ${caseData.caseNumber} marked as resolved.` });
                  }}>
                    <CheckCircle className="mr-1 h-3.5 w-3.5 text-green-600" />Finalize
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleResetCase}>
                    <RotateCcw className="mr-1 h-3.5 w-3.5" />Reset
                  </Button>
                  <Button variant="destructive" size="sm" className="h-8 text-xs" onClick={() => setCloseDialogOpen(true)}>
                    <XCircle className="mr-1 h-3.5 w-3.5" />Close
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Meta + Lawyer/Client inline */}
          <div className="px-5 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Hash className="h-3.5 w-3.5" />
                <span className="font-mono">{caseData.caseNumber}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" />
                {LEGAL_CATEGORIES[caseData.category]}
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                Created {new Date(caseData.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Updated {new Date(caseData.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <User className="h-3.5 w-3.5" />
                <span className="font-medium text-foreground">{caseData.userName}</span>
                <Link to={`/admin/users/${caseData.userId}`} className="text-primary hover:underline ml-0.5">
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </span>
              {caseData.lawyerName && (
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Gavel className="h-3.5 w-3.5" />
                  <span className="font-medium text-foreground">{caseData.lawyerName}</span>
                  <Link to={`/admin/lawyers/${caseData.lawyerId}`} className="text-primary hover:underline ml-0.5">
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Lawyer assignment + Drawer triggers bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[280px] max-w-md">
            <SearchableSelect
              options={lawyerOptions}
              value={selectedLawyer}
              onValueChange={setSelectedLawyer}
              placeholder="Search lawyer..."
            />
            <Button onClick={handleAssign} disabled={!selectedLawyer} size="sm" className="text-xs shrink-0">
              {caseData.lawyerName ? 'Reassign' : 'Assign'}
            </Button>
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setDocsDrawerOpen(true)}>
              <FileText className="mr-1 h-3.5 w-3.5" />Docs ({caseData.documents.length})
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setTimelineDrawerOpen(true)}>
              <Clock className="mr-1 h-3.5 w-3.5" />Timeline ({caseData.timeline.length})
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setNotesDrawerOpen(true)}>
              <StickyNote className="mr-1 h-3.5 w-3.5" />Notes ({internalNotes.length})
            </Button>
          </div>
        </div>

        {/* Description */}
        <div className="rounded-xl border bg-card p-4">
          <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</h3>
          <p className="text-sm leading-relaxed text-foreground/90">{caseData.description}</p>
        </div>

        {/* Full-width message box */}
        <div className="rounded-xl border bg-card flex flex-col" style={{ height: 'calc(100vh - 420px)', minHeight: '360px' }}>
          <div className="border-b px-4 py-2.5 flex items-center justify-between bg-muted/20">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Messages</h3>
            <span className="text-[11px] text-muted-foreground">{caseData.messages.length} messages</span>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {caseData.messages.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No messages yet.</p>
            ) : caseData.messages.map((m) => (
              <div key={m.id} className={`flex gap-3 ${m.senderRole === 'user' ? '' : 'flex-row-reverse'}`}>
                <div className={`h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold ${m.senderRole === 'lawyer' ? 'bg-gold/20 text-gold' : 'bg-muted text-muted-foreground'}`}>
                  {m.senderRole === 'lawyer' ? <Scale className="h-3 w-3" /> : <User className="h-3 w-3" />}
                </div>
                <div className={`max-w-[75%] rounded-lg px-3.5 py-2 text-sm ${m.senderRole === 'user' ? 'bg-muted' : 'bg-navy text-primary-foreground'}`}>
                  <p className="mb-0.5 text-[11px] font-medium opacity-60">{m.senderName}</p>
                  <p className="text-[13px] leading-relaxed">{m.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dialogs & Drawers */}
      <Dialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close Case</DialogTitle>
            <DialogDescription>This will permanently close case {caseData.caseNumber}. Please provide a reason.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Textarea placeholder="Reason for closing..." value={closeReason} onChange={e => setCloseReason(e.target.value)} />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCloseDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleCloseCase} disabled={!closeReason.trim()}>Close Case</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <InternalNotesDrawer
        open={notesDrawerOpen}
        onOpenChange={setNotesDrawerOpen}
        notes={internalNotes}
        onAddNote={handleAddNote}
        currentUserName="Platform Admin"
      />
      <DocumentsDrawer
        open={docsDrawerOpen}
        onOpenChange={setDocsDrawerOpen}
        documents={caseData.documents}
      />
      <TimelineDrawer
        open={timelineDrawerOpen}
        onOpenChange={setTimelineDrawerOpen}
        events={caseData.timeline}
      />
    </AdminLayout>
  );
};

export default AdminCaseDetail;
