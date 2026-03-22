import { AdminLayout } from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const AdminSettings = () => {
  return (
    <AdminLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold">Platform Settings</h1>
          <p className="mt-1 text-muted-foreground">Configure global platform settings.</p>
        </div>

        <div className="rounded-xl border bg-card p-6 space-y-5">
          <h3 className="font-semibold">General</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Platform Name</Label>
              <Input defaultValue="NyayaSetu" />
            </div>
            <div className="space-y-2">
              <Label>Support Email</Label>
              <Input defaultValue="support@nyayasetu.in" />
            </div>
            <div className="space-y-2">
              <Label>Support Phone</Label>
              <Input defaultValue="+91 1800-XXX-XXXX" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 space-y-5">
          <h3 className="font-semibold">Notifications</h3>
          <div className="space-y-4">
            {[
              { label: 'Email notifications for new cases', id: 'email-cases' },
              { label: 'SMS alerts for emergency cases', id: 'sms-emergency' },
              { label: 'Weekly admin reports', id: 'weekly-reports' },
              { label: 'Auto-assign lawyers to new cases', id: 'auto-assign' },
            ].map(s => (
              <div key={s.id} className="flex items-center justify-between">
                <Label htmlFor={s.id} className="cursor-pointer">{s.label}</Label>
                <Switch id={s.id} defaultChecked />
              </div>
            ))}
          </div>
        </div>

        <Button>Save Settings</Button>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
