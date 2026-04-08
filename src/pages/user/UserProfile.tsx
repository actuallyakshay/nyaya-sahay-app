import { DashboardLayout } from '@/layouts/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Camera } from 'lucide-react';
import { useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { mockLawyers, mockSubscription, mockPlans } from '@/lib/mock-data';
import { LEGAL_CATEGORIES, LegalCategory } from '@/types';
import { CheckCircle2, CreditCard, Calendar } from 'lucide-react';

const UserProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const isLawyer = user?.role === 'lawyer';
  const lawyerData = isLawyer ? mockLawyers[0] : null;
  const [specializations, setSpecializations] = useState<LegalCategory[]>(lawyerData?.specializations || []);

  const plan = mockPlans.find(p => p.id === mockSubscription.planId);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatar(url);
      toast({ title: 'Photo updated', description: 'Profile photo has been changed.' });
    }
  };

  const toggleSpecialization = (cat: LegalCategory) => {
    setSpecializations(prev =>
      prev.includes(cat) ? prev.filter(s => s !== cat) : [...prev, cat]
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-2xl font-bold">Profile & Settings</h1>

        <div className="rounded-xl border bg-card p-6 space-y-5">
          <div className="flex items-center gap-4">
            <div className="relative group">
              {avatar ? (
                <img src={avatar} alt="Profile" className="h-16 w-16 rounded-full object-cover" />
              ) : (
                <div className="h-16 w-16 rounded-full bg-navy flex items-center justify-center text-xl font-bold text-primary-foreground">
                  {user?.name?.charAt(0)}
                </div>
              )}
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera className="h-5 w-5 text-white" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
            <div>
              <p className="font-semibold text-lg">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input defaultValue={user?.name} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input defaultValue={user?.email} disabled />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <div className="flex">
                <span className="inline-flex items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">+91</span>
                <Input className="rounded-l-none" defaultValue="9876543210" maxLength={10} />
              </div>
            </div>
          </div>

          {/* Lawyer-specific fields */}
          {isLawyer && lawyerData && (
            <div className="border-t pt-5 mt-3">
              <h3 className="font-semibold mb-4">Professional Details</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Degree / Qualification</Label>
                  <Input defaultValue={lawyerData.degree} />
                </div>
                <div className="space-y-2">
                  <Label>Career Started From</Label>
                  <Input type="date" defaultValue="2015-07-01" />
                </div>
                <div className="space-y-2">
                  <Label>Bar Council ID</Label>
                  <Input defaultValue={lawyerData.barCouncilId} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Specializations</Label>
                  <div className="flex flex-wrap gap-1.5 rounded-lg border p-2.5">
                    {(Object.entries(LEGAL_CATEGORIES) as [LegalCategory, string][]).map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleSpecialization(key)}
                        className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                          specializations.includes(key)
                            ? 'bg-gold text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Bio</Label>
                  <Input defaultValue={lawyerData.bio} />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Input defaultValue="Male" placeholder="e.g. Male, Female, Other" />
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input type="date" defaultValue="1990-01-15" />
                </div>
              </div>

              <h3 className="font-semibold mt-6 mb-4">Address Details</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Address Line 1</Label>
                  <Input defaultValue="123, MG Road" placeholder="House/Building No., Street" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Address Line 2</Label>
                  <Input defaultValue="Near District Court" placeholder="Landmark, Area (optional)" />
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input defaultValue="Mumbai" placeholder="City" />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input defaultValue="Maharashtra" placeholder="State" />
                </div>
                <div className="space-y-2">
                  <Label>Pincode</Label>
                  <Input defaultValue="400001" placeholder="6-digit pincode" maxLength={6} />
                </div>
              </div>
            </div>
          )}

          <Button>Save Changes</Button>
        </div>

        {/* My Plan — for users */}
        {!isLawyer && plan && (
          <div className="rounded-xl border bg-card p-6 space-y-3">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-gold" />
              <h3 className="font-semibold">My Plan</h3>
            </div>
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <p className="font-bold text-lg">{plan.name} Plan</p>
                <p className="text-sm text-muted-foreground">₹{plan.price.toLocaleString('en-IN')}/{plan.period}</p>
              </div>
              <div className="text-right text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  Valid until {new Date(mockSubscription.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <div className="flex items-center gap-1 mt-0.5 text-green-600 text-xs">
                  <CheckCircle2 className="h-3 w-3" /> Active
                </div>
              </div>
            </div>
            <ul className="grid gap-1 sm:grid-cols-2">
              {plan.features.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm"><CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-600 mt-0.5" />{f}</li>
              ))}
            </ul>
            <Button variant="outline" size="sm" asChild>
              <a href="/app/subscription">Manage Subscription</a>
            </Button>
          </div>
        )}

        <div className="rounded-xl border bg-card p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-gold" />
            <h3 className="font-semibold">Security</h3>
          </div>
          <p className="text-sm text-muted-foreground">Your data is encrypted and stored securely. All communications with your lawyer are confidential.</p>
          <Button variant="outline" size="sm">Change Password</Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserProfile;
