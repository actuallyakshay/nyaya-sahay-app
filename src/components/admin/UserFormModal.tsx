import { createAdminUser, updateAdminUser } from '@/api-client';
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
import type { FieldErrors, User, UserFormModalProps } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export const UserFormModal = ({
  open,
  onClose,
  user,
  onSave,
}: UserFormModalProps) => {
  const isEditMode = !!user;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (open && user) {
      setName(user.fullName ?? user.name ?? '');
      setEmail(user.email ?? '');
      setPhone(user.phone ?? '');
      setPassword('');
      setErrors({});
    } else if (open) {
      setName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setErrors({});
    }
  }, [open, user]);

  const { mutateAsync: createUser, isPending: isCreating } = useMutation({
    mutationFn: async (body: {
      fullName: string;
      email: string;
      phone: string;
      password?: string;
    }) => await createAdminUser(body),
  });

  const { mutateAsync: editUser, isPending: isUpdating } = useMutation({
    mutationFn: async (body: { fullName: string; phone: string }) =>
      await updateAdminUser(user!.id, body),
  });

  const isPending = isCreating || isUpdating;

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

    if (!isEditMode && !password.trim()) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      fullName: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      ...(isEditMode ? {} : { password: password.trim() }),
    };
    let response;
    if (isEditMode) {
      response = await editUser({ fullName: payload.fullName, phone: payload.phone });
    } else {
      response = await createUser(payload);
    }
    await queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    onSave(payload, response?.data?.message);
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
              disabled={isEditMode}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>
          {!isEditMode && (
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
          )}
          <div className="space-y-2">
            <Label htmlFor="profile-phone">Phone Number</Label>
            <div className="flex rounded-md ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
              <span className="inline-flex items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">
                +91
              </span>
              <Input
                id="profile-phone"
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
