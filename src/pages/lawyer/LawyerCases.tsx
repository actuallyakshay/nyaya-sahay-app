import { DashboardLayout } from '@/layouts/DashboardLayout';
import { CASE_STATUS_FILTERS, mockCases } from '@/lib/mock-data';
import { StatusBadge } from '@/components/StatusBadge';
import { Link } from 'react-router-dom';
import { LEGAL_CATEGORIES } from '@/types';
import { usePagination } from '@/hooks/usePagination';
import { PaginationControls } from '@/components/PaginationControls';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { useState, useMemo } from 'react';

const LawyerCases = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const cases = mockCases.filter((c) => c.lawyerId === 'l1');

  const filtered = useMemo(() => {
    return cases.filter(c => {
      const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.caseNumber.toLowerCase().includes(search.toLowerCase()) ||
        c.userName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter, cases]);

  const { paginated, page, totalPages, next, prev } = usePagination(filtered, 10);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">My Cases</h1>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search cases..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CASE_STATUS_FILTERS.map(s => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Case #</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Client</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Category</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Priority</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Updated</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No cases found.</td></tr>
              ) : paginated.map((c) => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs">{c.caseNumber}</td>
                  <td className="px-4 py-3 font-medium max-w-[200px] truncate">
                    <Link to={`/lawyer/cases/${c.id}`} className="hover:text-gold hover:underline">{c.title}</Link>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">{c.userName}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{LEGAL_CATEGORIES[c.category]}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      c.priority === 'urgent' ? 'bg-destructive/10 text-destructive' :
                      c.priority === 'high' ? 'bg-warning/10 text-warning' :
                      'bg-muted text-muted-foreground'
                    }`}>{c.priority}</span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground text-xs">{new Date(c.updatedAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <PaginationControls page={page} totalPages={totalPages} onNext={next} onPrev={prev} />
      </div>
    </DashboardLayout>
  );
};

export default LawyerCases;
