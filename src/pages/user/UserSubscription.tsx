import { getSubscriptionPlans } from '@/api-client';
import { SubscriptionPaywall } from '@/components/subscription/SubscriptionPaywall';
import { Button } from '@/components/ui/button';
import WithShimmer from '@/components/WithShimmer';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { mockPlans, mockSubscription } from '@/lib/mock-data';
import { useQuery } from '@tanstack/react-query';
import { Calendar, CheckCircle2 } from 'lucide-react';

const UserSubscription = () => {
  const plan = mockPlans.find((p) => p.id === mockSubscription.planId)!;

  const {
    data: subscriptionPlans,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['subscriptionPlans'],
    queryFn: async () => {
      const response = await getSubscriptionPlans();
      return response.data;
    },
  });

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold">Subscription</h1>

        {/* Current plan */}
        <div className="rounded-xl border-2 border-gold bg-card p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="rounded-full bg-gold/10 px-3 py-0.5 text-xs font-semibold text-gold">
                Active
              </span>
              <h2 className="mt-2 text-xl font-bold">{plan.name} Plan</h2>
              <p className="mt-1 text-2xl font-bold">
                ₹{plan.price.toLocaleString('en-IN')}
                <span className="text-sm font-normal text-muted-foreground">
                  /{plan.period}
                </span>
              </p>
            </div>
            <div className="text-right text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" /> Valid until{' '}
                {new Date(mockSubscription.endDate).toLocaleDateString(
                  'en-IN',
                  { day: 'numeric', month: 'long', year: 'numeric' }
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Auto-renewal: {mockSubscription.autoRenew ? 'On' : 'Off'}
              </p>
            </div>
          </div>
          <ul className="mt-4 grid gap-1.5 sm:grid-cols-2">
            {plan.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Upgrade — paywall + modal are wired to Razorpay APIs; Checkout not implemented yet */}
        <div>
          <h3 className="mb-4 text-lg font-semibold">Upgrade Your Plan</h3>
          <SubscriptionPaywall
            subscriptionPlanId={subscriptionPlans?.[0]?.id}
            totalCount={12}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="rounded-xl border bg-card p-5">
                    <WithShimmer loading className="h-5 w-3/4" />
                    <div className="mt-1 flex items-baseline gap-1">
                      <WithShimmer loading className="h-6 w-16" />
                      <WithShimmer loading className="h-4 w-12" />
                    </div>
                    <div className="mt-2 space-y-1">
                      <WithShimmer loading className="h-3 w-full" />
                      <WithShimmer loading className="h-3 w-4/5" />
                    </div>
                    <WithShimmer loading className="mt-4 h-8 w-full" />
                  </div>
                ))
              ) : error ? (
                <div className="col-span-full rounded-xl border bg-card p-8 text-center">
                  <p className="text-destructive">
                    Failed to load subscription plans. Please try again.
                  </p>
                </div>
              ) : subscriptionPlans?.length === 0 ? (
                <div className="col-span-full rounded-xl border bg-card p-8 text-center">
                  <p className="text-muted-foreground">
                    No subscription plans available.
                  </p>
                </div>
              ) : (
                subscriptionPlans?.map((p) => (
                  <div key={p.id} className="rounded-xl border bg-card p-5">
                    <h4 className="font-semibold">{p.name}</h4>
                    <p className="mt-1 text-lg font-bold">
                      ₹{parseFloat(p.priceInr).toLocaleString('en-IN')}
                      <span className="text-xs font-normal text-muted-foreground">
                        /{p.billingCycle}
                      </span>
                    </p>
                    {p.features && (
                      <div className="mt-2 space-y-1">
                        {p.features
                          .split(',')
                          .slice(0, 2)
                          .map((feature, index) => (
                            <p
                              key={index}
                              className="text-xs text-muted-foreground"
                            >
                              • {feature.trim()}
                            </p>
                          ))}
                      </div>
                    )}
                    <Button variant="outline" size="sm" className="mt-4 w-full">
                      Upgrade
                    </Button>
                  </div>
                ))
              )}
            </div>
          </SubscriptionPaywall>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserSubscription;
