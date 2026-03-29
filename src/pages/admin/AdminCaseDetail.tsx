import { useParams, Link } from 'react-router-dom';
import { AdminLayout } from '@/layouts/AdminLayout';
import { mockCases, mockLawyers } from '@/lib/mock-data';
import { StatusBadge } from '@/components/StatusBadge';
import { DocumentList } from '@/components/DocumentList';
import { SearchableSelect } from '@/components/SearchableSelect';
import { LEGAL_CATEGORIES } from '@/types';
import { User, Scale, ChevronLeft, CheckCircle, XCircle, RotateCcw, StickyNote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { InternalNotesDrawer } from '@/components/InternalNotesDrawer';

const AdminCaseDetail = () => {
  const { id } = useParams();
  const caseData = mockCases.find((c) => c.id === id);
  const { toast } = useToast();
  const [selectedLawyer, setSelectedLawyer] = useState(caseData?.lawyerId || '');
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [closeReason, setCloseReason] = useState('');
  const [notesDrawerOpen, setNotesDrawerOpen] = useState(false);
  const [internalNotes, setInternalNotes] = useState<{ text: string; by: string; at: string }[]>([
    { text: 'Ancestral property — multiple legal heirs involved', by: 'Platform Admin', at: '2024-09-03T14:00:00' },
  ]);

  if (!caseData) return (
    <AdminLayout>
      <div className="py-16 text-center">
        <p className="text-muted-foreground">Case not found.</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link to="/admin/cases"><ChevronLeft className="mr-1 h-4 w-4" />Back to Cases</Link>
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin/cases"><ChevronLeft className="mr-1 h-4 w-4" />Back to Cases</Link>
        </Button>

        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm text-muted-foreground">{caseData.caseNumber}</span>
              <StatusBadge status={caseData.status} />
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                caseData.priority === 'urgent' ? 'bg-destructive/10 text-destructive' :
                caseData.priority === 'high' ? 'bg-warning/10 text-warning' :
                'bg-muted text-muted-foreground'
              }`}>
                {caseData.priority}
              </span>
            </div>
            <h1 className="mt-1.5 text-xl font-bold sm:text-2xl">{caseData.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{LEGAL_CATEGORIES[caseData.category]}</p>
          </div>
          <div className="flex gap-2">
            {caseData.status !== 'closed' && caseData.status !== 'resolved' && (
              <>
                <Button variant="outline" size="sm" onClick={() => {
                  toast({ title: 'Case Finalized', description: `Case ${caseData.caseNumber} marked as resolved.` });
                }}>
                  <CheckCircle className="mr-1.5 h-3.5 w-3.5" />Finalize
                </Button>
                <Button variant="outline" size="sm" onClick={handleResetCase}>
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" />Reset
                </Button>
                <Button variant="destructive" size="sm" onClick={() => setCloseDialogOpen(true)}>
                  <XCircle className="mr-1.5 h-3.5 w-3.5" />Close Case
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="rounded-xl border bg-card p-5">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Description</h3>
              <p className="text-sm leading-relaxed">{caseData.description}</p>
            </div>

            {/* Assign Lawyer */}
            <div className="rounded-xl border bg-card p-5">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Assign Lawyer</h3>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <SearchableSelect
                    options={lawyerOptions}
                    value={selectedLawyer}
                    onValueChange={setSelectedLawyer}
                    placeholder="Search and select a lawyer..."
                  />
                </div>
                <Button onClick={handleAssign} disabled={!selectedLawyer}>Assign</Button>
              </div>
              {caseData.lawyerName && (
                <p className="mt-3 text-sm text-muted-foreground">Currently assigned: <span className="font-medium text-foreground">{caseData.lawyerName}</span></p>
              )}
            </div>

            {/* Communication History */}
            <div className="rounded-xl border bg-card flex flex-col" style={{ height: '500px' }}>
              <div className="border-b p-4 shrink-0">
                <h3 className="text-sm font-semibold">Communication History</h3>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {caseData.messages.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">No messages yet.</p>
                ) : caseData.messages.map((m) => (
                  <div key={m.id} className={`flex gap-3 ${m.senderRole === 'user' ? '' : 'flex-row-reverse'}`}>
                    <div className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center ${m.senderRole === 'lawyer' ? 'bg-gold/20 text-gold' : 'bg-muted text-muted-foreground'}`}>
                      {m.senderRole === 'lawyer' ? <Scale className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                    </div>
                    <div className={`max-w-[75%] rounded-xl px-4 py-2.5 text-sm ${m.senderRole === 'user' ? 'bg-muted' : 'bg-navy text-primary-foreground'}`}>
                      <p className="mb-0.5 text-xs font-medium opacity-70">{m.senderName}</p>
                      <p>{m.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="rounded-xl border bg-card p-5">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Client</h3>
              <p className="font-medium text-sm">{caseData.userName}</p>
              <Link to={`/admin/users/${caseData.userId}`} className="text-xs text-gold hover:underline">View profile →</Link>
            </div>

            {caseData.lawyerName && (
              <div className="rounded-xl border bg-card p-5">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Assigned Lawyer</h3>
                <p className="font-medium text-sm">{caseData.lawyerName}</p>
                <Link to={`/admin/lawyers/${caseData.lawyerId}`} className="text-xs text-gold hover:underline">View profile →</Link>
              </div>
            )}

            <div className="rounded-xl border bg-card p-5">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Documents</h3>
              <DocumentList documents={caseData.documents} />
            </div>

            {/* Internal Notes */}
            <div className="rounded-xl border bg-card p-5">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                <StickyNote className="h-3.5 w-3.5" /> Internal Notes
              </h3>
              <div className="max-h-[200px] overflow-y-auto space-y-2 mb-3">
                {internalNotes.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No notes yet.</p>
                ) : internalNotes.map((n, i) => (
                  <div key={i} className="rounded-lg bg-muted/50 p-2.5 text-xs">
                    <p>{n.text}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">{n.by} • {new Date(n.at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5">
                <Input
                  placeholder="Add a note..."
                  value={internalNote}
                  onChange={e => setInternalNote(e.target.value)}
                  className="text-xs h-8"
                  onKeyDown={e => e.key === 'Enter' && handleAddNote()}
                />
                <Button size="sm" variant="outline" className="h-8 text-xs" onClick={handleAddNote}>Add</Button>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-5">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Dates</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{new Date(caseData.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span>{new Date(caseData.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
    </AdminLayout>
  );
};

export default AdminCaseDetail;
