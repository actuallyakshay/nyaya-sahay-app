import { getCases } from '@/api-client';
import { PaginationControls } from '@/components/PaginationControls';
import { CasesTableSkeleton } from '@/components/skeletons/CasesTableSkeleton';
import { PracticeAreaBadge, StatusBadge } from '@/components/StatusBadge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDebounce } from '@/hooks/useDebounce';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import type { CasesResponse } from '@/types';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const PAGE_SIZE = 10;

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'new', label: 'New' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'lawyer_assigned', label: 'Lawyer Assigned' },
  { value: 'in_consultation', label: 'In Consultation' },
  { value: 'waiting_for_user', label: 'Waiting for User' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
  { value: 'emergency', label: 'Emergency' },
];

const buildQueryParams = (
  page: number,
  search: string,
  statusFilter: string
) => {
  const params: Record<string, string | number> = {
    page,
    limit: PAGE_SIZE,
    orderBy: 'createdAt',
    order: 'DESC',
  };
  if (search.trim()) params.search = search.trim();
  if (statusFilter !== 'all') params.status = statusFilter;
  return params;
};

const UserCases = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const debouncedSearch = useDebounce(search, 500);

  const { data, isFetching, isError } = useQuery<CasesResponse>({
    queryKey: ['cases', page, debouncedSearch, statusFilter],
    queryFn: async () => {
      const params = buildQueryParams(page, debouncedSearch, statusFilter);
      const response = await getCases(params);
      return response.data;
    },
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  const cases = data?.data ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const total = pagination?.total ?? 0;

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    if (page !== 1) setPage(1);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">My Cases</h1>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search cases..."
              className="pl-9"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Case #
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Title
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">
                  Category
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Category
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground lg:table-cell">
                  Lawyer
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {isFetching && <CasesTableSkeleton />}
              {isError && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-destructive"
                  >
                    Failed to load cases.
                  </td>
                </tr>
              )}
              {!isFetching && !isError && cases.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No cases found.
                  </td>
                </tr>
              )}
              {!isFetching &&
                !isError &&
                cases.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-4 py-3 font-mono text-xs">
                      {c.caseCode}
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3 font-medium">
                      <Link
                        to={`/app/cases/${c.id}`}
                        className="hover:text-gold hover:underline"
                      >
                        {c.title}
                      </Link>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                      {c.practiceArea?.name || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3">
                      <PracticeAreaBadge
                        practiceArea={c.practiceArea?.name as string}
                      />
                    </td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      {c.assignedLawyer?.user?.fullName || '—'}
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-muted-foreground sm:table-cell">
                      {new Date(c.createdAt).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <PaginationControls
          page={page}
          totalPages={totalPages}
          total={total}
          onNext={() => setPage((p) => Math.min(p + 1, totalPages))}
          onPrev={() => setPage((p) => Math.max(p - 1, 1))}
          onPageChange={setPage}
        />
      </div>
    </DashboardLayout>
  );
};

export default UserCases;
