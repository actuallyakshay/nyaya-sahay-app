import { getCurrentUser, updateUserProfile, uploadAsset } from '@/api-client';
import PasswordResetModal from '@/components/PasswordResetModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { getCookie } from '@/lib/helpers';
import { mockLawyers, mockPlans, mockSubscription } from '@/lib/mock-data';
import { LEGAL_CATEGORIES, LegalCategory } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  Camera,
  CheckCircle2,
  CreditCard,
  Shield,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const UserProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const isLawyer = getCookie('x-active-role') === 'lawyer';
  const lawyerData = isLawyer ? mockLawyers[0] : null;
  const [specializations, setSpecializations] = useState<LegalCategory[]>(
    lawyerData?.specializations || []
  );

  // Fetch current user data
  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await getCurrentUser();
      console.log('Current User API Response:', response.data);
      return response.data;
    },
  });

  // Set form values when data is loaded
  useEffect(() => {
    if (currentUser) {
      setFullName((currentUser as any)?.fullName || '');
      setPhone((currentUser as any)?.phone || '');
      setAvatar((currentUser as any)?.avatarUrl || null);
    }
  }, [currentUser]);

  // Update user profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    onError: () => {
      toast({
        title: 'Update failed',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const plan = mockPlans.find((p) => p.id === mockSubscription.planId);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsUploading(true);
        const response = await uploadAsset(file);
        console.log('Upload Asset API Response:', response.data);
        const avatarUrl = response.data.assetUrl; // Use assetUrl from response
        setAvatar(avatarUrl);

        toast({
          title: 'Photo uploaded',
          description:
            'Profile photo has been uploaded. Click Save Changes to update your profile.',
        });
      } catch (error) {
        toast({
          title: 'Upload failed',
          description: 'Failed to upload photo. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSaveChanges = () => {
    const payload: any = {
      fullName,
    };

    // Add optional fields only if they have values
    if (phone) payload.phone = phone;
    if (avatar) payload.avatarUrl = avatar;

    updateProfileMutation.mutate(payload);
  };

  // Check if form has changes to enable/disable save button
  const hasChanges = () => {
    const currentFullName = (currentUser as any)?.fullName || '';
    const currentPhone = (currentUser as any)?.phone || '';
    const currentAvatar = (currentUser as any)?.avatarUrl;

    return (
      fullName !== currentFullName ||
      phone !== currentPhone ||
      avatar !== currentAvatar // This will be true when user uploads new photo
    );
  };

  const toggleSpecialization = (cat: LegalCategory) => {
    setSpecializations((prev) =>
      prev.includes(cat) ? prev.filter((s) => s !== cat) : [...prev, cat]
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold">Profile & Settings</h1>

        <div className="space-y-5 rounded-xl border bg-card p-6">
          {isLoading ? (
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="mt-1 h-4 w-48" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <div className="group relative">
                  {avatar || (currentUser as any)?.avatarUrl ? (
                    <img
                      src={avatar || (currentUser as any)?.avatarUrl}
                      alt="Profile"
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-navy text-xl font-bold text-primary-foreground">
                      {(currentUser as any)?.fullName?.charAt(0) ||
                        (user as any)?.fullName?.charAt(0)}
                    </div>
                  )}
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={isUploading}
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-foreground/50 opacity-0 transition-opacity disabled:cursor-not-allowed group-hover:opacity-100"
                  >
                    <Camera className="h-5 w-5 text-white" />
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                    disabled={isUploading}
                  />
                </div>
                <div>
                  <p className="text-lg font-semibold">
                    {(currentUser as any)?.fullName || (user as any)?.fullName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {(currentUser as any)?.email || user?.email}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    value={(currentUser as any)?.email || user?.email}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
            </>
          )}

          {/* Lawyer-specific fields */}
          {isLawyer && lawyerData && (
            <div className="mt-3 border-t pt-5">
              <h3 className="mb-4 font-semibold">Professional Details</h3>
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
                    {(
                      Object.entries(LEGAL_CATEGORIES) as [
                        LegalCategory,
                        string,
                      ][]
                    ).map(([key, label]) => (
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
              </div>
            </div>
          )}

          {!isLoading && (
            <Button
              onClick={handleSaveChanges}
              disabled={
                updateProfileMutation.isPending || isUploading || !hasChanges()
              }
            >
              {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
        </div>

        {/* My Plan — for users */}
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
              <a href="/app/subscription">Manage Subscription</a>
            </Button>
          </div>
        )}

        <div className="space-y-3 rounded-xl border bg-card p-6">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-gold" />
            <h3 className="font-semibold">Security</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Your data is encrypted and stored securely. All communications with
            your lawyer are confidential.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPasswordModalOpen(true)}
          >
            Change Password
          </Button>
        </div>
      </div>

      <PasswordResetModal
        open={passwordModalOpen}
        onOpenChange={setPasswordModalOpen}
      />
    </DashboardLayout>
  );
};

export default UserProfile;
