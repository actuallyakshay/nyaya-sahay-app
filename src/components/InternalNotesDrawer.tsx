import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { StickyNote } from 'lucide-react';
import { useState } from 'react';

interface Note {
  text: string;
  by: string;
  at: string;
}

interface InternalNotesDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notes: Note[];
  onAddNote: (note: Note) => void;
  currentUserName: string;
}

export const InternalNotesDrawer = ({
  open,
  onOpenChange,
  notes,
  onAddNote,
  currentUserName,
}: InternalNotesDrawerProps) => {
  const [noteText, setNoteText] = useState('');
  const { toast } = useToast();

  const handleAdd = () => {
    if (!noteText.trim()) return;
    onAddNote({
      text: noteText.trim(),
      by: currentUserName,
      at: new Date().toISOString(),
    });
    setNoteText('');
    toast({ title: 'Note Added' });
  };

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
            notes.map((n, i) => (
              <div key={i} className="rounded-lg border bg-muted/30 p-3">
                <p className="text-sm">{n.text}</p>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {n.by} •{' '}
                  {new Date(n.at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="shrink-0 space-y-3 border-t pt-4">
          <Textarea
            placeholder="Write a note..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            className="min-h-[80px]"
          />
          <Button
            className="w-full"
            onClick={handleAdd}
            disabled={!noteText.trim()}
          >
            Add Note
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
