import { useState, useRef } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { mockLawyers } from '@/lib/mock-data';
import { LEGAL_CATEGORIES, type LegalCategory, type LawyerDocument, type DocumentVerificationStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Camera, CheckCircle2, MapPin, Briefcase, Award, Star, Phone, Mail,
  Upload, FileText, Clock, XCircle, AlertCircle, IndianRupee, Building2,
  Eye, ChevronDown, ChevronUp, Shield
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';

const DocStatusBadge = ({ status }: { status: DocumentVerificationStatus }) => {
  const map = {
    pending: { label: 'Pending', cls: 'bg-amber-100 text-amber-700', icon: Clock },
    approved: { label: 'Verified', cls: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
    rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-700', icon: XCircle },
  };
  const s = map[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${s.cls}`}>
      <s.icon className="h-3 w-3" /> {s.label}
    </span>
  );
};

const formatSize = (bytes: number) => bytes < 1048576 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / 1048576).toFixed(1)} MB`;

const LawyerProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const avatarRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const lawyerData = mockLawyers[0];

  const [avatar, setAvatar] = useState<string | null>(null);
  const [documents, setDocuments] = useState<LawyerDocument[]>(lawyerData.documents);
  const [specializations, setSpecializations] = useState<LegalCategory[]>(lawyerData.specializations);
  const [previewDoc, setPreviewDoc] = useState<LawyerDocument | null>(null);
  const [uploadType, setUploadType] = useState<'law_degree' | 'bar_council' | 'additional'>('additional');
  const [editOpen, setEditOpen] = useState(false);

  const hasLawDegree = documents.some(d => d.type === 'law_degree');
  const hasBarCouncil = documents.some(d => d.type === 'bar_council');
  const allApproved = documents.filter(d => d.mandatory).every(d => d.status === 'approved') && hasLawDegree && hasBarCouncil;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setAvatar(URL.createObjectURL(file)); toast({ title: 'Photo updated' }); }
  };

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const labels: Record<string, string> = { law_degree: 'Law Degree Certificate', bar_council: 'Bar Council Certificate' };
    setDocuments(prev => [...prev, {
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
    }]);
    toast({ title: 'Document uploaded', description: 'Pending admin review.' });
  };

  const triggerUpload = (type: typeof uploadType) => {
    setUploadType(type);
    setTimeout(() => docInputRef.current?.click(), 0);
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-6">
        <input ref={docInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleDocUpload} />

        {/* ─── Header ────────────────────────────────────── */}
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-start gap-5">
            <div className="relative group shrink-0">
              {avatar ? (
                <img src={avatar} alt="Profile" className="h-20 w-20 rounded-xl object-cover" />
              ) : (
                <div className="h-20 w-20 rounded-xl bg-gold/20 flex items-center justify-center text-2xl font-bold text-gold">
                  {lawyerData.name.charAt(0)}
                </div>
              )}
              <button onClick={() => avatarRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center rounded-xl bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-4 w-4 text-white" />
              </button>
              <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold">{lawyerData.name}</h1>
                {lawyerData.isVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                    <CheckCircle2 className="h-3 w-3" /> Verified
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{lawyerData.degree}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {lawyerData.city}, {lawyerData.state}</span>
                <span className="flex items-center gap-1"><Award className="h-3 w-3" /> {lawyerData.experience} yrs</span>
                {lawyerData.firm && <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {lawyerData.firm}</span>}
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={() => setEditOpen(!editOpen)}>
              {editOpen ? <><ChevronUp className="mr-1 h-3.5 w-3.5" /> Close</> : <>Edit Profile</>}
            </Button>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-4 gap-3 mt-5">
            {[
              { label: 'Cases', value: lawyerData.casesHandled, icon: Briefcase },
              { label: 'Experience', value: `${lawyerData.experience}y`, icon: Award },
              { label: 'Rating', value: lawyerData.rating > 0 ? lawyerData.rating : '—', icon: Star },
              { label: 'Fee', value: lawyerData.consultationFee ? `₹${lawyerData.consultationFee}` : 'Free', icon: IndianRupee },
            ].map(s => (
              <div key={s.label} className="rounded-lg bg-muted/50 py-2.5 text-center">
                <p className="text-base font-bold">{s.value}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Practice areas */}
          <div className="flex flex-wrap gap-1.5 mt-4">
            {lawyerData.specializations.map(s => (
              <Badge key={s} variant="secondary" className="bg-gold/10 text-gold border-gold/20 text-xs">
                {LEGAL_CATEGORIES[s]}
              </Badge>
            ))}
            {lawyerData.languages.map(l => (
              <Badge key={l} variant="outline" className="text-xs">{l}</Badge>
            ))}
          </div>
        </div>

        {/* ─── Edit Form (collapsible) ───────────────────── */}
        {editOpen && (
          <div className="rounded-xl border bg-card p-6 space-y-5 animate-in slide-in-from-top-2 duration-200">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Edit Profile</h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><Label>Full Name</Label><Input defaultValue={lawyerData.name} /></div>
              <div className="space-y-1.5"><Label>Email</Label><Input defaultValue={lawyerData.email} disabled /></div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <div className="flex">
                  <span className="inline-flex items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">+91</span>
                  <Input className="rounded-l-none" defaultValue={lawyerData.phone.replace('+91 ', '')} />
                </div>
              </div>
              <div className="space-y-1.5"><Label>Law Firm</Label><Input defaultValue={lawyerData.firm || ''} placeholder="Independent Practice" /></div>
              <div className="space-y-1.5"><Label>Degree</Label><Input defaultValue={lawyerData.degree} /></div>
              <div className="space-y-1.5"><Label>Bar Council ID</Label><Input defaultValue={lawyerData.barCouncilId} disabled className="font-mono text-xs" /></div>
              <div className="space-y-1.5"><Label>Career Started</Label><Input type="date" defaultValue={lawyerData.careerStartedFrom || ''} /></div>
              <div className="space-y-1.5"><Label>Consultation Fee (₹)</Label><Input type="number" defaultValue={lawyerData.consultationFee || ''} /></div>
              <div className="space-y-1.5"><Label>City</Label><Input defaultValue={lawyerData.city} /></div>
              <div className="space-y-1.5"><Label>State</Label><Input defaultValue={lawyerData.state} /></div>
              <div className="space-y-1.5"><Label>Languages</Label><Input defaultValue={lawyerData.languages.join(', ')} /></div>
              <div className="space-y-1.5"><Label>Gender</Label><Input defaultValue={lawyerData.gender || ''} /></div>
            </div>

            <div className="space-y-1.5">
              <Label>Bio</Label>
              <Textarea defaultValue={lawyerData.bio} rows={3} />
            </div>

            <div className="space-y-1.5">
              <Label>Specializations</Label>
              <div className="flex flex-wrap gap-1.5">
                {(Object.entries(LEGAL_CATEGORIES) as [LegalCategory, string][]).map(([key, label]) => (
                  <button key={key} type="button"
                    onClick={() => setSpecializations(prev => prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key])}
                    className={`rounded-full px-2.5 py-1 text-xs border transition-colors ${
                      specializations.includes(key)
                        ? 'bg-gold text-primary-foreground border-gold'
                        : 'bg-muted text-muted-foreground border-border hover:bg-accent'
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={() => { toast({ title: 'Profile saved' }); setEditOpen(false); }}>Save Changes</Button>
          </div>
        )}

        {/* ─── Documents Summary Card ─────────────────── */}
        <Link to="/lawyer/documents" className="block">
          <div className="rounded-xl border bg-card p-5 hover:border-gold/40 transition-colors group cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gold/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <h2 className="font-semibold flex items-center gap-2">
                    Documents & Verification
                    {allApproved ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                        <CheckCircle2 className="h-3 w-3" /> Verified
                      </span>
                    ) : (
                      <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-600">Action needed</Badge>
                    )}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {documents.length} document{documents.length !== 1 ? 's' : ''} uploaded
                  </p>
                </div>
              </div>
              <span className="text-sm text-muted-foreground group-hover:text-gold transition-colors">
                Manage →
              </span>
            </div>
          </div>
        </Link>

        {/* ─── Contact & Security ────────────────────────── */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-xl border bg-card p-5 space-y-2">
            <h3 className="text-sm font-semibold">Contact</h3>
            <div className="space-y-1.5 text-sm text-muted-foreground">
              <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> {lawyerData.email}</p>
              <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> {lawyerData.phone}</p>
              <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> {lawyerData.city}, {lawyerData.state}</p>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-5 space-y-2">
            <h3 className="text-sm font-semibold">Security</h3>
            <p className="text-xs text-muted-foreground">Your data is encrypted. All communications are confidential.</p>
            <Button variant="outline" size="sm" className="h-7 text-xs">Change Password</Button>
          </div>
        </div>
      </div>

      {/* Doc preview dialog */}
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
                  <p className="text-xs text-red-700 font-medium">Rejection Reason</p>
                  <p className="text-xs text-red-600 mt-0.5">{previewDoc.rejectionReason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default LawyerProfile;
