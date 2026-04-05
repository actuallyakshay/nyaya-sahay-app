import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { SubscriptionPlan } from '@/types';
import { Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const SUGGESTED_FEATURES = [
  'Unlimited legal queries',
  'Standard response time (48 hrs)',
  'Priority response (24 hrs)',
  'Document review (up to 5/month)',
  'Unlimited document review',
  'Email support',
  'Phone consultation (2/month)',
  'Unlimited phone & video calls',
  'Case tracking dashboard',
  'Dedicated case manager',
  'Legal notice drafting',
  'Emergency consultation (4 hrs)',
  'On-site assistance (metro cities)',
  'Court representation coordination',
  'Priority case assignment',
  'Dedicated senior advocate',
];

interface PlanFormModalProps {
  open: boolean;
  onClose: () => void;
  plan?: SubscriptionPlan | null;
  onSave: (data: Partial<SubscriptionPlan> & { featuresRaw: string }) => void;
}

export const PlanFormModal = ({
  open,
  onClose,
  plan,
  onSave,
}: PlanFormModalProps) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('yearly');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [customFeature, setCustomFeature] = useState('');
  const [isPopular, setIsPopular] = useState(false);
  const [badge, setBadge] = useState('');

  useEffect(() => {
    if (plan) {
      setName(plan.name);
      setPrice(plan.price);
      setPeriod(plan.period);
      setSelectedFeatures([...plan.features]);
      setIsPopular(plan.isPopular || false);
      setBadge(plan.badge || '');
    } else {
      setName('');
      setPrice(0);
      setPeriod('yearly');
      setSelectedFeatures([]);
      setIsPopular(false);
      setBadge('');
    }
    setCustomFeature('');
  }, [plan, open]);

  const toggleFeature = (feature: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature]
    );
  };

  const addCustomFeature = () => {
    const trimmed = customFeature.trim();
    if (trimmed && !selectedFeatures.includes(trimmed)) {
      setSelectedFeatures((prev) => [...prev, trimmed]);
      setCustomFeature('');
    }
  };

  const removeFeature = (feature: string) => {
    setSelectedFeatures((prev) => prev.filter((f) => f !== feature));
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      name,
      price,
      period,
      features: selectedFeatures,
      isPopular,
      badge: badge || undefined,
      featuresRaw: selectedFeatures.join(';'),
    });
    onClose();
  };

  // Features not yet selected from suggestions
  const availableSuggestions = SUGGESTED_FEATURES.filter(
    (f) => !selectedFeatures.includes(f)
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{plan ? 'Edit Plan' : 'Add Plan'}</DialogTitle>
          <DialogDescription>
            Configure plan details and select features.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Plan Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Basic"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Price (₹)</Label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Billing Period</Label>
              <Select
                value={period}
                onValueChange={(v: 'monthly' | 'yearly') => setPeriod(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Badge (optional)</Label>
              <Input
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. Most Popular"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label>Mark as Popular</Label>
            <Switch checked={isPopular} onCheckedChange={setIsPopular} />
          </div>

          {/* Selected Features */}
          <div className="space-y-1.5">
            <Label>Selected Features ({selectedFeatures.length})</Label>
            {selectedFeatures.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {selectedFeatures.map((f, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                  >
                    {f}
                    <button
                      onClick={() => removeFeature(f)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No features selected yet. Pick from suggestions or add custom.
              </p>
            )}
          </div>

          {/* Add custom feature */}
          <div className="space-y-1.5">
            <Label>Add Custom Feature</Label>
            <div className="flex gap-2">
              <Input
                value={customFeature}
                onChange={(e) => setCustomFeature(e.target.value)}
                placeholder="Type a custom feature..."
                onKeyDown={(e) =>
                  e.key === 'Enter' && (e.preventDefault(), addCustomFeature())
                }
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addCustomFeature}
                disabled={!customFeature.trim()}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Suggested Features */}
          {availableSuggestions.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Suggested Features (click to add)
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {availableSuggestions.map((f, i) => (
                  <button
                    key={i}
                    onClick={() => toggleFeature(f)}
                    className="rounded-full border border-dashed px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    + {f}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {plan ? 'Save Changes' : 'Add Plan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
