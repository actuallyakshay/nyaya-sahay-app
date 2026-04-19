import { PaginationControls } from '@/components/PaginationControls';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useInternalCaseNotes } from '@/hooks/useInternalCaseNotes';
import { getFirstLetterCapitalized } from '@/lib/helpers';
import { CaseStatus } from '@/types';
import { Loader2 } from 'lucide-react';
import { useParams } from 'react-router-dom';

interface AdminCaseInternalNotesContentProps {
  caseStatus?: CaseStatus;
}

export function AdminCaseInternalNotesContent({
  caseStatus,
}: AdminCaseInternalNotesContentProps) {
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

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto py-1">
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
        <Textarea
          placeholder="Write a note..."
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          className="min-h-[60px]"
          rows={2}
          disabled={isCaseClosed}
        />
        <Button
          className="w-full"
          onClick={handleAdd}
          disabled={!noteText.trim() || isAddingNote || isCaseClosed}
        >
          {isAddingNote && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Add Note
        </Button>
      </div>
    </div>
  );
}
