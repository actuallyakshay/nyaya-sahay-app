import { resetPassword } from '@/api-client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

interface PasswordResetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PasswordResetModal = ({
  open,
  onOpenChange,
}: PasswordResetModalProps) => {
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState('');

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      toast({
        title: 'Password updated',
        description: 'Your password has been updated successfully.',
      });
      onOpenChange(false);
      setNewPassword('');

      // Redirect to current page after successful password reset
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    },
    onError: () => {
      toast({
        title: 'Password update failed',
        description: 'Failed to update password. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handlePasswordReset = () => {
    if (!newPassword.trim()) {
      toast({
        title: 'Password required',
        description: 'Please enter a new password.',
        variant: 'destructive',
      });
      return;
    }

    resetPasswordMutation.mutate({
      newPassword,
    });
  };

  const handleCancel = () => {
    onOpenChange(false);
    setNewPassword('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Enter your new password below to update your account.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={resetPasswordMutation.isPending}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={resetPasswordMutation.isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePasswordReset}
              disabled={resetPasswordMutation.isPending || !newPassword.trim()}
              className="flex-1"
            >
              {resetPasswordMutation.isPending
                ? 'Updating...'
                : 'Update Password'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordResetModal;
