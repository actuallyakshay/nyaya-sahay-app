import {
  getMyRazorpaySubscription,
  startRazorpaySubscription,
} from '@/api-client';
import { useAuth } from '@/contexts/AuthContext';
import type {
  RazorpayMySubscriptionResponse,
  RazorpayStartSubscriptionResponse,
} from '@/types/razorpay-subscription';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const razorpayMySubscriptionQueryKey = ['razorpay', 'subscription', 'me'] as const;

export function useRazorpayActiveSubscription(options?: { enabled?: boolean }) {
  const { isAuthenticated } = useAuth();
  const enabled = (options?.enabled ?? true) && isAuthenticated;

  return useQuery({
    queryKey: razorpayMySubscriptionQueryKey,
    enabled,
    queryFn: async () => {
      const { data } = await getMyRazorpaySubscription();
      return data as RazorpayMySubscriptionResponse;
    },
  });
}

export type StartRazorpaySubscriptionInput = {
  subscriptionPlanId: string;
  totalCount: number;
};

/**
 * Calls the backend to create a Razorpay subscription row + Razorpay subscription.
 * Opening Checkout / `shortUrl` is intentionally not implemented here yet.
 */
export function useStartRazorpaySubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: StartRazorpaySubscriptionInput) => {
      const { data } = await startRazorpaySubscription(input);
      return data as RazorpayStartSubscriptionResponse;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: razorpayMySubscriptionQueryKey });
    },
  });
}
