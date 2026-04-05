import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { CaseTimeline } from '@/components/CaseTimeline';
import type { TimelineEvent } from '@/types';

interface TimelineDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  events: TimelineEvent[];
}

export const TimelineDrawer = ({ open, onOpenChange, events }: TimelineDrawerProps) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent className="sm:max-w-md flex flex-col">
      <SheetHeader>
        <SheetTitle>Case Timeline</SheetTitle>
        <SheetDescription>History of all activity on this case.</SheetDescription>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto py-4">
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No activity yet.</p>
        ) : (
          <CaseTimeline events={events} />
        )}
      </div>
    </SheetContent>
  </Sheet>
);
