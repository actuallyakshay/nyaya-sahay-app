import { useParams } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { mockCases } from '@/lib/mock-data';
import { StatusBadge } from '@/components/StatusBadge';
import { CaseTimeline } from '@/components/CaseTimeline';
import { LEGAL_CATEGORIES } from '@/types';
import { FileText, Send, User, Scale, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const CaseDetail = () => {
  const { id } = useParams();
  const caseData = mockCases.find((c) => c.id === id);
  const [message, setMessage] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      toast({
        title: 'Documents uploaded',
        description: `${files.length} file(s) uploaded successfully.`,
      });
    }
  };

  if (!caseData) return (
    <DashboardLayout>
      <div className="py-16 text-center">
        <p className="text-muted-foreground">Case not found.</p>
      </div>
    </DashboardLayout>
  );

  const roleColorMap = {
    user: { bg: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Client' },
    lawyer: { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Lawyer' },
    admin: { bg: 'bg-purple-50 text-purple-700 border-purple-200', label: 'Admin' },
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm text-muted-foreground">{caseData.caseNumber}</span>
              <StatusBadge status={caseData.status} />
            </div>
            <h1 className="mt-1.5 text-xl font-bold sm:text-2xl">{caseData.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{LEGAL_CATEGORIES[caseData.category]}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="rounded-xl border bg-card p-5">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Description</h3>
              <p className="text-sm leading-relaxed">{caseData.description}</p>
            </div>

            {/* Chat */}
            <div className="rounded-xl border bg-card">
              <div className="border-b p-4">
                <h3 className="text-sm font-semibold">Case Communication</h3>
              </div>
              <div className="max-h-80 space-y-3 overflow-y-auto p-4">
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
              <div className="border-t p-3 flex gap-2">
                <Input placeholder="Type a message..." value={message} onChange={(e) => setMessage(e.target.value)} className="flex-1" />
                <input ref={fileInputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="hidden" onChange={handleUpload} />
                <Button size="icon" variant="ghost" onClick={() => fileInputRef.current?.click()}><Upload className="h-4 w-4" /></Button>
                <Button size="icon"><Send className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Lawyer info */}
            {caseData.lawyerName && (
              <div className="rounded-xl border bg-card p-5">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Assigned Lawyer</h3>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold text-sm">
                    {caseData.lawyerName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{caseData.lawyerName}</p>
                    <p className="text-xs text-muted-foreground">{LEGAL_CATEGORIES[caseData.category]}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Documents — with uploader info */}
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
                        <span className={`inline-flex rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${roleInfo.bg}`}>
                          {roleInfo.label}
                        </span>
                        <span className="text-[11px] text-muted-foreground">{d.uploadedByName}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <input ref={fileInputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="hidden" onChange={handleUpload} />
              <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 h-3.5 w-3.5" /> Upload Document
              </Button>
            </div>

            {/* Timeline */}
            <div className="rounded-xl border bg-card p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Case Timeline</h3>
              <CaseTimeline events={caseData.timeline} />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CaseDetail;
