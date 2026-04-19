/** Mirrors `RazorpayController` / `RazorpayService.getActiveSubscriptionForUser` (nyaya). */
export type RazorpayActiveSubscriptionPlan = {
  id: string;
  slug: string;
  name: string;
  billingCycle: string;
};

export type RazorpayActiveSubscriptionRow = {
  id: string;
  status: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  plan: RazorpayActiveSubscriptionPlan;
};

export type RazorpayMySubscriptionResponse =
  | {
      hasActiveSubscription: false;
      subscription: null;
    }
  | {
      hasActiveSubscription: true;
      subscription: RazorpayActiveSubscriptionRow;
    };

/** Response from `POST /api/razorpay/subscriptions/start`. */
export type RazorpayStartSubscriptionResponse = {
  subscriptionId: string;
  status: string;
  shortUrl?: string;
};
