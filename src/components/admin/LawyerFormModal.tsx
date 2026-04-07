import { addLawyer } from '@/api-client';
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
import { queryClient } from '@/lib/query-client';
import { validateEmail, validatePhone } from '@/lib/utils';
import type { FieldErrors, Lawyer, LawyerFormModalProps } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export const LawyerFormModal = ({
  open,
  onClose,
  lawyer,
  onSave,
}: LawyerFormModalProps) => {
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
  const [errors, setErrors] = useState<FieldErrors>({});

  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: addLawyer,
  });

  useEffect(() => {
    if (lawyer) {
      setName(lawyer.name);
      setEmail(lawyer.email);
      setPhone(lawyer.phone);
      setBarCouncilId(lawyer.barCouncilId);
      setDegree(lawyer.degree);
      setBio(lawyer.bio);
      setSelectedSpecializations([]);
    } else {
      resetForm();
    }
  }, [lawyer, open]);

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
    setErrors({});
  };

  const clearError = (field: keyof FieldErrors) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const toggleSpec = (id: string) => {
    setSelectedSpecializations((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    const newErrors: FieldErrors = {};

    if (!name.trim()) newErrors.name = 'Full name is required';

    const emailError = validateEmail(email);
    if (emailError) newErrors.email = emailError;

    if (!lawyer && !password.trim())
      newErrors.password = 'Password is required';

    if (phone.trim()) {
      const phoneError = validatePhone(phone);
      if (phoneError) newErrors.phone = phoneError;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      fullName: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password: password.trim(),
      barCouncilId: barCouncilId.trim(),
      degree: degree.trim(),
      careerStartDate: careerStartDate ? new Date(careerStartDate) : null,
      bio: bio.trim(),
      lawyerPracticeAreas: selectedSpecializations,
    };

    await mutateAsync(payload);
    await queryClient.invalidateQueries({ queryKey: ['admin-lawyers'] });
    onSave({ name, email, phone, barCouncilId, degree, bio });
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{lawyer ? 'Edit Lawyer' : 'Add Lawyer'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
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
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>
              Password {!lawyer && <span className="text-destructive">*</span>}
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <div className="flex">
                <span className="inline-flex items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">
                  +91
                </span>
                <Input
                  className="rounded-l-none"
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
              />
            </div>
          </div>

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
              <Label>Experience (years)</Label>
              <Input
                type="date"
                value={careerStartDate}
                onChange={(e) => setCareerStartDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Bio</Label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Short bio about the lawyer..."
              rows={3}
            />
          </div>
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
            {lawyer ? 'Save Changes' : 'Add Lawyer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
