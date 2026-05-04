import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import {
  buildSamvidhanCardDataFromSubscription,
  downloadSamvidhanAdvisoryCardPdf,
} from '@/lib/samvidhan-advisory-card-pdf';
import type { MyRazorpaySubscriptionsResponse } from '@/types';
import { FileDown, Loader2 } from 'lucide-react';
import { useCallback, useState } from 'react';

interface DownloadSamvidhanCardProps {
  subscriptionPlan: NonNullable<
    MyRazorpaySubscriptionsResponse['subscription']
  >;
}

export const DownloadSamvidhanCard = ({
  subscriptionPlan,
}: DownloadSamvidhanCardProps) => {
  const { user } = useAuth();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      const data = buildSamvidhanCardDataFromSubscription({
        memberName: user?.fullName ?? '',
        memNumber: user?.memNumber ?? '',
        planName: subscriptionPlan.plan.name,
        currentPeriodStart: subscriptionPlan.currentPeriodStart ?? null,
        currentPeriodEnd: subscriptionPlan.currentPeriodEnd,
      });
      await downloadSamvidhanAdvisoryCardPdf(data);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Something went wrong.';
      toast({
        title: 'Could not create PDF',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setDownloading(false);
    }
  }, [subscriptionPlan, user]);

  return (
    <div className="space-y-3 rounded-xl border border-gold/25 bg-gold/5 p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <FileDown className="h-4 w-4 text-gold" />
        <h3 className="font-semibold">Legal Advisory card</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Download your Samvidhan Legal Advisory membership card as a PDF for your
        records.
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2 border-gold/40"
        disabled={downloading}
        onClick={handleDownload}
      >
        {downloading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Preparing…
          </>
        ) : (
          <>
            <FileDown className="h-3.5 w-3.5" />
            Download PDF
          </>
        )}
      </Button>
    </div>
  );
};
