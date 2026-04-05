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
import type { User } from '@/types';
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

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (body: {
      name: string;
      email: string;
      phone: string;
      password: string;
    }) => await createAdminUser(body),
  });

  const handleSave = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    if (!trimmedPassword || !trimmedEmail) return;
    await mutateAsync({
      name: name.trim(),
      email: trimmedEmail,
      phone: phone.trim(),
      password: trimmedPassword,
    });
    await queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    onSave({ name, email, phone, password });
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
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Password</Label>
            <span className="ml-1 text-xs text-muted-foreground">*</span>
            <Input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 XXXXX XXXXX"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isPending || !email.trim() || !password.trim()}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4" />}
            {user ? 'Save Changes' : 'Add User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
