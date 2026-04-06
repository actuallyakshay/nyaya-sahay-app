import { createAdminUser } from '@/api-client';
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
import { queryClient } from '@/lib/query-client';
import { validateEmail, validatePhone } from '@/lib/utils';
import type { FieldErrors, User } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  user?: User | null;
  onSave: (data: Partial<User>) => void;
}

export const UserFormModal = ({
  open,
  onClose,
  user,
  onSave,
}: UserFormModalProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (body: {
      name: string;
      email: string;
      phone: string;
      password: string;
    }) => await createAdminUser(body),
  });

  const clearError = (field: keyof FieldErrors) => {
    if (errors[field]) {
      setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
    }
  };

  const handleSave = async () => {
    const newErrors: FieldErrors = {};

    const emailError = validateEmail(email);
    if (emailError) newErrors.email = emailError;

    if (phone.trim()) {
      const phoneError = validatePhone(phone);
      if (phoneError) newErrors.phone = phoneError;
    }

    if (!password.trim()) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    await mutateAsync({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password: password.trim(),
    });
    await queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    onSave({ name, email, phone, password });
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{user ? 'Edit User' : 'Add User'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Full Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter full name"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <span className="ml-1 text-xs text-muted-foreground">*</span>
            <Input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearError('email'); }}
              placeholder="Enter email"
              required
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Password</Label>
            <span className="ml-1 text-xs text-muted-foreground">*</span>
            <Input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearError('password'); }}
              placeholder="Enter password"
              required
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-phone">Phone Number</Label>
            <div className="flex">
              <span className="inline-flex items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">
                +91
              </span>
              <Input
                id="profile-phone"
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4" />}
            {user ? 'Save Changes' : 'Add User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
