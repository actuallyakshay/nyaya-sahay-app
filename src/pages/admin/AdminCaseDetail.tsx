import { useParams, Link } from 'react-router-dom';
import { AdminLayout } from '@/layouts/AdminLayout';
import { mockCases, mockLawyers } from '@/lib/mock-data';
import { StatusBadge } from '@/components/StatusBadge';
import { CaseTimeline } from '@/components/CaseTimeline';
import { LEGAL_CATEGORIES } from '@/types';
import { FileText, User, Scale, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const AdminCaseDetail = () => {
  const { id } = useParams();
  const caseData = mockCases.find((c) => c.id === id);
  const { toast } = useToast();
  const [selectedLawyer, setSelectedLawyer] = useState(caseData?.lawyerId || '');

  if (!caseData) return (
    <AdminLayout>
      <div className="py-16 text-center">
        <p className="text-muted-foreground">Case not found.</p>
        <Button variant="outline" className="mt-4" asChild><Link to="/admin/cases"><ChevronLeft className="mr-1 h-4 w-4" />Back to Cases</Link></Button>
      </div>
    </AdminLayout>
  );

  const roleColorMap: Record<string, { bg: string; label: string }> = {
    user: { bg: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Client' },
    lawyer: { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Lawyer' },
    admin: { bg: 'bg-purple-50 text-purple-700 border-purple-200', label: 'Admin' },
  };

  const handleAssign = () => {
    const lawyer = mockLawyers.find(l => l.id === selectedLawyer);
    if (lawyer) {
      toast({ title: 'Lawyer Assigned', description: `${lawyer.name} assigned to case ${caseData.caseNumber}` });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild><Link to="/admin/cases"><ChevronLeft className="mr-1 h-4 w-4" />Back to Cases</Link></Button>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm text-muted-foreground">{caseData.caseNumber}</span>
              <StatusBadge status={caseData.status} />
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${caseData.priority === 'urgent' ? 'bg-red-50 text-red-700' : caseData.priority === 'high' ? 'bg-amber-50 text-amber-700' : 'bg-muted text-muted-foreground'}`}>
                {caseData.priority}
              </span>
            </div>
            <h1 className="mt-1.5 text-xl font-bold sm:text-2xl">{caseData.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{LEGAL_CATEGORIES[caseData.category]}</p>
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
                  <Select value={selectedLawyer} onValueChange={setSelectedLawyer}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a lawyer..." />
                    </SelectTrigger>
                    <SelectContent>
                      {mockLawyers.filter(l => l.isVerified && l.isAvailable).map(l => (
                        <SelectItem key={l.id} value={l.id}>
                          {l.name} — {l.specializations.map(s => LEGAL_CATEGORIES[s]).join(', ')} ({l.rating}★)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAssign} disabled={!selectedLawyer}>Assign</Button>
              </div>
              {caseData.lawyerName && (
                <p className="mt-3 text-sm text-muted-foreground">Currently assigned: <span className="font-medium text-foreground">{caseData.lawyerName}</span></p>
              )}
            </div>

            {/* Messages */}
            <div className="rounded-xl border bg-card">
              <div className="border-b p-4">
                <h3 className="text-sm font-semibold">Communication History</h3>
              </div>
              <div className="max-h-[500px] space-y-3 overflow-y-auto p-4">
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

            {/* Notes */}
            {caseData.notes.length > 0 && (
              <div className="rounded-xl border bg-card p-5">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Internal Notes</h3>
                <ul className="space-y-2">
                  {caseData.notes.map((n, i) => (
                    <li key={i} className="text-sm text-muted-foreground">• {n}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* User info */}
            <div className="rounded-xl border bg-card p-5">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Client</h3>
              <p className="font-medium text-sm">{caseData.userName}</p>
              <Link to={`/admin/users/${caseData.userId}`} className="text-xs text-gold hover:underline">View profile →</Link>
            </div>

            {/* Lawyer info */}
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
              <div className="space-y-2">
                {caseData.documents.map((d) => {
                  const roleInfo = roleColorMap[d.uploadedByRole] || roleColorMap.user;
                  return (
                    <div key={d.id} className="rounded-lg bg-muted p-2.5">
                      <div className="flex items-center gap-2.5">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-sm truncate flex-1">{d.name}</span>
                      </div>
                      <div className="mt-1.5 flex items-center gap-2 ml-6">
                        <span className={`inline-flex rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${roleInfo.bg}`}>{roleInfo.label}</span>
                        <span className="text-[11px] text-muted-foreground">{d.uploadedByName}</span>
                      </div>
                    </div>
                  );
                })}
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
    </AdminLayout>
  );
};

export default AdminCaseDetail;
