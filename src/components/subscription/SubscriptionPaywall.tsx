import { SubscriptionPaywallModal } from '@/components/subscription/SubscriptionPaywallModal';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useRazorpayActiveSubscription } from '@/hooks/use-razorpay-subscription';
import { useState, type ReactNode } from 'react';

type SubscriptionPaywallProps = {
  children: ReactNode;
  subscriptionPlanId?: string;
  totalCount?: number;
};

/**
 * When the user is logged in and has no active paid Razorpay subscription, shows a light
 * overlay with a CTA that opens {@link SubscriptionPaywallModal}. Unauthenticated users
 * see children unchanged.
 */
export function SubscriptionPaywall({
  children,
  subscriptionPlanId,
  totalCount,
}: SubscriptionPaywallProps) {
  const { isAuthenticated } = useAuth();
  const { data, isLoading, isError } = useRazorpayActiveSubscription();
  const [modalOpen, setModalOpen] = useState(false);

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  if (isLoading || isError) {
    return <>{children}</>;
  }

  if (data?.hasActiveSubscription) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="relative rounded-xl border border-dashed border-muted-foreground/40">
        <div className="pointer-events-none select-none opacity-50 blur-[0.5px]">{children}</div>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/70 p-4 text-center">
          <p className="max-w-sm text-sm text-muted-foreground">
            Subscribe to unlock this section. Payment UI (Razorpay Checkout / hosted page) is not
            wired yet—only the API call from the modal.
          </p>
          <Button type="button" size="sm" onClick={() => setModalOpen(true)}>
            View subscription options
          </Button>
        </div>
      </div>
      <SubscriptionPaywallModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        subscriptionPlanId={subscriptionPlanId}
        totalCount={totalCount}
      />
    </>
  );
}
