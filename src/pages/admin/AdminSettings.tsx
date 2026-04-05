import { getAdminSettings, updateAdminSettings } from '@/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AdminLayout } from '@/layouts/AdminLayout';
import { queryClient } from '@/lib/query-client';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

const AdminSettings = () => {
  const [supportEmail, setSupportEmail] = useState('');
  const [supportPhone, setSupportPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const { data: settings } = useQuery({
    queryKey: ['adminSettings'],
    queryFn: async () => {
      const { data } = await getAdminSettings();
      setSupportEmail(data.supportEmail);
      setSupportPhone(data.supportPhone);
    },
  });

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      await updateAdminSettings({
        supportEmail,
        supportPhone,
      });
      await queryClient.invalidateQueries({ queryKey: ['adminSettings'] });
      toast({
        title: 'Settings saved successfully',
        description: 'The settings have been updated.',
      });
    } catch (error) {
      toast({
        title: 'Failed to save settings',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Platform Settings</h1>
          <p className="mt-1 text-muted-foreground">
            Configure global platform settings.
          </p>
        </div>

        <div className="space-y-5 rounded-xl border bg-card p-6">
          <h3 className="font-semibold">General</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Support Email</Label>
              <Input
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                placeholder="support@nyayasetu.in"
              />
            </div>
            <div className="space-y-2">
              <Label>Support Phone</Label>
              <Input
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                placeholder="+91 1800-XXX-XXXX"
              />
            </div>
          </div>
        </div>

        <Button onClick={handleSaveSettings} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Settings
        </Button>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
