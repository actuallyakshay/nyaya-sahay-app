import { getAdminCaseRequests, updateAdminCaseStatus } from '@/api-client';
import { PaginationControls } from '@/components/PaginationControls';
import { StatusBadge } from '@/components/StatusBadge';
import { CasesTableSkeleton } from '@/components/skeletons/CasesTableSkeleton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AdminLayout } from '@/layouts/AdminLayout';
import { PAGE_SIZE } from '@/lib/mock-data';
import { queryClient } from '@/lib/query-client';
import { CaseStatus, CasesResponse, LEGAL_CATEGORIES } from '@/types';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { CheckCircle, Eye, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const buildQueryParams = (page: number) => {
  const params: Record<string, string | number> = {
    page,
    limit: PAGE_SIZE,
    orderBy: 'createdAt',
    order: 'DESC',
  };
  params.status = 'new';
  return params;
};

const AdminCaseRequests = () => {
  const { toast } = useToast();
  const [page, setPage] = useState(1);

  const { data, isFetching } = useQuery<CasesResponse>({
    queryKey: ['case-requests', page],
    queryFn: async () => {
      const params = buildQueryParams(page);
      const response = await getAdminCaseRequests(params);
      return response.data;
    },
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  const cases = data?.data ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const total = pagination?.total ?? 0;

  const handleUpdateAdminCaseStatus = async (
    caseId: string,
    status: CaseStatus
  ) => {
    try {
      await updateAdminCaseStatus(caseId, status);
      toast({
        title: 'Case Status Updated',
        description: `Case ${caseId} has been updated to ${status}.`,
      });
      await queryClient.invalidateQueries({
        queryKey: ['case-requests', page],
      });
    } catch (error) {
      toast({
        title: 'Error Updating Case Status',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">New Case Requests</h1>
          <p className="mt-1 text-muted-foreground">
            Review and approve incoming case requests from users.
          </p>
        </div>

        {isFetching && <CasesTableSkeleton />}

        {!isFetching && cases.length === 0 ? (
          <div className="rounded-xl border bg-card p-12 text-center">
            <p className="text-muted-foreground">
              No new case requests at the moment.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {!isFetching &&
              cases.map((c) => (
                <div key={c.id} className="rounded-xl border bg-card p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">
                          {c.caseCode}
                        </span>
                        <StatusBadge status={c.status} />
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            c.isEmergency
                              ? 'bg-destructive/10 text-destructive'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {c.isEmergency ? 'Emergency' : 'Normal Priority'}
                        </span>
                      </div>
                      <h3 className="font-semibold">{c.title}</h3>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {c.description}
                      </p>
                      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>
                          By:{' '}
                          <span className="font-medium text-foreground">
                            {c.user?.fullName}
                          </span>
                        </span>
                        <span>{LEGAL_CATEGORIES[c.practiceArea?.name]}</span>
                        <span>
                          {new Date(c.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/admin/cases/${c.id}`}>
                          <Eye className="mr-1.5 h-3.5 w-3.5" />
                          View
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() =>
                          handleUpdateAdminCaseStatus(c.id, 'under_review')
                        }
                      >
                        <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() =>
                          handleUpdateAdminCaseStatus(c.id, 'closed')
                        }
                      >
                        <XCircle className="mr-1.5 h-3.5 w-3.5" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            <PaginationControls
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={PAGE_SIZE}
              onNext={() => setPage((p) => Math.min(p + 1, totalPages))}
              onPrev={() => setPage((p) => Math.max(p - 1, 1))}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCaseRequests;
