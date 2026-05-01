import { PaginationControls } from '@/components/PaginationControls';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { useComposerEmojiInsert } from '@/hooks/use-composer-emoji-insert';
import { useInternalCaseNotes } from '@/hooks/useInternalCaseNotes';
import { getFirstLetterCapitalized } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { CaseStatus } from '@/types';
import EmojiPicker from 'emoji-picker-react';
import { ArrowUp, Loader2, Smile } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

interface AdminCaseInternalNotesContentProps {
  caseStatus?: CaseStatus;
}

export function AdminCaseInternalNotesContent({
  caseStatus,
}: AdminCaseInternalNotesContentProps) {
  const INTERNAL_NOTE_MAX_LENGTH = 2000;
  const NOTE_TEXTAREA_MAX_HEIGHT_PX = 140;

  const { id } = useParams();
  const isCaseClosed = caseStatus === 'closed' || caseStatus === 'rejected';

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
  } = useInternalCaseNotes(id, { variant: 'admin' });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const autoGrow = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, NOTE_TEXTAREA_MAX_HEIGHT_PX)}px`;
  }, []);

  const resetTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
  }, []);

  const { emojiPickerOpen, setEmojiPickerOpen, insertEmoji } =
    useComposerEmojiInsert({
      textareaRef,
      inputRef,
      composer: 'textarea',
      draft: noteText,
      maxLength: INTERNAL_NOTE_MAX_LENGTH,
      onDraftChange: setNoteText,
      onAfterEmojiInsertTextarea: autoGrow,
    });

  useEffect(() => {
    if (!noteText) resetTextarea();
  }, [noteText, resetTextarea]);

  const canAddNote = !isCaseClosed && !isAddingNote && !!noteText.trim();

  const handleSubmitNote = () => {
    if (!canAddNote) return;
    handleAdd();
    resetTextarea();
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-3">
      <div className="scrollbar-hide min-h-0 flex-1 space-y-3 overflow-y-auto py-1 pr-1">
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

      <div className="shrink-0 space-y-2 pt-3">
        <PaginationControls
          page={page}
          totalPages={totalPages}
          total={total}
          onNext={() => setPage((p) => Math.min(p + 1, totalPages))}
          onPrev={() => setPage((p) => Math.max(p - 1, 1))}
          onPageChange={setPage}
          className="pt-0"
        />
        <div
          className={cn(
            'flex flex-col gap-0.5 rounded-[1.1rem] border p-2 shadow-sm',
            'border-border/70 bg-muted/30'
          )}
        >
          <Textarea
            ref={textareaRef}
            placeholder={
              isCaseClosed ? 'Case is closed. Notes are locked.' : 'Write a note...'
            }
            value={noteText}
            onChange={(e) => {
              setNoteText(e.target.value);
              autoGrow();
            }}
            style={{ maxHeight: NOTE_TEXTAREA_MAX_HEIGHT_PX }}
            className={cn(
              'scrollbar-hide min-h-[40px] w-full resize-none overflow-y-auto border-0 bg-transparent px-2.5 py-2 text-[15px] leading-snug shadow-none',
              'placeholder:text-muted-foreground/80',
              'focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0'
            )}
            rows={1}
            maxLength={INTERNAL_NOTE_MAX_LENGTH}
            disabled={isCaseClosed}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmitNote();
              }
            }}
          />
          <div className="flex items-center justify-between gap-2 px-0.5 pb-0.5 pt-1">
            <div className="flex min-w-0 flex-1 items-center gap-0.5 [&_button]:h-9 [&_button]:w-9 [&_button]:shrink-0 [&_button]:rounded-full">
              <Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Insert emoji"
                    disabled={isCaseClosed}
                  >
                    <Smile className="h-5 w-5 stroke-[2]" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" side="top" className="w-auto p-0">
                  <EmojiPicker onEmojiClick={(d) => insertEmoji(d.emoji)} />
                </PopoverContent>
              </Popover>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={!canAddNote}
              className={cn(
                'h-9 w-9 shrink-0 rounded-full shadow-sm',
                canAddNote
                  ? 'bg-foreground text-background hover:bg-foreground/90 hover:text-background'
                  : 'bg-muted/80 text-muted-foreground hover:bg-muted/80 hover:text-muted-foreground'
              )}
              onClick={handleSubmitNote}
              aria-label="Add note"
            >
              {isAddingNote ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUp className="h-4 w-4 stroke-[2.5]" />
              )}
            </Button>
          </div>
        </div>
        {noteText.length > INTERNAL_NOTE_MAX_LENGTH - 200 ? (
          <p
            className={cn(
              'self-end text-[11px] tabular-nums',
              noteText.length >= INTERNAL_NOTE_MAX_LENGTH
                ? 'text-destructive'
                : 'text-muted-foreground'
            )}
          >
            {noteText.length}/{INTERNAL_NOTE_MAX_LENGTH}
          </p>
        ) : null}
      </div>
    </div>
  );
}
