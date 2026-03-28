import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { User } from '@/types';

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  user?: User | null;
  onSave: (data: Partial<User>) => void;
}

export const UserFormModal = ({ open, onClose, user, onSave }: UserFormModalProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone);
      setIsActive(user.isActive);
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setIsActive(true);
    }
  }, [user, open]);

  const handleSave = () => {
    if (!name.trim() || !email.trim()) return;
    onSave({ name, email, phone, isActive });
    onClose();
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
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Enter full name" />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter email" />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" />
          </div>
          <div className="flex items-center justify-between">
            <Label>Active</Label>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>{user ? 'Save Changes' : 'Add User'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
