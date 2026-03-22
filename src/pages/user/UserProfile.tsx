import { DashboardLayout } from '@/layouts/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield } from 'lucide-react';

const UserProfile = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-2xl font-bold">Profile & Settings</h1>

        <div className="rounded-xl border bg-card p-6 space-y-5">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-navy flex items-center justify-center text-xl font-bold text-primary-foreground">
              {user?.name?.charAt(0)}
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
