import { getAdminUserCases, getAdminUserDetails } from '@/api-client';
import { Button } from '@/components/ui/button';
import { UserCasesTable } from '@/components/user/UserCasesTable';
import WithShimmer from '@/components/WithShimmer';
import { useDebounce } from '@/hooks/useDebounce';
import { AdminLayout } from '@/layouts/AdminLayout';
import { CasesResponse } from '@/types';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Calendar, ChevronLeft, Mail, Phone } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { buildUserCasesQueryParams } from '../user/UserCases';

const AdminUserDetail = () => {
  const { id } = useParams();

  const { data: userData, isLoading } = useQuery({
    queryKey: ['adminUserDetails', id],
    queryFn: async () => {
      const response = await getAdminUserDetails(id);
      return response.data;
    },
  });

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const debouncedSearch = useDebounce(search, 500);

  const { data, isFetching, isError } = useQuery<CasesResponse>({
    queryKey: ['adminUserCases', id, page, debouncedSearch, statusFilter],
    queryFn: async () => {
      const params = buildUserCasesQueryParams(
        page,
        debouncedSearch,
        statusFilter
      );
      const response = await getAdminUserCases(id, params);
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

  const userCases = [];
  const userPayments = [];

  const loading = isLoading || isFetching;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin/users">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Users
          </Link>
        </Button>

        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-navy text-lg font-bold text-primary-foreground">
              {userData?.avatarUrl && (
                <img
                  src={userData?.avatarUrl}
                  alt={userData?.fullName}
                  className="object-cover"
                />
              )}
              {!userData?.avatarUrl && (
                <WithShimmer loading={loading}>
                  <div className="flex items-center justify-center rounded-full text-lg font-bold text-gold">
                    {userData?.fullName.charAt(0).toUpperCase()}
                  </div>
                </WithShimmer>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold">{userData?.fullName}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  {userData?.email || '-'}
                </span>
                {userData?.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    {userData?.phone}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Joined{' '}
                  {new Date(userData?.createdAt).toLocaleDateString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Cases */}
        <div>
          <UserCasesTable
            cases={cases}
            isFetching={loading}
            isError={isError}
            totalPages={totalPages}
            total={total}
            page={page}
            setPage={setPage}
            search={search}
            isAdmin={true}
            statusFilter={statusFilter}
            handleSearchChange={handleSearchChange}
            handleStatusChange={handleStatusChange}
          />
        </div>

        {/* Payments */}
        <div>
          <h2 className="mb-3 text-lg font-semibold">
            Payments ({userPayments.length})
          </h2>
          {userPayments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments found.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border bg-card">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Transaction
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {userPayments.map((p) => (
                    <tr key={p.id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-mono text-xs">
                        {p.transactionId}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        ₹{p.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${p.status === 'success' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(p.createdAt).toLocaleDateString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUserDetail;
