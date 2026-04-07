import { useState } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { mockSubscription, mockPlans } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { CheckCircle2, CreditCard, Calendar, Crown, Smartphone, Building2, Globe } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { SubscriptionPlan } from '@/types';

const UserSubscription = () => {
  const plan = mockPlans.find((p) => p.id === mockSubscription.planId)!;
  const hasSubscription = mockSubscription.status === 'active';
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = (p: SubscriptionPlan) => {
    setSelectedPlan(p);
    setPaymentOpen(true);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 2000));
    setProcessing(false);
    setPaymentOpen(false);
    toast({
      title: 'Payment Successful!',
      description: `You have subscribed to the ${selectedPlan?.name} plan. Enjoy your legal protection!`,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold">Subscription</h1>
          <p className="mt-1 text-muted-foreground">
            {hasSubscription ? 'Manage your current plan or upgrade.' : 'Choose a plan to access all legal services.'}
          </p>
        </div>

        {/* Current plan status */}
        {hasSubscription ? (
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
        ) : (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
            <Crown className="mx-auto h-10 w-10 text-gold mb-3" />
            <h2 className="text-lg font-bold">No Active Subscription</h2>
            <p className="text-sm text-muted-foreground mt-1">Subscribe to a plan below to raise legal queries and connect with advocates.</p>
          </div>
        )}

        {/* Plans */}
        <div>
          <h3 className="text-lg font-semibold mb-4">{hasSubscription ? 'Upgrade Your Plan' : 'Choose a Plan'}</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            {mockPlans.map((p) => {
              const isCurrent = hasSubscription && p.id === mockSubscription.planId;
              return (
                <div key={p.id} className={`relative rounded-xl border p-5 transition-shadow hover:shadow-md ${p.isPopular ? 'border-gold ring-1 ring-gold/20' : 'bg-card'} ${isCurrent ? 'opacity-60' : ''}`}>
                  {p.badge && <span className="absolute -top-3 left-5 rounded-full bg-gold px-3 py-0.5 text-xs font-semibold text-accent-foreground">{p.badge}</span>}
                  <h4 className="font-semibold">{p.name}</h4>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-bold">₹{p.price.toLocaleString('en-IN')}</span>
                    <span className="text-xs text-muted-foreground">/{p.period}</span>
                  </div>
                  <ul className="mt-4 space-y-1.5">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />{f}</li>
                    ))}
                  </ul>
                  <Button
                    className={`mt-5 w-full ${p.isPopular ? 'bg-gold text-accent-foreground hover:bg-gold/90' : ''}`}
                    variant={p.isPopular ? 'default' : 'outline'}
                    disabled={isCurrent}
                    onClick={() => handleSubscribe(p)}
                  >
                    {isCurrent ? 'Current Plan' : 'Subscribe Now'}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">Secure payments powered by Razorpay. We support UPI, Credit/Debit Cards, and Net Banking.</p>
        </div>
      </div>

      {/* Payment Modal */}
      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-gold" /> Complete Payment
            </DialogTitle>
            <DialogDescription>
              Subscribe to <strong>{selectedPlan?.name}</strong> plan for ₹{selectedPlan?.price.toLocaleString('en-IN')}/{selectedPlan?.period}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePayment} className="space-y-4 pt-2">
            {/* Payment method tabs */}
            <div className="grid grid-cols-3 gap-2">
              {([
                { key: 'upi' as const, label: 'UPI', icon: Smartphone },
                { key: 'card' as const, label: 'Card', icon: CreditCard },
                { key: 'netbanking' as const, label: 'Net Banking', icon: Building2 },
              ]).map((m) => (
                <button
                  type="button"
                  key={m.key}
                  onClick={() => setPaymentMethod(m.key)}
                  className={`flex flex-col items-center gap-1 rounded-lg border p-3 text-xs transition-colors ${paymentMethod === m.key ? 'border-gold bg-gold/10 text-foreground' : 'bg-card hover:bg-muted'}`}
                >
                  <m.icon className="h-4 w-4" />
                  {m.label}
                </button>
              ))}
            </div>

            {/* UPI */}
            {paymentMethod === 'upi' && (
              <div className="space-y-2">
                <Label htmlFor="upi-id">UPI ID</Label>
                <Input id="upi-id" placeholder="yourname@upi" required />
              </div>
            )}

            {/* Card */}
            {paymentMethod === 'card' && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="card-number">Card Number</Label>
                  <Input id="card-number" placeholder="1234 5678 9012 3456" maxLength={19} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="card-expiry">Expiry</Label>
                    <Input id="card-expiry" placeholder="MM/YY" maxLength={5} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="card-cvv">CVV</Label>
                    <Input id="card-cvv" placeholder="•••" type="password" maxLength={4} required />
                  </div>
                </div>
              </div>
            )}

            {/* Net Banking */}
            {paymentMethod === 'netbanking' && (
              <div className="space-y-2">
                <Label>Select Bank</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['SBI', 'HDFC', 'ICICI', 'Axis', 'PNB', 'Kotak'].map((bank) => (
                    <label key={bank} className="flex items-center gap-2 rounded-lg border p-2.5 text-sm cursor-pointer hover:bg-muted">
                      <input type="radio" name="bank" value={bank} required className="accent-gold" />
                      {bank}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-lg border bg-muted/30 p-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Amount</span>
              <span className="font-bold text-lg">₹{selectedPlan?.price.toLocaleString('en-IN')}</span>
            </div>

            <Button type="submit" className="w-full bg-gold text-accent-foreground hover:bg-gold/90" disabled={processing}>
              {processing ? 'Processing Payment...' : `Pay ₹${selectedPlan?.price.toLocaleString('en-IN')}`}
            </Button>

            <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Globe className="h-3 w-3" /> Secured by Razorpay. 256-bit SSL encryption.
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default UserSubscription;
