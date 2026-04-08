import {
  getAdminLawyerVerifications,
  updateLawyerRoleStatus,
} from '@/api-client';
import { PaginationControls } from '@/components/PaginationControls';
import { PracticeAreaBadge } from '@/components/StatusBadge';
import { LawyerFormModal } from '@/components/admin/LawyerFormModal';
import { CasesTableSkeleton } from '@/components/skeletons/CasesTableSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';
import { AdminLayout } from '@/layouts/AdminLayout';
import { PAGE_SIZE } from '@/lib/mock-data';
import { queryClient } from '@/lib/query-client';
import { LawyerListItem, LawyersListResponse } from '@/types';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { CheckCircle, Edit, Loader2, Search, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const buildQueryParams = (page: number, search: string) => {
  const params: Record<string, string | number> = {
    page,
    limit: PAGE_SIZE,
    orderBy: 'createdAt',
    order: 'DESC',
  };
  if (search.trim()) params.search = search.trim();
  return params;
};

type PendingAction = { lawyerId: string; kind: 'active' | 'rejected' };

const AdminLawyers = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLawyer, setEditingLawyer] = useState<LawyerListItem | null>(
    null
  );
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 500);
  const [pending, setPending] = useState<PendingAction | null>(null);

  const { data, isFetching } = useQuery<LawyersListResponse>({
    queryKey: ['admin-lawyers', page, debouncedSearch],
    queryFn: async () => {
      const params = buildQueryParams(page, debouncedSearch);
      const response = await getAdminLawyerVerifications(params);
      return response.data;
    },
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleUpdateLawyerRoleStatus = async (
    lawyerId: string,
    userId: string,
    roleCode: string,
    status: string
  ) => {
    const kind = status === 'inactive' ? 'active' : 'rejected';
    console.log('Updating lawyer role status:', {
      lawyerId,
      userId,
      roleCode,
      status,
    });
    setPending({ lawyerId, kind });
    try {
      await updateLawyerRoleStatus(userId, roleCode, status);
      toast({
        title: 'Lawyer Role Status Updated',
        description: `${userId} has been updated to ${status}.`,
      });
      await queryClient.invalidateQueries({
        queryKey: ['admin-lawyers', page],
      });
    } catch (error) {
      toast({
        title: 'Error Updating Lawyer Role Status',
        description:
          error instanceof Error ? error.message : 'Something went wrong.',
        variant: 'destructive',
      });
    } finally {
      setPending(null);
    }
  };

  const lawyers = data?.data ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const total = pagination?.total ?? 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Lawyer Management</h1>
            <p className="mt-1 text-muted-foreground">
              Verify, onboard, and manage lawyers.
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingLawyer(null);
              setModalOpen(true);
            }}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add Lawyer
          </Button>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search lawyers..."
            className="pl-9"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Avatar
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Name
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">
                  Specialization
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Phone
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">
                  Bar Council ID
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Verified
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Active
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {!isFetching &&
                lawyers.map((l) => {
                  const rowBusy = pending !== null && pending.lawyerId === l.id;
                  const activating = rowBusy && pending?.kind === 'active';
                  const deactivating = rowBusy && pending?.kind === 'rejected';

                  return (
                    <tr
                      key={l.id}
                      className="border-b last:border-0 hover:bg-muted/30"
                    >
                      <td className="px-4 py-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/20 text-lg font-bold text-gold">
                          {l.user?.avatarUrl && (
                            <img
                              src={l.user?.avatarUrl}
                              alt={l.user?.fullName}
                              className="h-9 w-9 rounded-full object-cover"
                            />
                          )}
                          {!l.user?.avatarUrl && (
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/20 text-lg font-bold text-gold">
                              {l.user?.fullName.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <Link
                            to={`/admin/lawyers/${l.id}`}
                            className="font-medium hover:text-gold hover:underline"
                          >
                            {l.user?.fullName}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {/* {l.experience} yrs exp */}
                            10 yrs exp
                          </p>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 text-xs text-muted-foreground sm:table-cell">
                        {l.lawyerPracticeAreas.slice(0, 2).map((s, i) => (
                          <>
                            <PracticeAreaBadge
                              key={s.practiceArea?.id}
                              practiceArea={s.practiceArea?.name || '-'}
                            />
                            <span className="mr-1 text-xs text-muted-foreground"></span>
                          </>
                        ))}
                      </td>
                      <td className="px-4 py-3">
                        {l.user?.phone ? `+91${l.user.phone}` : '-'}
                      </td>
                      <td className="hidden px-4 py-3 font-mono text-xs text-muted-foreground md:table-cell">
                        {l.barCouncilId}
                      </td>
                      <td className="px-4 py-3">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </td>
                      <td className="px-4 py-3">
                        {activating || deactivating ? (
                          <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Switch
                            checked={l.user?.userRole?.status === 'active'}
                            onCheckedChange={() => {
                              const currentStatus = l.user?.userRole?.status;
                              const newStatus =
                                currentStatus === 'active'
                                  ? 'inactive'
                                  : 'active';
                              handleUpdateLawyerRoleStatus(
                                l.id,
                                l.user?.id,
                                'lawyer',
                                newStatus
                              );
                            }}
                          />
                        )}
                      </td>

                      <td className="flex gap-1 px-4 py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingLawyer(l);
                            setModalOpen(true);
                          }}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Link to={`/admin/lawyers/${l.id}`}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              {isFetching && <CasesTableSkeleton />}
            </tbody>
          </table>
        </div>
        <LawyerFormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          lawyer={editingLawyer as Lawyer}
          onSave={(data, message) => {
            toast({
              title:
                message ||
                `${data.name} has been ${editingLawyer ? 'updated' : 'added'}.`,
            });
            setModalOpen(false);
          }}
        />
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
    </AdminLayout>
  );
};

export default AdminLawyers;
