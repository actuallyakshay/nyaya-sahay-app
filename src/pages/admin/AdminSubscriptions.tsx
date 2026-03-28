import { AdminLayout } from '@/layouts/AdminLayout';
import { mockPlans, adminStats } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Edit, Check, Plus } from 'lucide-react';
import { useState } from 'react';
import { PlanFormModal } from '@/components/admin/PlanFormModal';
import { useToast } from '@/hooks/use-toast';
import type { SubscriptionPlan } from '@/types';

const AdminSubscriptions = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const { toast } = useToast();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Subscription Plans</h1>
          <p className="mt-1 text-muted-foreground">Manage and configure subscription plans.</p>
        </div>
        <Button onClick={() => { setEditingPlan(null); setModalOpen(true); }}><Plus className="mr-2 h-4 w-4" />Add Plan</Button>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">Basic Subscribers</p>
            <p className="mt-1 text-2xl font-bold">{adminStats.activePlans.basic}</p>
          </div>
          <div className="rounded-xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">Professional Subscribers</p>
            <p className="mt-1 text-2xl font-bold">{adminStats.activePlans.professional}</p>
          </div>
          <div className="rounded-xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">Premium Subscribers</p>
            <p className="mt-1 text-2xl font-bold">{adminStats.activePlans.premium}</p>
          </div>
        </div>

        <div className="space-y-4">
          {mockPlans.map(plan => (
            <div key={plan.id} className="rounded-xl border bg-card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <p className="text-2xl font-bold text-gold mt-1">₹{plan.price.toLocaleString('en-IN')}<span className="text-sm font-normal text-muted-foreground">/{plan.period}</span></p>
                </div>
                <Button variant="outline" size="sm"><Edit className="mr-2 h-3.5 w-3.5" />Edit</Button>
              </div>
              <ul className="mt-4 space-y-1.5">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-3.5 w-3.5 text-green-600 shrink-0" />{f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSubscriptions;
