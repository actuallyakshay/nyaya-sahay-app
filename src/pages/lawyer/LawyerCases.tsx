import { DashboardLayout } from '@/layouts/DashboardLayout';
import { mockCases } from '@/lib/mock-data';
import { StatusBadge } from '@/components/StatusBadge';
import { Link } from 'react-router-dom';
import { LEGAL_CATEGORIES } from '@/types';
import { usePagination } from '@/hooks/usePagination';
import { PaginationControls } from '@/components/PaginationControls';

const LawyerCases = () => {
  const cases = mockCases.filter((c) => c.lawyerId === 'l1');
  const { paginated, page, totalPages, next, prev } = usePagination(cases, 10);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">My Cases</h1>
        <div className="space-y-3">
          {paginated.map((c) => (
            <Link key={c.id} to={`/lawyer/cases/${c.id}`} className="block rounded-xl border bg-card p-4 transition-shadow hover:shadow-md">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="font-mono text-xs text-muted-foreground">{c.caseNumber}</span>
                <StatusBadge status={c.status} />
              </div>
              <p className="font-medium">{c.title}</p>
              <p className="text-sm text-muted-foreground">{c.userName} • {LEGAL_CATEGORIES[c.category]}</p>
            </Link>
          ))}
        </div>
        <PaginationControls page={page} totalPages={totalPages} onNext={next} onPrev={prev} />
      </div>
    </DashboardLayout>
  );
};

export default LawyerCases;
