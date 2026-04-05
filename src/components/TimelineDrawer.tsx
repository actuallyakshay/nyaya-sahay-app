import { CaseTimeline } from '@/components/CaseTimeline';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { TimelineEvent } from '@/types';

interface TimelineDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  events: TimelineEvent[];
}

export const TimelineDrawer = ({
  open,
  onOpenChange,
  events,
}: TimelineDrawerProps) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent className="flex flex-col sm:max-w-md">
      <SheetHeader>
        <SheetTitle>Case Timeline</SheetTitle>
        <SheetDescription>
          History of all activity on this case.
        </SheetDescription>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto py-4">
        {events.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No activity yet.
          </p>
        ) : (
          <CaseTimeline events={events} />
        )}
      </div>
    </SheetContent>
  </Sheet>
);
