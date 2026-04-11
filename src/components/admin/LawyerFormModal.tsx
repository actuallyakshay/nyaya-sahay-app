import { addLawyer, updateAdminLawyer } from '@/api-client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import WithShimmer from '@/components/WithShimmer';
import { useCategories } from '@/hooks/useCategories';
import { useFormErrors } from '@/hooks/useFormErrors';
import { queryClient } from '@/lib/query-client';
import { getApiErrorMessage, validateEmail, validatePhone } from '@/lib/utils';
import type { FieldErrors, LawyerFormModalProps } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useToast } from '../ui/use-toast';

export const LawyerFormModal = ({
  open,
  onClose,
  lawyer,
  onSave,
}: LawyerFormModalProps) => {
  const isEditMode = !!lawyer;
  const { toast } = useToast();
  const { errors, setErrors, clearError, hasErrors, resetErrors } =
    useFormErrors();

  // --- Form state ---

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [barCouncilId, setBarCouncilId] = useState('');
  const [degree, setDegree] = useState('');
  const [careerStartDate, setCareerStartDate] = useState('');
  const [bio, setBio] = useState('');
  const [selectedSpecializations, setSelectedSpecializations] = useState<
    string[]
  >([]);

  // --- Data ---

  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();

  // --- Form reset / populate ---

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setBarCouncilId('');
    setDegree('');
    setCareerStartDate('');
    setBio('');
    setSelectedSpecializations([]);
    resetErrors();
  };

  const populateFromLawyer = (data: NonNullable<typeof lawyer>) => {
    setName(data.user?.fullName ?? '');
    setEmail(data.user?.email ?? '');
    setPhone(data.user?.phone ?? '');
    setPassword('');

    setBarCouncilId(data.barCouncilId ?? '');
    setDegree(data.degree ?? '');
    setBio(data.bio ?? '');
    setCareerStartDate(
      data.careerStartDate
        ? new Date(data.careerStartDate).toISOString().split('T')[0]
        : ''
    );

    const practiceAreaIds = data.lawyerPracticeAreas
      ?.map((s) => s.practiceArea?.id)
      .filter(Boolean) as string[];
    setSelectedSpecializations(practiceAreaIds ?? []);

    resetErrors();
  };

  useEffect(() => {
    if (!open) return;
    lawyer ? populateFromLawyer(lawyer) : resetForm();
  }, [lawyer, open]);

  // --- Mutations ---

  const { mutateAsync: createLawyer, isPending: isCreating } = useMutation({
    mutationFn: addLawyer,
  });

  const { mutateAsync: editLawyer, isPending: isUpdating } = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      updateAdminLawyer(lawyer!.id, body),
  });

  const isPending = isCreating || isUpdating;

  // --- Validation ---

  const validate = (): boolean => {
    const newErrors: FieldErrors = {};

    if (!name.trim()) newErrors.name = 'Full name is required';

    if (!isEditMode) {
      const emailError = validateEmail(email);
      if (emailError) newErrors.email = emailError;
      if (!password.trim()) newErrors.password = 'Password is required';
    }

    if (phone.trim()) {
      const phoneError = validatePhone(phone);
      if (phoneError) newErrors.phone = phoneError;
    }

    if (hasErrors(newErrors)) {
      setErrors(newErrors);
      return false;
    }
    return true;
  };

  // --- Payload builders ---

  const buildSharedFields = () => ({
    barCouncilId: barCouncilId.trim(),
    degree: degree.trim(),
    bio: bio.trim(),
    lawyerPracticeAreas: selectedSpecializations,
  });

  const buildEditPayload = () => ({
    userProfile: { fullName: name.trim(), phone: phone.trim() },
    ...buildSharedFields(),
    careerStartDate: careerStartDate || null,
  });

  const buildCreatePayload = () => ({
    fullName: name.trim(),
    email: email.trim(),
    phone: phone.trim(),
    password: password.trim(),
    ...buildSharedFields(),
    careerStartDate: careerStartDate ? new Date(careerStartDate) : null,
  });

  // --- Submit ---

  const handleSave = async () => {
    if (!validate()) return;

    try {
      const response = isEditMode
        ? await editLawyer(buildEditPayload())
        : await createLawyer(buildCreatePayload());

      await queryClient.invalidateQueries({ queryKey: ['admin-lawyers'] });
      onSave(
        { name, email, phone, barCouncilId, degree, bio },
        response?.data?.message
      );
      resetForm();
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: getApiErrorMessage(error),
        variant: 'destructive',
      });
    }
  };

  // --- Helpers ---

  const toggleSpec = (id: string) => {
    setSelectedSpecializations((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  // --- Render ---

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Lawyer' : 'Add Lawyer'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name & Email */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  clearError('name');
                }}
                placeholder="Adv. Name"
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearError('email');
                }}
                placeholder="lawyer@example.com"
                disabled={isEditMode}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Password (create mode only) */}
          {!isEditMode && (
            <div className="space-y-1.5">
              <Label>
                Password <span className="text-destructive">*</span>
              </Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearError('password');
                }}
                placeholder="Enter password"
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}
            </div>
          )}

          {/* Phone & Bar Council ID */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <div className="flex rounded-md ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                <span className="inline-flex items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">
                  +91
                </span>
                <Input
                  className="rounded-l-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  placeholder="9876543210"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/\D/g, ''));
                    clearError('phone');
                  }}
                />
              </div>
              {errors.phone && (
                <p className="text-xs text-destructive">{errors.phone}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Bar Council ID</Label>
              <Input
                value={barCouncilId}
                onChange={(e) => setBarCouncilId(e.target.value)}
                placeholder="BCI/XX/XXXX/XXXX"
                disabled={isEditMode}
              />
            </div>
          </div>

          {/* Degree & Career Start Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Degree</Label>
              <Input
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                placeholder="LL.B, LL.M"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Career Start Date</Label>
              <Input
                type="date"
                value={careerStartDate}
                onChange={(e) => setCareerStartDate(e.target.value)}
              />
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <Label>Bio</Label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Short bio about the lawyer..."
              rows={3}
            />
          </div>

          {/* Specializations */}
          <div className="space-y-1.5">
            <Label>Specializations</Label>
            <div className="flex flex-wrap gap-1.5">
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
                      onClick={() => toggleSpec(cat.id)}
                      className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                        selectedSpecializations.includes(cat.id)
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-muted text-muted-foreground hover:bg-accent'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? 'Save Changes' : 'Add Lawyer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
