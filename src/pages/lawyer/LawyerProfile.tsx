import { useState, useRef } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { mockLawyers } from '@/lib/mock-data';
import { LEGAL_CATEGORIES, type LegalCategory, type LawyerDocument, type DocumentVerificationStatus } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Camera, CheckCircle2, Shield, MapPin, Briefcase, Award, Star, Phone, Mail,
  Upload, FileText, Clock, XCircle, AlertCircle, Globe, IndianRupee, Building2,
  GraduationCap, Languages, Calendar, Eye
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

/* ─── Verification Status Badge ──────────────────────────────── */
const DocStatusBadge = ({ status }: { status: DocumentVerificationStatus }) => {
  const map = {
    pending: { label: 'Pending Review', class: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
    approved: { label: 'Verified', class: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
    rejected: { label: 'Rejected', class: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
  };
  const s = map[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${s.class}`}>
      <s.icon className="h-3 w-3" /> {s.label}
    </span>
  );
};

/* ─── Profile Completion Meter ───────────────────────────────── */
const ProfileCompletion = ({ percentage }: { percentage: number }) => (
  <div className="rounded-xl border bg-card p-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-medium">Profile Completion</span>
      <span className="text-sm font-bold text-gold">{percentage}%</span>
    </div>
    <div className="h-2 rounded-full bg-muted overflow-hidden">
      <div className="h-full rounded-full bg-gradient-to-r from-gold to-amber-400 transition-all" style={{ width: `${percentage}%` }} />
    </div>
    {percentage < 100 && (
      <p className="text-xs text-muted-foreground mt-2">Complete your profile to get verified and start receiving cases.</p>
    )}
  </div>
);

const LawyerProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const avatarRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const lawyerData = mockLawyers[0]; // Current logged-in lawyer
  const [avatar, setAvatar] = useState<string | null>(null);
  const [documents, setDocuments] = useState<LawyerDocument[]>(lawyerData.documents);
  const [specializations, setSpecializations] = useState<LegalCategory[]>(lawyerData.specializations);
  const [previewDoc, setPreviewDoc] = useState<LawyerDocument | null>(null);
  const [uploadType, setUploadType] = useState<'law_degree' | 'bar_council' | 'additional'>('additional');

  // Calculate profile completion
  const calculateCompletion = () => {
    let total = 0;
    let filled = 0;
    const checks = [
      lawyerData.name, lawyerData.email, lawyerData.phone, lawyerData.bio,
      lawyerData.degree, lawyerData.barCouncilId, lawyerData.city, lawyerData.state,
      lawyerData.specializations.length > 0, lawyerData.languages.length > 0,
      documents.some(d => d.type === 'law_degree'),
      documents.some(d => d.type === 'bar_council'),
    ];
    checks.forEach(c => { total++; if (c) filled++; });
    return Math.round((filled / total) * 100);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(URL.createObjectURL(file));
      toast({ title: 'Photo updated' });
    }
  };

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const newDoc: LawyerDocument = {
      id: Math.random().toString(36).slice(2),
      name: uploadType === 'law_degree' ? 'Law Degree Certificate' : uploadType === 'bar_council' ? 'Bar Council Certificate' : file.name,
      type: uploadType,
      fileName: file.name,
      fileType: file.name.split('.').pop() || 'pdf',
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
      status: 'pending',
      label: uploadType === 'law_degree' ? 'Law Degree Certificate' : uploadType === 'bar_council' ? 'Bar Council Certificate' : file.name.replace(/\.[^/.]+$/, ''),
      mandatory: uploadType !== 'additional',
    };
    setDocuments(prev => [...prev, newDoc]);
    toast({ title: 'Document uploaded', description: 'Your document is pending admin review.' });
  };

  const triggerUpload = (type: typeof uploadType) => {
    setUploadType(type);
    setTimeout(() => docInputRef.current?.click(), 0);
  };

  const toggleSpec = (cat: LegalCategory) => {
    setSpecializations(prev => prev.includes(cat) ? prev.filter(s => s !== cat) : [...prev, cat]);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const hasLawDegree = documents.some(d => d.type === 'law_degree');
  const hasBarCouncil = documents.some(d => d.type === 'bar_council');
  const allMandatoryApproved = documents.filter(d => d.mandatory).every(d => d.status === 'approved') && hasLawDegree && hasBarCouncil;
  const completion = calculateCompletion();

  return (
    <DashboardLayout>
      <div className="max-w-4xl space-y-6">
        {/* ─── Profile Header Card ──────────────────────────── */}
        <div className="rounded-xl border bg-card overflow-hidden">
          {/* Cover gradient */}
          <div className="h-28 bg-gradient-to-r from-navy via-navy/90 to-navy/70 relative">
            {lawyerData.isVerified && (
              <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/30 px-3 py-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-100">Verified Advocate</span>
              </div>
            )}
            {!lawyerData.isVerified && (
              <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-amber-500/20 backdrop-blur-sm border border-amber-400/30 px-3 py-1.5">
                <AlertCircle className="h-4 w-4 text-amber-300" />
                <span className="text-xs font-semibold text-amber-100">Verification Pending</span>
              </div>
            )}
          </div>

          <div className="px-6 pb-6">
            {/* Avatar */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
              <div className="relative group shrink-0">
                {avatar ? (
                  <img src={avatar} alt="Profile" className="h-24 w-24 rounded-xl border-4 border-card object-cover shadow-lg" />
                ) : (
                  <div className="h-24 w-24 rounded-xl border-4 border-card bg-gradient-to-br from-gold/80 to-gold flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                    {lawyerData.name.charAt(0)}
                  </div>
                )}
                <button
                  onClick={() => avatarRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center rounded-xl bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Camera className="h-5 w-5 text-white" />
                </button>
                <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>

              <div className="flex-1 min-w-0 pt-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold">{lawyerData.name}</h1>
                  {lawyerData.isVerified && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                </div>
                <p className="text-sm text-muted-foreground">{lawyerData.degree}</p>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {lawyerData.city}, {lawyerData.state}</span>
                  {lawyerData.firm && <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> {lawyerData.firm}</span>}
                  <span className="flex items-center gap-1"><Award className="h-3.5 w-3.5" /> {lawyerData.experience} yrs exp.</span>
                </div>
              </div>
            </div>

            {/* Trust Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              {[
                { label: 'Cases Handled', value: lawyerData.casesHandled, icon: Briefcase },
                { label: 'Experience', value: `${lawyerData.experience} yrs`, icon: Award },
                { label: 'Rating', value: lawyerData.rating > 0 ? `${lawyerData.rating}/5` : 'N/A', icon: Star },
                { label: 'Consultation', value: lawyerData.consultationFee ? `₹${lawyerData.consultationFee}` : 'Free', icon: IndianRupee },
              ].map(s => (
                <div key={s.label} className="rounded-lg bg-muted/50 p-3 text-center">
                  <s.icon className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                  <p className="text-lg font-bold">{s.value}</p>
                  <p className="text-[11px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Completion meter */}
        {completion < 100 && <ProfileCompletion percentage={completion} />}

        {/* ─── Tabs ─────────────────────────────────────────── */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="w-full justify-start bg-muted/50 rounded-xl p-1 h-auto flex-wrap">
            <TabsTrigger value="overview" className="rounded-lg text-xs sm:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="professional" className="rounded-lg text-xs sm:text-sm">Professional</TabsTrigger>
            <TabsTrigger value="documents" className="rounded-lg text-xs sm:text-sm relative">
              Documents
              {(!hasLawDegree || !hasBarCouncil) && (
                <span className="ml-1 h-2 w-2 rounded-full bg-destructive inline-block" />
              )}
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg text-xs sm:text-sm">Settings</TabsTrigger>
          </TabsList>

          {/* ── Overview Tab ── */}
          <TabsContent value="overview" className="space-y-5">
            <div className="rounded-xl border bg-card p-5 space-y-4">
              <h3 className="font-semibold flex items-center gap-2"><GraduationCap className="h-4 w-4 text-gold" /> About</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{lawyerData.bio}</p>
            </div>

            <div className="rounded-xl border bg-card p-5 space-y-3">
              <h3 className="font-semibold flex items-center gap-2"><Briefcase className="h-4 w-4 text-gold" /> Practice Areas</h3>
              <div className="flex flex-wrap gap-2">
                {lawyerData.specializations.map(s => (
                  <Badge key={s} variant="secondary" className="bg-gold/10 text-gold border-gold/20">
                    {LEGAL_CATEGORIES[s]}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-xl border bg-card p-5 space-y-3">
                <h3 className="font-semibold flex items-center gap-2"><Phone className="h-4 w-4 text-gold" /> Contact</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-3.5 w-3.5" /> {lawyerData.email}</div>
                  <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3.5 w-3.5" /> {lawyerData.phone}</div>
                  <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> {lawyerData.city}, {lawyerData.state}</div>
                </div>
              </div>

              <div className="rounded-xl border bg-card p-5 space-y-3">
                <h3 className="font-semibold flex items-center gap-2"><Languages className="h-4 w-4 text-gold" /> Languages</h3>
                <div className="flex flex-wrap gap-1.5">
                  {lawyerData.languages.map(l => (
                    <Badge key={l} variant="outline" className="text-xs">{l}</Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Verification status summary */}
            <div className={`rounded-xl border p-5 ${allMandatoryApproved ? 'bg-emerald-50/50 border-emerald-200' : 'bg-amber-50/50 border-amber-200'}`}>
              <div className="flex items-start gap-3">
                {allMandatoryApproved ? (
                  <Shield className="h-5 w-5 text-emerald-600 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                )}
                <div>
                  <h4 className="font-semibold text-sm">{allMandatoryApproved ? 'Profile Verified' : 'Verification Incomplete'}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {allMandatoryApproved
                      ? 'All mandatory documents have been verified. Your profile is live and visible to clients.'
                      : 'Upload and get all mandatory documents approved to publish your profile.'}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ── Professional Details Tab ── */}
          <TabsContent value="professional" className="space-y-5">
            <div className="rounded-xl border bg-card p-5 space-y-4">
              <h3 className="font-semibold">Basic Information</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Full Name</Label>
                  <Input defaultValue={lawyerData.name} />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input defaultValue={lawyerData.email} disabled />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <div className="flex">
                    <span className="inline-flex items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">+91</span>
                    <Input className="rounded-l-none" defaultValue={lawyerData.phone.replace('+91 ', '')} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Gender</Label>
                  <Input defaultValue={lawyerData.gender || ''} placeholder="e.g. Male, Female, Other" />
                </div>
                <div className="space-y-1.5">
                  <Label>Date of Birth</Label>
                  <Input type="date" defaultValue={lawyerData.dateOfBirth || ''} />
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-5 space-y-4">
              <h3 className="font-semibold">Professional Credentials</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Degree / Qualification</Label>
                  <Input defaultValue={lawyerData.degree} />
                </div>
                <div className="space-y-1.5">
                  <Label>Bar Council Registration No.</Label>
                  <Input defaultValue={lawyerData.barCouncilId} disabled className="font-mono" />
                </div>
                <div className="space-y-1.5">
                  <Label>Career Started From</Label>
                  <Input type="date" defaultValue={lawyerData.careerStartedFrom || ''} />
                </div>
                <div className="space-y-1.5">
                  <Label>Law Firm / Practice</Label>
                  <Input defaultValue={lawyerData.firm || ''} placeholder="Independent Practice" />
                </div>
                <div className="space-y-1.5">
                  <Label>Consultation Fee (₹)</Label>
                  <Input type="number" defaultValue={lawyerData.consultationFee || ''} placeholder="e.g. 1500" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-5 space-y-4">
              <h3 className="font-semibold">Specializations</h3>
              <div className="flex flex-wrap gap-2">
                {(Object.entries(LEGAL_CATEGORIES) as [LegalCategory, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleSpec(key)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
                      specializations.includes(key)
                        ? 'bg-gold text-primary-foreground border-gold'
                        : 'bg-muted text-muted-foreground border-border hover:bg-accent'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border bg-card p-5 space-y-4">
              <h3 className="font-semibold">Languages Spoken</h3>
              <Input defaultValue={lawyerData.languages.join(', ')} placeholder="Hindi, English, Tamil..." />
              <p className="text-xs text-muted-foreground">Separate multiple languages with commas.</p>
            </div>

            <div className="rounded-xl border bg-card p-5 space-y-4">
              <h3 className="font-semibold">Bio</h3>
              <Textarea defaultValue={lawyerData.bio} rows={4} placeholder="Describe your practice, expertise and experience..." />
            </div>

            <div className="rounded-xl border bg-card p-5 space-y-4">
              <h3 className="font-semibold">Address</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Address Line 1</Label>
                  <Input defaultValue={lawyerData.addressLine1 || ''} placeholder="House/Building No., Street" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Address Line 2</Label>
                  <Input defaultValue={lawyerData.addressLine2 || ''} placeholder="Landmark, Area (optional)" />
                </div>
                <div className="space-y-1.5">
                  <Label>City</Label>
                  <Input defaultValue={lawyerData.city} />
                </div>
                <div className="space-y-1.5">
                  <Label>State</Label>
                  <Input defaultValue={lawyerData.state} />
                </div>
                <div className="space-y-1.5">
                  <Label>Pincode</Label>
                  <Input defaultValue={lawyerData.pincode || ''} maxLength={6} placeholder="6-digit pincode" />
                </div>
              </div>
            </div>

            <Button onClick={() => toast({ title: 'Profile saved', description: 'Your changes have been saved successfully.' })}>
              Save Changes
            </Button>
          </TabsContent>

          {/* ── Documents Tab ── */}
          <TabsContent value="documents" className="space-y-5">
            <input ref={docInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleDocUpload} />

            {/* Mandatory docs */}
            <div className="rounded-xl border bg-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <Shield className="h-4 w-4 text-gold" /> Mandatory Documents
                </h3>
                <span className="text-xs text-muted-foreground">Required for verification</span>
              </div>

              {/* Law Degree */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Law Degree Certificate</span>
                    <Badge variant="destructive" className="text-[10px] h-4">Required</Badge>
                  </div>
                </div>
                {documents.filter(d => d.type === 'law_degree').map(doc => (
                  <DocCard key={doc.id} doc={doc} onPreview={() => setPreviewDoc(doc)} formatSize={formatSize} />
                ))}
                {!hasLawDegree && (
                  <Button variant="outline" size="sm" className="w-full border-dashed" onClick={() => triggerUpload('law_degree')}>
                    <Upload className="mr-1.5 h-3.5 w-3.5" /> Upload Law Degree Certificate
                  </Button>
                )}
              </div>

              <div className="border-t" />

              {/* Bar Council */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Bar Council Certificate</span>
                    <Badge variant="destructive" className="text-[10px] h-4">Required</Badge>
                  </div>
                </div>
                {documents.filter(d => d.type === 'bar_council').map(doc => (
                  <DocCard key={doc.id} doc={doc} onPreview={() => setPreviewDoc(doc)} formatSize={formatSize} />
                ))}
                {!hasBarCouncil && (
                  <Button variant="outline" size="sm" className="w-full border-dashed" onClick={() => triggerUpload('bar_council')}>
                    <Upload className="mr-1.5 h-3.5 w-3.5" /> Upload Bar Council Certificate
                  </Button>
                )}
              </div>
            </div>

            {/* Additional docs */}
            <div className="rounded-xl border bg-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Additional Certifications</h3>
                <Button variant="outline" size="sm" onClick={() => triggerUpload('additional')}>
                  <Upload className="mr-1.5 h-3.5 w-3.5" /> Upload
                </Button>
              </div>
              {documents.filter(d => d.type === 'additional').length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No additional certifications uploaded yet.</p>
              ) : (
                <div className="space-y-2">
                  {documents.filter(d => d.type === 'additional').map(doc => (
                    <DocCard key={doc.id} doc={doc} onPreview={() => setPreviewDoc(doc)} formatSize={formatSize} />
                  ))}
                </div>
              )}
            </div>

            {/* Info box */}
            <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-800 space-y-1">
                  <p className="font-medium">Document Verification Guidelines</p>
                  <ul className="list-disc pl-4 space-y-0.5 text-blue-700">
                    <li>Accepted formats: PDF, JPG, PNG (max 10MB each)</li>
                    <li>Documents are reviewed by our admin team within 24–48 hours</li>
                    <li>Rejected documents can be re-uploaded after addressing the issue</li>
                    <li>Your profile will be published once all mandatory documents are approved</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ── Settings Tab ── */}
          <TabsContent value="settings" className="space-y-5">
            <div className="rounded-xl border bg-card p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-gold" />
                <h3 className="font-semibold">Security</h3>
              </div>
              <p className="text-sm text-muted-foreground">Your data is encrypted and stored securely. All communications are confidential.</p>
              <Button variant="outline" size="sm">Change Password</Button>
            </div>

            <div className="rounded-xl border bg-card p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-gold" />
                <h3 className="font-semibold">Profile Visibility</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {allMandatoryApproved
                  ? 'Your profile is live and visible to potential clients in the lawyers directory.'
                  : 'Your profile is currently hidden. Complete verification to go live.'}
              </p>
            </div>

            <div className="rounded-xl border bg-card p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gold" />
                <h3 className="font-semibold">Availability</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Your current status: <strong>{lawyerData.isAvailable ? 'Available' : 'Unavailable'}</strong> for new cases.
              </p>
              <Button variant="outline" size="sm">{lawyerData.isAvailable ? 'Set Unavailable' : 'Set Available'}</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Document preview dialog */}
      <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" /> {previewDoc?.label}
            </DialogTitle>
          </DialogHeader>
          {previewDoc && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-6 text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">{previewDoc.fileName}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatSize(previewDoc.fileSize)} · Uploaded {new Date(previewDoc.uploadedAt).toLocaleDateString('en-IN')}</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <DocStatusBadge status={previewDoc.status} />
              </div>
              {previewDoc.rejectionReason && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                  <p className="text-xs font-medium text-red-700">Rejection Reason</p>
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

/* ─── Document Card Component ────────────────────────────────── */
const DocCard = ({ doc, onPreview, formatSize }: { doc: LawyerDocument; onPreview: () => void; formatSize: (b: number) => string }) => (
  <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
    <div className="h-10 w-10 rounded-lg bg-card border flex items-center justify-center shrink-0">
      <FileText className="h-5 w-5 text-muted-foreground" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium truncate">{doc.fileName}</p>
      <div className="flex items-center gap-2 mt-0.5">
        <span className="text-xs text-muted-foreground">{formatSize(doc.fileSize)}</span>
        <span className="text-xs text-muted-foreground">·</span>
        <DocStatusBadge status={doc.status} />
      </div>
      {doc.rejectionReason && (
        <p className="text-xs text-destructive mt-1">⚠ {doc.rejectionReason}</p>
      )}
    </div>
    <Button variant="ghost" size="sm" className="shrink-0" onClick={onPreview}>
      <Eye className="h-4 w-4" />
    </Button>
  </div>
);

export default LawyerProfile;
