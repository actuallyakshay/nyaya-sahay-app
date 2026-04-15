import { useState, useRef } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { mockLawyers } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { LawyerDocument, DocumentVerificationStatus } from '@/types';
import {
  FileText, Upload, Clock, CheckCircle2, XCircle, Eye, Trash2,
  Shield, ArrowLeft, Plus
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

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocuments(prev => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2),
        name: file.name,
        type: 'additional',
        fileName: file.name,
        fileType: file.name.split('.').pop() || 'pdf',
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        status: 'pending',
        label: file.name.replace(/\.[^/.]+$/, ''),
        mandatory: false,
      },
    ]);
    toast({ title: 'Document uploaded', description: 'It will be reviewed within 24–48 hours.' });
  };

  const removeDoc = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
    toast({ title: 'Document removed' });
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-6">
        <input ref={docInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="hidden" onChange={handleDocUpload} />

        {/* Header */}
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
              <p className="text-sm text-muted-foreground">Upload and manage your documents</p>
            </div>
          </div>
          <Button size="sm" onClick={() => docInputRef.current?.click()}>
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Upload Document
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total', value: documents.length, cls: 'text-foreground' },
            { label: 'Approved', value: documents.filter(d => d.status === 'approved').length, cls: 'text-emerald-600' },
            { label: 'Pending', value: documents.filter(d => d.status === 'pending').length, cls: 'text-amber-600' },
          ].map(s => (
            <div key={s.label} className="rounded-xl border bg-card p-4 text-center">
              <p className={`text-2xl font-bold ${s.cls}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Documents List */}
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">All Documents</h2>
            <span className="text-xs text-muted-foreground">{documents.length} file{documents.length !== 1 ? 's' : ''}</span>
          </div>

          {documents.length === 0 ? (
            <div className="p-10 text-center">
              <div className="mx-auto h-14 w-14 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                <Upload className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">No documents yet</p>
              <p className="text-xs text-muted-foreground mt-1">Upload certificates, IDs, or any supporting documents</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => docInputRef.current?.click()}>
                <Upload className="mr-1.5 h-3 w-3" /> Upload your first document
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {documents.map(doc => (
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
