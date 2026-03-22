import { useParams, Link } from 'react-router-dom';
import { AdminLayout } from '@/layouts/AdminLayout';
import { mockCases, mockLawyers } from '@/lib/mock-data';
import { StatusBadge } from '@/components/StatusBadge';
import { CaseTimeline } from '@/components/CaseTimeline';
import { DocumentList } from '@/components/DocumentList';
import { SearchableSelect } from '@/components/SearchableSelect';
import { LEGAL_CATEGORIES } from '@/types';
import { User, Scale, ChevronLeft, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const AdminCaseDetail = () => {
  const { id } = useParams();
  const caseData = mockCases.find((c) => c.id === id);
  const { toast } = useToast();
  const [selectedLawyer, setSelectedLawyer] = useState(caseData?.lawyerId || '');
  const [newStatus, setNewStatus] = useState(caseData?.status || '');
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [closeReason, setCloseReason] = useState('');
  const [adminNote, setAdminNote] = useState('');

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
    sublabel: `${l.specializations.map(s => LEGAL_CATEGORIES[s]).join(', ')} • ${l.rating}★ • ${l.experience} yrs`,
  }));

  const handleAssign = () => {
    const lawyer = mockLawyers.find(l => l.id === selectedLawyer);
    if (lawyer) {
      toast({ title: 'Lawyer Assigned', description: `${lawyer.name} assigned to case ${caseData.caseNumber}` });
    }
  };

  const handleStatusChange = () => {
    if (newStatus && newStatus !== caseData.status) {
      toast({ title: 'Status Updated', description: `Case status changed to ${newStatus}` });
    }
  };

  const handleCloseCase = () => {
    toast({ title: 'Case Closed', description: `Case ${caseData.caseNumber} has been closed.` });
    setCloseDialogOpen(false);
    setCloseReason('');
  };

  const handleAddNote = () => {
    if (adminNote.trim()) {
      toast({ title: 'Note Added', description: 'Admin note has been added to the case.' });
      setAdminNote('');
    }
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
                  <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                  Finalize
                </Button>
                <Button variant="destructive" size="sm" onClick={() => setCloseDialogOpen(true)}>
                  <XCircle className="mr-1.5 h-3.5 w-3.5" />
                  Close Case
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

            {/* Assign Lawyer — searchable */}
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

            {/* Update Status */}
            <div className="rounded-xl border bg-card p-5">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Update Status</h3>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger><SelectValue placeholder="Select status..." /></SelectTrigger>
                    <SelectContent>
                      {['new','under_review','lawyer_assigned','in_consultation','waiting_for_user','resolved','closed','emergency'].map(s => (
                        <SelectItem key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleStatusChange} disabled={!newStatus || newStatus === caseData.status}>Update</Button>
              </div>
            </div>

            {/* Admin Notes */}
            <div className="rounded-xl border bg-card p-5">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Admin Notes</h3>
              {caseData.notes.length > 0 && (
                <ul className="space-y-1.5 mb-4">
                  {caseData.notes.map((n, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-warning" />
                      {n}
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex flex-col gap-2 sm:flex-row">
                <Textarea
                  placeholder="Add a note..."
                  className="flex-1 min-h-[60px]"
                  value={adminNote}
                  onChange={e => setAdminNote(e.target.value)}
                />
                <Button onClick={handleAddNote} disabled={!adminNote.trim()} className="sm:self-end">
                  Add Note
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="rounded-xl border bg-card">
              <div className="border-b p-4">
                <h3 className="text-sm font-semibold">Communication History</h3>
              </div>
              <div className="max-h-[400px] space-y-3 overflow-y-auto p-4">
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
            {/* Client */}
            <div className="rounded-xl border bg-card p-5">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Client</h3>
              <p className="font-medium text-sm">{caseData.userName}</p>
              <Link to={`/admin/users/${caseData.userId}`} className="text-xs text-gold hover:underline">View profile →</Link>
            </div>

            {/* Lawyer */}
            {caseData.lawyerName && (
              <div className="rounded-xl border bg-card p-5">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Assigned Lawyer</h3>
                <p className="font-medium text-sm">{caseData.lawyerName}</p>
                <Link to={`/admin/lawyers/${caseData.lawyerId}`} className="text-xs text-gold hover:underline">View profile →</Link>
              </div>
            )}

            {/* Documents */}
            <div className="rounded-xl border bg-card p-5">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Documents</h3>
              <DocumentList documents={caseData.documents} />
            </div>

            {/* Dates */}
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

            {/* Timeline */}
            <div className="rounded-xl border bg-card p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Timeline</h3>
              <CaseTimeline events={caseData.timeline} />
            </div>
          </div>
        </div>
      </div>

      {/* Close Case Dialog */}
      <Dialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close Case</DialogTitle>
            <DialogDescription>This will permanently close case {caseData.caseNumber}. Please provide a reason.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Textarea
              placeholder="Reason for closing..."
              value={closeReason}
              onChange={e => setCloseReason(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCloseDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleCloseCase} disabled={!closeReason.trim()}>
                Close Case
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminCaseDetail;
