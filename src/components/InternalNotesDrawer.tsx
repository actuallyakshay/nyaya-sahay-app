import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { useInternalCaseNotes } from '@/hooks/useInternalCaseNotes';
import { getCookie, getFirstLetterCapitalized } from '@/lib/helpers';
import { Loader2, StickyNote } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { PaginationControls } from './PaginationControls';

interface InternalNotesDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InternalNotesDrawer = ({
  open,
  onOpenChange,
}: InternalNotesDrawerProps) => {
  const isUser = getCookie('x-active-role') === 'user' ? true : false;

  const { id } = useParams();

  const {
    noteText,
    setNoteText,
    page,
    setPage,
    handleAdd,
    isAddingNote,
    notes,
    totalPages,
    total,
  } = useInternalCaseNotes(id, { variant: 'lawyer', skipFetch: isUser });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <StickyNote className="h-4 w-4" /> Internal Notes
          </SheetTitle>
          <SheetDescription>
            Private notes visible only to lawyers and admins.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-3 overflow-y-auto py-4">
          {notes.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No internal notes yet.
            </p>
          ) : (
            notes.map((n) => (
              <div key={n.id} className="rounded-lg border bg-muted/30 p-3">
                <p className="whitespace-pre-wrap text-sm">{n.note}</p>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  <span
                    className={`inline-flex rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${n.author === 'lawyer' ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-purple-200 bg-purple-50 text-purple-700'}`}
                  >
                    {getFirstLetterCapitalized(n.author)}
                  </span>{' '}
                  •{' '}
                  {new Date(n.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="shrink-0 space-y-3">
          <PaginationControls
            page={page}
            totalPages={totalPages}
            total={total}
            onNext={() => setPage((p) => Math.min(p + 1, totalPages))}
            onPrev={() => setPage((p) => Math.max(p - 1, 1))}
            onPageChange={setPage}
            className="pt-0"
          />
          <Textarea
            placeholder="Write a note..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            className="min-h-[80px]"
          />
          <Button
            className="w-full"
            onClick={handleAdd}
            disabled={!noteText.trim() || isAddingNote}
          >
            {isAddingNote && <Loader2 className="h-4 w-4 animate-spin" />}
            Add Note
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
