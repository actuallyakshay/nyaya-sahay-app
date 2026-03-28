import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  page: number;
  totalPages: number;
  total?: number;
  onNext: () => void;
  onPrev: () => void;
  onPageChange?: (page: number) => void;
}

const getPageNumbers = (current: number, total: number): (number | '...')[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | '...')[] = [1];

  if (current > 3) pages.push('...');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push('...');

  pages.push(total);
  return pages;
};

export const PaginationControls = ({ page, totalPages, total, onNext, onPrev, onPageChange }: Props) => {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(page, totalPages);

  const handlePageClick = (target: number) => {
    if (target === page) return;
    if (onPageChange) {
      onPageChange(target);
    } else if (target > page) {
      onNext();
    } else {
      onPrev();
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-4">
      {total !== undefined && (
        <p className="text-sm text-muted-foreground">
          Showing page {page} of {totalPages} ({total} total)
        </p>
      )}
      {total === undefined && (
        <p className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </p>
      )}

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={onPrev}
          disabled={page <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-sm text-muted-foreground">…</span>
          ) : (
            <Button
              key={p}
              variant={p === page ? 'default' : 'outline'}
              size="icon"
              className={`h-8 w-8 text-xs ${p === page ? 'bg-navy text-primary-foreground hover:bg-navy/90' : ''}`}
              onClick={() => handlePageClick(p)}
              disabled={p === page}
            >
              {p}
            </Button>
          )
        )}

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={onNext}
          disabled={page >= totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
