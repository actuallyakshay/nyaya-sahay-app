import {
  getCurrentUser,
  updateLawyerProfile,
  updateUserProfile,
  uploadAsset,
} from '@/api-client';
import PasswordResetModal from '@/components/PasswordResetModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import WithShimmer from '@/components/WithShimmer';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useCategories } from '@/hooks/useCategories';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { getCookie } from '@/lib/helpers';
import { mockPlans, mockSubscription } from '@/lib/mock-data';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  Camera,
  CheckCircle2,
  CreditCard,
  MapPin,
  Shield,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const UserProfile = () => {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const isLawyer = getCookie('x-active-role') === 'lawyer';
  const [selectedSpecializations, setSelectedSpecializations] = useState<
    string[]
  >([]);

  // Lawyer-specific form state
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [degree, setDegree] = useState('');
  const [barCouncilId, setBarCouncilId] = useState('');
  const [careerStartDate, setCareerStartDate] = useState('');
  const [bio, setBio] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [lawyerState, setLawyerState] = useState('');
  const [pincode, setPincode] = useState('');
  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories(isLawyer);

  // Fetch current user data
  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await getCurrentUser();
      setUser(response.data);
      return response.data;
    },
  });

  // Set form values when data is loaded
  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser?.fullName || '');
      setPhone(currentUser?.phone || '');
      setAvatar(currentUser?.avatarUrl || null);

      // Populate lawyer fields from API response
      const lp = currentUser?.lawyerProfile;
      if (lp) {
        setDegree(lp.degree || '');
        setBarCouncilId(lp.barCouncilId || '');
        setCareerStartDate(lp.careerStartDate?.split('T')[0] || '');
        setGender(lp.gender || '');
        setDob(lp.dob?.split('T')[0] || '');
        setBio(lp.bio || '');
        setAddressLine1(lp.addressLine1 || '');
        setAddressLine2(lp.addressLine2 || '');
        setCity(lp.city || '');
        setLawyerState(lp.state || '');
        setPincode(lp.pincode || '');
        setSelectedSpecializations(
          lp.lawyerPracticeAreas?.map(
            (a: { practiceAreaId: string }) => a.practiceAreaId
          ) || []
        );
      }
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
    onSettled: () => {
      setIsUploading(false);
    },
  });

  // Update lawyer profile mutation
  const updateLawyerMutation = useMutation({
    mutationFn: updateLawyerProfile,
    onSuccess: (response) => {
      console.log('Lawyer profile updated:', response.data);
      toast({
        title: 'Profile updated',
        description: 'Your lawyer profile has been updated successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Update failed',
        description: 'Failed to update lawyer profile. Please try again.',
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
        const avatarUrl = response.data.assetUrl;
        await updateProfileMutation.mutateAsync({ avatarUrl });
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
    updateProfileMutation.mutate({ fullName, phone });
    if (isLawyer) {
      const lawyerPayload: Record<string, unknown> = {
        userProfile: { fullName, phone, avatarUrl: avatar },
        gender,
        dob,
        degree,
        barCouncilId,
        bio,
        addressLine1,
        addressLine2,
        city,
        state: lawyerState,
        pincode,
        lawyerPracticeAreas: selectedSpecializations,
      };
      if (careerStartDate) {
        lawyerPayload.careerStartDate = new Date(careerStartDate).toISOString();
      }
      console.log('Updating lawyer profile with:', lawyerPayload);
      updateLawyerMutation.mutate(lawyerPayload);
    }
  };

  // Check if form has changes to enable/disable save button
  const hasChanges = () => {
    const cu = currentUser;
    if (!cu) return false;

    const basicChanged =
      fullName !== (cu.fullName || '') ||
      phone !== (cu.phone || '') ||
      avatar !== cu.avatarUrl;

    if (!isLawyer) return basicChanged;

    const lp = cu.lawyerProfile;
    const lawyerChanged =
      degree !== (lp?.degree || '') ||
      barCouncilId !== (lp?.barCouncilId || '') ||
      careerStartDate !== (lp?.careerStartDate?.split('T')[0] || '') ||
      gender !== (lp?.gender || '') ||
      dob !== (lp?.dob?.split('T')[0] || '') ||
      bio !== (lp?.bio || '') ||
      addressLine1 !== (lp?.addressLine1 || '') ||
      addressLine2 !== (lp?.addressLine2 || '') ||
      city !== (lp?.city || '') ||
      lawyerState !== (lp?.state || '') ||
      pincode !== (lp?.pincode || '') ||
      JSON.stringify(selectedSpecializations.slice().sort()) !==
        JSON.stringify(
          (lp?.lawyerPracticeAreas?.map((a: { practiceAreaId: string }) => a.practiceAreaId) || []).slice().sort()
        );

    return basicChanged || lawyerChanged;
  };

  const toggleSpecialization = (id: string) => {
    setSelectedSpecializations((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  return (
    <DashboardLayout>
      <div className="w-full space-y-6">
        <h1 className="text-2xl font-bold">Profile & Settings</h1>

        <div className="space-y-5 rounded-xl border bg-card p-6">
          <>
            <div className="flex items-center gap-4">
              <WithShimmer
                loading={isLoading || isUploading}
                className="h-16 w-16 rounded-full"
              >
                <div className="group relative">
                  {avatar || currentUser?.avatarUrl ? (
                    <img
                      src={avatar || currentUser?.avatarUrl}
                      alt="Profile"
                      referrerPolicy="no-referrer"
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-navy text-xl font-bold text-primary-foreground">
                      {currentUser?.fullName?.charAt(0) ||
                        user?.fullName?.charAt(0)}
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
              </WithShimmer>
              <div>
                <WithShimmer loading={isLoading} className="h-6 w-32">
                  <p className="text-lg font-semibold">
                    {currentUser?.fullName || user?.fullName}
                  </p>
                </WithShimmer>
                <WithShimmer loading={isLoading} className="mt-1 h-4 w-48">
                  <p className="text-sm text-muted-foreground">
                    {currentUser?.email || user?.email}
                  </p>
                </WithShimmer>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <WithShimmer loading={isLoading} className="h-10 w-full">
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </WithShimmer>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <WithShimmer loading={isLoading} className="h-10 w-full">
                  <Input value={currentUser?.email || user?.email} disabled />
                </WithShimmer>
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <WithShimmer loading={isLoading} className="h-10 w-full">
                  <Input
                    value={phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setPhone(val);
                    }}
                    placeholder="Enter your phone number"
                    maxLength={10}
                    inputMode="numeric"
                  />
                </WithShimmer>
              </div>
            </div>
          </>

          {/* Lawyer-specific fields */}
          {isLawyer && (
            <div className="mt-3 border-t pt-5">
              <h3 className="mb-4 font-semibold">Professional Details</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Degree / Qualification</Label>
                  <WithShimmer loading={isLoading} className="h-10 w-full">
                    <Input
                      value={degree}
                      onChange={(e) => setDegree(e.target.value)}
                      placeholder="Enter degree / qualification"
                    />
                  </WithShimmer>
                </div>
                <div className="space-y-2">
                  <Label>Career Started From</Label>
                  <WithShimmer loading={isLoading} className="h-10 w-full">
                    <Input
                      type="date"
                      value={careerStartDate}
                      onChange={(e) => setCareerStartDate(e.target.value)}
                    />
                  </WithShimmer>
                </div>
                <div className="space-y-2">
                  <Label>Bar Council ID</Label>
                  <WithShimmer loading={isLoading} className="h-10 w-full">
                    <Input
                      value={barCouncilId}
                      onChange={(e) => setBarCouncilId(e.target.value)}
                      placeholder="Enter Bar Council ID"
                    />
                  </WithShimmer>
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <WithShimmer loading={isLoading} className="h-10 w-full">
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </WithShimmer>
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <WithShimmer loading={isLoading} className="h-10 w-full">
                    <Input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                    />
                  </WithShimmer>
                </div>
                <div className="space-y-2">
                  <Label>Specializations</Label>
                  <div className="flex flex-wrap gap-1.5 rounded-lg border p-2.5">
                    {categoriesLoading
                      ? Array.from({ length: 6 }).map((_, i) => (
                          <WithShimmer
                            key={i}
                            loading
                            className="h-7 w-20 rounded-full"
                          />
                        ))
                      : categories.map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => toggleSpecialization(cat.id)}
                            className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                              selectedSpecializations.includes(cat.id)
                                ? 'bg-gold text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                          >
                            {cat.name}
                          </button>
                        ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Address Details — Lawyer only */}
          {isLawyer && (
            <div className="mt-3 border-t pt-5">
              <div className="mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gold" />
                <h3 className="font-semibold">Address Details</h3>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Address Line 1</Label>
                  <WithShimmer loading={isLoading} className="h-10 w-full">
                    <Input
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      placeholder="Street address, building name"
                    />
                  </WithShimmer>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Address Line 2</Label>
                  <WithShimmer loading={isLoading} className="h-10 w-full">
                    <Input
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      placeholder="Apartment, suite, floor (optional)"
                    />
                  </WithShimmer>
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <WithShimmer loading={isLoading} className="h-10 w-full">
                    <Input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Enter city"
                    />
                  </WithShimmer>
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <WithShimmer loading={isLoading} className="h-10 w-full">
                    <Input
                      value={lawyerState}
                      onChange={(e) => setLawyerState(e.target.value)}
                      placeholder="Enter state"
                    />
                  </WithShimmer>
                </div>
                <div className="space-y-2">
                  <Label>Pincode</Label>
                  <WithShimmer loading={isLoading} className="h-10 w-full">
                    <Input
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="Enter pincode"
                      maxLength={6}
                    />
                  </WithShimmer>
                </div>
              </div>
            </div>
          )}

          {/* Bio — Lawyer only */}
          {isLawyer && (
            <div className="mt-3 border-t pt-5">
              <div className="space-y-2">
                <Label>Bio</Label>
                <WithShimmer loading={isLoading} className="h-10 w-full">
                  <Input
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself"
                  />
                </WithShimmer>
              </div>
            </div>
          )}

          {!isLoading && (
            <WithShimmer loading={isLoading} className="h-10 w-32">
              <Button
                onClick={handleSaveChanges}
                disabled={
                  updateProfileMutation.isPending ||
                  updateLawyerMutation.isPending ||
                  isUploading ||
                  !hasChanges()
                }
              >
                {updateProfileMutation.isPending ||
                updateLawyerMutation.isPending
                  ? 'Saving...'
                  : 'Save Changes'}
              </Button>
            </WithShimmer>
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
