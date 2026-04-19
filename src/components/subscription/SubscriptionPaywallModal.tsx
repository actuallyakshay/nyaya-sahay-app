import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useStartRazorpaySubscription } from '@/hooks/use-razorpay-subscription';

type SubscriptionPaywallModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When set, the primary action can call `POST /api/razorpay/subscriptions/start`. */
  subscriptionPlanId?: string;
  totalCount?: number;
};

export function SubscriptionPaywallModal({
  open,
  onOpenChange,
  subscriptionPlanId,
  totalCount = 12,
}: SubscriptionPaywallModalProps) {
  const start = useStartRazorpaySubscription();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Subscription required</DialogTitle>
          <DialogDescription>
            This area is for subscribed members. Continue to start checkout when your Razorpay
            account and plan linkage are ready.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Not now
          </Button>
          <Button
            type="button"
            disabled={!subscriptionPlanId || start.isPending}
            onClick={() => {
              if (!subscriptionPlanId) return;
              void start.mutateAsync({
                subscriptionPlanId,
                totalCount,
              });
            }}
          >
            {start.isPending ? 'Starting…' : 'Start subscription (API only)'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
