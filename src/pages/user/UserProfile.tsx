import { DashboardLayout } from '@/layouts/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Camera } from 'lucide-react';
import { useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { mockLawyers } from '@/lib/mock-data';
import { LEGAL_CATEGORIES } from '@/types';

const UserProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const isLawyer = user?.role === 'lawyer';
  const lawyerData = isLawyer ? mockLawyers[0] : null;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatar(url);
      toast({ title: 'Photo updated', description: 'Profile photo has been changed.' });
    }
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
              <Input defaultValue="+91 98765 43210" />
            </div>
          </div>

          {/* Lawyer-specific fields */}
          {isLawyer && lawyerData && (
            <>
              <div className="border-t pt-5 mt-3">
                <h3 className="font-semibold mb-4">Professional Details</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Degree / Qualification</Label>
                    <Input defaultValue={lawyerData.degree} />
                  </div>
                  <div className="space-y-2">
                    <Label>Years of Experience</Label>
                    <Input type="number" defaultValue={lawyerData.experience} />
                  </div>
                  <div className="space-y-2">
                    <Label>Bar Council ID</Label>
                    <Input defaultValue={lawyerData.barCouncilId} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Specializations</Label>
                    <Input defaultValue={lawyerData.specializations.map(s => LEGAL_CATEGORIES[s]).join(', ')} disabled />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Bio</Label>
                    <Input defaultValue={lawyerData.bio} />
                  </div>
                </div>
              </div>
            </>
          )}

          <Button>Save Changes</Button>
        </div>

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
