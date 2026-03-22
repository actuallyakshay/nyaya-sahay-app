import { DashboardLayout } from '@/layouts/DashboardLayout';
import { mockSubscription, mockPlans } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { CheckCircle2, CreditCard, Calendar } from 'lucide-react';

const UserSubscription = () => {
  const plan = mockPlans.find((p) => p.id === mockSubscription.planId)!;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <h1 className="text-2xl font-bold">Subscription</h1>

        {/* Current plan */}
        <div className="rounded-xl border-2 border-gold bg-card p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <span className="rounded-full bg-gold/10 px-3 py-0.5 text-xs font-semibold text-gold">Active</span>
              <h2 className="mt-2 text-xl font-bold">{plan.name} Plan</h2>
              <p className="text-2xl font-bold mt-1">₹{plan.price.toLocaleString('en-IN')}<span className="text-sm font-normal text-muted-foreground">/{plan.period}</span></p>
            </div>
            <div className="text-right text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground"><Calendar className="h-3.5 w-3.5" /> Valid until {new Date(mockSubscription.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              <p className="mt-1 text-xs text-muted-foreground">Auto-renewal: {mockSubscription.autoRenew ? 'On' : 'Off'}</p>
            </div>
          </div>
          <ul className="mt-4 grid gap-1.5 sm:grid-cols-2">
            {plan.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm"><CheckCircle2 className="h-4 w-4 shrink-0 text-success mt-0.5" />{f}</li>
            ))}
          </ul>
        </div>

        {/* Upgrade */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Upgrade Your Plan</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {mockPlans.filter((p) => p.id !== mockSubscription.planId).map((p) => (
              <div key={p.id} className="rounded-xl border bg-card p-5">
                <h4 className="font-semibold">{p.name}</h4>
                <p className="text-lg font-bold mt-1">₹{p.price.toLocaleString('en-IN')}<span className="text-xs font-normal text-muted-foreground">/{p.period}</span></p>
                <Button variant="outline" size="sm" className="mt-4 w-full">Upgrade</Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserSubscription;
