import { getSubscriptionPlans } from '@/api-client';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { PublicLayout } from '@/layouts/PublicLayout';
import WithShimmer from '@/components/WithShimmer';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const PlansPage = () => {
  const { user, isAuthenticated } = useAuth();
  const isEndUser = Boolean(isAuthenticated && user?.roles?.includes('user'));

  const { data: plans, isLoading, error } = useQuery({
    queryKey: ['subscriptionPlans', 'public'],
    queryFn: async () => {
      const { data } = await getSubscriptionPlans();
      return data;
    },
  });

  const sorted = plans
    ? [...plans].sort((a, b) => {
        if (a.billingCycle === b.billingCycle) return 0;
        return a.billingCycle === 'monthly' ? -1 : 1;
      })
    : [];

  const subscribeTarget = isEndUser ? ROUTES.user.subscription : ROUTES.login;
  const price = (inr: string | number) => {
    const n = typeof inr === 'string' ? parseFloat(inr) : inr;
    if (Number.isNaN(n)) return '—';
    return n.toLocaleString('en-IN');
  };

  return (
    <PublicLayout>
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h1 className="text-3xl font-bold sm:text-4xl">Choose Your Legal Protection Plan</h1>
            <p className="mt-3 text-muted-foreground">
              Transparent pricing. No hidden fees. Cancel anytime. Pay securely via Razorpay.
            </p>
          </div>

          {isLoading ? (
            <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
              {[0, 1].map((i) => (
                <div key={i} className="rounded-xl border bg-card p-6 md:p-8">
                  <WithShimmer loading className="h-6 w-1/2" />
                  <div className="mt-4 flex items-baseline gap-1">
                    <WithShimmer loading className="h-10 w-28" />
                    <WithShimmer loading className="h-5 w-16" />
                  </div>
                  <div className="mt-6 space-y-2">
                    <WithShimmer loading className="h-4 w-full" />
                    <WithShimmer loading className="h-4 w-full" />
                    <WithShimmer loading className="h-4 w-4/5" />
                  </div>
                  <WithShimmer loading className="mt-8 h-10 w-full" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="mx-auto max-w-lg rounded-xl border bg-card p-8 text-center text-destructive">
              We could not load plans. Please refresh or try again later.
            </div>
          ) : sorted.length === 0 ? (
            <div className="mx-auto max-w-lg rounded-xl border bg-card p-8 text-center text-muted-foreground">
              No plans are configured yet.
            </div>
          ) : (
            <div
              className={`mx-auto grid max-w-5xl gap-6 ${sorted.length <= 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}
            >
              {sorted.map((plan) => {
                const features = (plan.features || '')
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean);
                const popular = plan.billingCycle === 'yearly';

                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-xl border p-6 md:p-8 ${
                      popular ? 'border-gold shadow-lg ring-1 ring-gold/20' : 'bg-card shadow-sm'
                    }`}
                  >
                    {popular && (
                      <span className="absolute -top-3 left-6 rounded-full bg-gold px-3 py-0.5 text-xs font-semibold text-accent-foreground">
                        Best value
                      </span>
                    )}
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    {plan.description && (
                      <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                    )}
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-3xl font-bold">₹{price(plan.priceInr)}</span>
                      <span className="text-sm text-muted-foreground">/{plan.billingCycle}</span>
                    </div>
                    <ul className="mt-6 space-y-2.5">
                      {(features.length ? features : ['Full app access after checkout']).map(
                        (f) => (
                          <li key={f} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                            {f}
                          </li>
                        )
                      )}
                    </ul>
                    <Button
                      className={`mt-8 w-full ${popular ? 'bg-gold text-accent-foreground hover:bg-gold/90' : ''}`}
                      variant={popular ? 'default' : 'outline'}
                      asChild
                    >
                      <Link to={subscribeTarget}>
                        {isEndUser ? 'Subscribe in dashboard' : 'Subscribe now'}
                      </Link>
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mx-auto mt-16 max-w-2xl text-center">
            <h3 className="mb-2 text-lg font-semibold">Payment methods</h3>
            <p className="text-sm text-muted-foreground">
              We support UPI, credit and debit cards, and net banking through Razorpay.
            </p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default PlansPage;
