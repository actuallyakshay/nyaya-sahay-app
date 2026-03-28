import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { SubscriptionPlan } from '@/types';

interface PlanFormModalProps {
  open: boolean;
  onClose: () => void;
  plan?: SubscriptionPlan | null;
  onSave: (data: Partial<SubscriptionPlan> & { featuresRaw: string }) => void;
}

export const PlanFormModal = ({ open, onClose, plan, onSave }: PlanFormModalProps) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('yearly');
  const [featuresRaw, setFeaturesRaw] = useState('');
  const [isPopular, setIsPopular] = useState(false);
  const [badge, setBadge] = useState('');

  useEffect(() => {
    if (plan) {
      setName(plan.name);
      setPrice(plan.price);
      setPeriod(plan.period);
      setFeaturesRaw(plan.features.join(';'));
      setIsPopular(plan.isPopular || false);
      setBadge(plan.badge || '');
    } else {
      setName(''); setPrice(0); setPeriod('yearly');
      setFeaturesRaw(''); setIsPopular(false); setBadge('');
    }
  }, [plan, open]);

  const parsedFeatures = featuresRaw.split(';').map(f => f.trim()).filter(Boolean);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      name,
      price,
      period,
      features: parsedFeatures,
      isPopular,
      badge: badge || undefined,
      featuresRaw,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{plan ? 'Edit Plan' : 'Add Plan'}</DialogTitle>
          <DialogDescription>Features are stored as semicolon-separated values.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Plan Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Basic" />
            </div>
            <div className="space-y-1.5">
              <Label>Price (₹)</Label>
              <Input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Billing Period</Label>
              <Select value={period} onValueChange={(v: 'monthly' | 'yearly') => setPeriod(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Badge (optional)</Label>
              <Input value={badge} onChange={e => setBadge(e.target.value)} placeholder="e.g. Most Popular" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label>Mark as Popular</Label>
            <Switch checked={isPopular} onCheckedChange={setIsPopular} />
          </div>
          <div className="space-y-1.5">
            <Label>Features (semicolon-separated)</Label>
            <Textarea
              rows={5}
              value={featuresRaw}
              onChange={e => setFeaturesRaw(e.target.value)}
              placeholder="Feature 1;Feature 2;Feature 3"
              className="font-mono text-sm"
            />
          </div>
          {parsedFeatures.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Preview ({parsedFeatures.length} features)</Label>
              <ul className="space-y-1 rounded-lg border bg-muted/30 p-3">
                {parsedFeatures.map((f, i) => (
                  <li key={i} className="text-sm text-muted-foreground">• {f}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>{plan ? 'Save Changes' : 'Add Plan'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
