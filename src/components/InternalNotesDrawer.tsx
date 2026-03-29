import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StickyNote } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

export const InternalNotesDrawer = ({ open, onOpenChange, notes, onAddNote, currentUserName }: InternalNotesDrawerProps) => {
  const [noteText, setNoteText] = useState('');
  const { toast } = useToast();

  const handleAdd = () => {
    if (!noteText.trim()) return;
    onAddNote({ text: noteText.trim(), by: currentUserName, at: new Date().toISOString() });
    setNoteText('');
    toast({ title: 'Note Added' });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <StickyNote className="h-4 w-4" /> Internal Notes
          </SheetTitle>
          <SheetDescription>
            Private notes visible only to lawyers and admins.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto space-y-3 py-4">
          {notes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No internal notes yet.</p>
          ) : notes.map((n, i) => (
            <div key={i} className="rounded-lg border bg-muted/30 p-3">
              <p className="text-sm">{n.text}</p>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {n.by} • {new Date(n.at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t pt-4 space-y-3 shrink-0">
          <Textarea
            placeholder="Write a note..."
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            className="min-h-[80px]"
          />
          <Button className="w-full" onClick={handleAdd} disabled={!noteText.trim()}>
            Add Note
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
