import { createCaseSessionRequest } from '@/api-client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getApiErrorMessage } from '@/lib/utils';
import type {
  CaseSessionCallType,
  CreateCaseSessionRequestBody,
} from '@/types';
import { useMutation } from '@tanstack/react-query';
import { Phone, Video } from 'lucide-react';
import { useState } from 'react';

export const SessionBookingModal = ({
  bookingOpen,
  setBookingOpen,
  caseId,
  lawyerName,
}) => {
  const { toast } = useToast();
  const [callType, setCallType] = useState<CaseSessionCallType>('video');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');

  const { mutateAsync: submitSessionRequest, isPending } = useMutation({
    mutationFn: async () => {
      const requestedDate = new Date(`${preferredDate}T00:00:00`).toISOString();
      const body: CreateCaseSessionRequestBody = {
        caseId,
        requestedDate,
        requestedTime: preferredTime,
        callType,
        raisedBy: 'user',
      };

      return createCaseSessionRequest(caseId, body);
    },
  });

  const handleBookSession = async () => {
    try {
      await submitSessionRequest();
      toast({
        title: 'Session request sent',
        description:
          'Your consultation request has been submitted for admin approval',
      });
      setPreferredDate('');
      setPreferredTime('');
      setBookingOpen(false);
    } catch (err) {
      toast({
        title: getApiErrorMessage(err),
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Book Consultation</DialogTitle>
          <DialogDescription>
            {lawyerName
              ? `Schedule a session with ${lawyerName}. The request will be sent to admin for approval.`
              : 'Schedule a consultation. The request will be sent to admin for approval.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Session Type</Label>
            <Select
              value={callType}
              onValueChange={(value: CaseSessionCallType) => setCallType(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="video">
                  <span className="flex items-center gap-2">
                    <Video className="h-3.5 w-3.5" /> Video Call
                  </span>
                </SelectItem>
                <SelectItem value="phone">
                  <span className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5" /> Phone Call
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Preferred Date</Label>
            <Input
              type="date"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Preferred Time</Label>
            <Input
              type="time"
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
            />
          </div>
          <Button
            className="w-full"
            disabled={isPending || !preferredDate || !preferredTime}
            onClick={handleBookSession}
          >
            {isPending ? 'Sending…' : 'Send Booking Request'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
