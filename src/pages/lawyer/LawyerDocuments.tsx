import { useState, useRef } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { mockLawyers } from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { LawyerDocument, DocumentVerificationStatus } from '@/types';
import {
  FileText, Upload, Clock, CheckCircle2, XCircle, Eye, Trash2,
  AlertCircle, Shield, ArrowLeft, Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DocStatusBadge = ({ status }: { status: DocumentVerificationStatus }) => {
  const map = {
    pending: { label: 'Pending Review', cls: 'bg-amber-100 text-amber-700', icon: Clock },
    approved: { label: 'Verified', cls: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
    rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-700', icon: XCircle },
  };
  const s = map[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${s.cls}`}>
      <s.icon className="h-3 w-3" /> {s.label}
    </span>
  );
};

const formatSize = (bytes: number) =>
  bytes < 1048576 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / 1048576).toFixed(1)} MB`;

const LawyerDocuments = () => {
  const { toast } = useToast();
  const lawyerData = mockLawyers[0];
  const docInputRef = useRef<HTMLInputElement>(null);

  const [documents, setDocuments] = useState<LawyerDocument[]>(lawyerData.documents);
  const [previewDoc, setPreviewDoc] = useState<LawyerDocument | null>(null);
  const [uploadType, setUploadType] = useState<'law_degree' | 'bar_council' | 'additional'>('additional');

  const hasLawDegree = documents.some(d => d.type === 'law_degree');
  const hasBarCouncil = documents.some(d => d.type === 'bar_council');
  const mandatoryDocs = documents.filter(d => d.mandatory);
  const additionalDocs = documents.filter(d => d.type === 'additional');
  const allMandatoryApproved = mandatoryDocs.every(d => d.status === 'approved') && hasLawDegree && hasBarCouncil;

  const approvedCount = documents.filter(d => d.status === 'approved').length;
  const pendingCount = documents.filter(d => d.status === 'pending').length;
  const rejectedCount = documents.filter(d => d.status === 'rejected').length;

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const labels: Record<string, string> = {
      law_degree: 'Law Degree Certificate',
      bar_council: 'Bar Council Certificate',
    };
    setDocuments(prev => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2),
        name: labels[uploadType] || file.name,
        type: uploadType,
        fileName: file.name,
        fileType: file.name.split('.').pop() || 'pdf',
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        status: 'pending',
        label: labels[uploadType] || file.name.replace(/\.[^/.]+$/, ''),
        mandatory: uploadType !== 'additional',
      },
    ]);
    toast({ title: 'Document uploaded', description: 'It will be reviewed within 24–48 hours.' });
  };

  const triggerUpload = (type: typeof uploadType) => {
    setUploadType(type);
    setTimeout(() => docInputRef.current?.click(), 0);
  };

  const removeDoc = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
    toast({ title: 'Document removed' });
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-6">
        <input ref={docInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleDocUpload} />

        {/* Back link & header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/lawyer/profile">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Shield className="h-5 w-5 text-gold" /> My Documents
              </h1>
              <p className="text-sm text-muted-foreground">Upload and manage your verification documents</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Approved', value: approvedCount, cls: 'text-emerald-600' },
            { label: 'Pending', value: pendingCount, cls: 'text-amber-600' },
            { label: 'Rejected', value: rejectedCount, cls: 'text-red-600' },
          ].map(s => (
            <div key={s.label} className="rounded-xl border bg-card p-4 text-center">
              <p className={`text-2xl font-bold ${s.cls}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Verification progress */}
        {!allMandatoryApproved && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-800">Verification Incomplete</span>
            </div>
            <p className="text-xs text-amber-700">
              Upload all mandatory documents and get them approved to complete your profile verification. Documents are typically reviewed within 24–48 hours.
            </p>
            <div className="flex gap-2 mt-1">
              {!hasLawDegree && <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-700">Law Degree missing</Badge>}
              {!hasBarCouncil && <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-700">Bar Council missing</Badge>}
              {mandatoryDocs.some(d => d.status === 'rejected') && (
                <Badge variant="outline" className="text-[10px] border-red-300 text-red-700">Re-upload rejected docs</Badge>
              )}
            </div>
          </div>
        )}

        {allMandatoryApproved && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-emerald-800">Profile Verified</p>
              <p className="text-xs text-emerald-600">All mandatory documents have been approved. Your profile is published.</p>
            </div>
          </div>
        )}

        {/* Mandatory Documents */}
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="p-4 border-b bg-muted/30">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Mandatory Documents</h2>
          </div>
          <div className="divide-y">
            {[
              { type: 'law_degree' as const, label: 'Law Degree Certificate' },
              { type: 'bar_council' as const, label: 'Bar Council Certificate' },
            ].map(item => {
              const docs = documents.filter(d => d.type === item.type);
              return (
                <div key={item.type} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-lg bg-gold/10 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-gold" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-[11px] text-muted-foreground">Required for verification</p>
                      </div>
                    </div>
                    {docs.length === 0 && (
                      <Button size="sm" className="h-8 text-xs" onClick={() => triggerUpload(item.type)}>
                        <Upload className="mr-1.5 h-3 w-3" /> Upload
                      </Button>
                    )}
                  </div>

                  {docs.map(doc => (
                    <div key={doc.id} className="mt-3 ml-[46px] rounded-lg border bg-muted/30 p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs truncate">{doc.fileName}</span>
                        <span className="text-[10px] text-muted-foreground shrink-0">{formatSize(doc.fileSize)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DocStatusBadge status={doc.status} />
                        <button onClick={() => setPreviewDoc(doc)} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {docs.some(d => d.rejectionReason) && (
                    <div className="mt-2 ml-[46px] rounded-lg bg-red-50 border border-red-200 p-2.5">
                      <p className="text-xs text-red-700">
                        <XCircle className="h-3 w-3 inline mr-1" />
                        {docs.find(d => d.rejectionReason)?.rejectionReason}
                      </p>
                      <Button variant="outline" size="sm" className="h-6 text-[10px] mt-1.5 border-red-200 text-red-700" onClick={() => triggerUpload(item.type)}>
                        Re-upload
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Additional Documents */}
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Additional Certifications</h2>
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => triggerUpload('additional')}>
              <Plus className="mr-1.5 h-3 w-3" /> Add Document
            </Button>
          </div>

          {additionalDocs.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="mx-auto h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground mt-2">No additional documents uploaded</p>
              <p className="text-xs text-muted-foreground mt-0.5">Add extra certifications to strengthen your profile</p>
            </div>
          ) : (
            <div className="divide-y">
              {additionalDocs.map(doc => (
                <div key={doc.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{doc.label}</p>
                      <p className="text-[11px] text-muted-foreground">{doc.fileName} · {formatSize(doc.fileSize)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DocStatusBadge status={doc.status} />
                    <button onClick={() => setPreviewDoc(doc)} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => removeDoc(doc.id)} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">{previewDoc?.label}</DialogTitle>
          </DialogHeader>
          {previewDoc && (
            <div className="space-y-3">
              <div className="rounded-lg bg-muted p-5 text-center">
                <FileText className="mx-auto h-10 w-10 text-muted-foreground mb-1.5" />
                <p className="text-sm font-medium">{previewDoc.fileName}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{formatSize(previewDoc.fileSize)}</p>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <DocStatusBadge status={previewDoc.status} />
              </div>
              {previewDoc.rejectionReason && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                  <p className="text-xs text-red-700">
                    <strong>Reason:</strong> {previewDoc.rejectionReason}
                  </p>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Uploaded</span>
                <span className="text-xs">{new Date(previewDoc.uploadedAt).toLocaleDateString()}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default LawyerDocuments;
