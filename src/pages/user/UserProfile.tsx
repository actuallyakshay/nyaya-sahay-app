import PasswordResetModal from '@/components/PasswordResetModal';
import { LawyerProfileForm } from '@/components/profile/LawyerProfileForm';
import { UserProfileForm } from '@/components/profile/UserProfileForm';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { useProfilePage } from '@/hooks/useProfilePage';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { getCookie } from '@/lib/helpers';
import { mockPlans, mockSubscription } from '@/lib/mock-data';
import {
  Calendar,
  CheckCircle2,
  CreditCard,
  Shield,
} from 'lucide-react';
import { useState } from 'react';

const UserProfile = () => {
  const { user } = useAuth();
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const isLawyer = getCookie('x-active-role') === 'lawyer';
  const profile = useProfilePage();

  const plan = mockPlans.find((p) => p.id === mockSubscription.planId);

  return (
    <DashboardLayout>
      <div className="w-full space-y-6">
        <h1 className="text-2xl font-bold">Profile & Settings</h1>

        {isLawyer ? (
          <LawyerProfileForm profile={profile} />
        ) : (
          <UserProfileForm profile={profile} />
        )}

        {!isLawyer && plan && (
          <div className="space-y-3 rounded-xl border bg-card p-6">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-gold" />
              <h3 className="font-semibold">My Plan</h3>
            </div>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-lg font-bold">{plan.name} Plan</p>
                <p className="text-sm text-muted-foreground">
                  ₹{plan.price.toLocaleString('en-IN')}/{plan.period}
                </p>
              </div>
              <div className="text-right text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  Valid until{' '}
                  {new Date(mockSubscription.endDate).toLocaleDateString(
                    'en-IN',
                    { day: 'numeric', month: 'long', year: 'numeric' }
                  )}
                </div>
                <div className="mt-0.5 flex items-center gap-1 text-xs text-green-600">
                  <CheckCircle2 className="h-3 w-3" /> Active
                </div>
              </div>
            </div>
            <ul className="grid gap-1 sm:grid-cols-2">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-600" />
                  {f}
                </li>
              ))}
            </ul>
            <Button variant="outline" size="sm" asChild>
              <a href={ROUTES.user.subscription}>Manage Subscription</a>
            </Button>
          </div>
        )}

        {user?.provider === 'email' && (
          <div className="space-y-3 rounded-xl border bg-card p-6">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-gold" />
              <h3 className="font-semibold">Security</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Your data is encrypted and stored securely. All communications
              with your lawyer are confidential.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPasswordModalOpen(true)}
            >
              Change Password
            </Button>
          </div>
        )}
      </div>

      <PasswordResetModal
        open={passwordModalOpen}
        onOpenChange={setPasswordModalOpen}
      />
    </DashboardLayout>
  );
};

export default UserProfile;
