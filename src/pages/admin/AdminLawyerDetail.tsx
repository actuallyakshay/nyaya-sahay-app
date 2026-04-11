import { getAdminLawyerCases, getAdminLawyerDetails } from '@/api-client';
import WithShimmer from '@/components/WithShimmer';
import { LawyerCasesTable } from '@/components/lawyers/lawyerCasesTable';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/useDebounce';
import { AdminLayout } from '@/layouts/AdminLayout';
import { calculateYearsOfExperience } from '@/lib/helpers';
import { CasesResponse } from '@/types';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Award, ChevronLeft, Mail, Phone } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { buildLawyerCasesQueryParams } from '../lawyer/LawyerCases';

const AdminLawyerDetail = () => {
  const { id } = useParams();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading } = useQuery({
    queryKey: ['adminLawyerDetails', id],
    queryFn: async () => {
      const response = await getAdminLawyerDetails(id);
      return response.data;
    },
  });

  const {
    data: casesData,
    isFetching,
    isError,
  } = useQuery<CasesResponse>({
    queryKey: ['lawyerCases', page, debouncedSearch, statusFilter],
    queryFn: async () => {
      const params = buildLawyerCasesQueryParams(
        page,
        debouncedSearch,
        statusFilter
      );
      const response = await getAdminLawyerCases(id, params);
      return response.data;
    },
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  const cases = casesData?.data ?? [];
  const pagination = casesData?.pagination;
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

  const lawyerData = data?.lawyerData;
  const totalCasesHandled = data?.totalCasesHandled;

  console.log('cases', cases);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin/lawyers">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Lawyers
          </Link>
        </Button>

        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-start gap-4">
            <WithShimmer loading={isLoading} className="h-14 w-14 rounded-full">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gold/20 text-lg font-bold text-gold">
                {lawyerData?.user?.avatarUrl ? (
                  <img
                    src={lawyerData?.user?.avatarUrl}
                    alt={lawyerData?.user?.fullName}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                ) : (
                  <span>
                    {lawyerData?.user?.fullName?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </WithShimmer>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <WithShimmer loading={isLoading} className="h-7 w-40">
                  <h1 className="text-xl font-bold">
                    {lawyerData?.user?.fullName}
                  </h1>
                </WithShimmer>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <WithShimmer loading={isLoading} className="h-4 w-36">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />
                    {lawyerData?.user?.email}
                  </span>
                </WithShimmer>
                <WithShimmer loading={isLoading} className="h-4 w-28">
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    +91-{lawyerData?.user?.phone}
                  </span>
                </WithShimmer>
                <WithShimmer loading={isLoading} className="h-4 w-32">
                  <span className="flex items-center gap-1">
                    <Award className="h-3.5 w-3.5" />
                    {lawyerData?.barCouncilId}
                  </span>
                </WithShimmer>
              </div>
              <WithShimmer loading={isLoading} className="mt-2 h-4 w-full">
                <p className="mt-2 text-sm">{lawyerData?.bio || '-'}</p>
              </WithShimmer>
              <div className="mt-3 flex flex-wrap gap-2">
                <WithShimmer
                  loading={isLoading}
                  className="h-5 w-16 rounded-full"
                >
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                    {lawyerData?.degree}
                  </span>
                </WithShimmer>
                <WithShimmer
                  loading={isLoading}
                  className="h-5 w-20 rounded-full"
                >
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                    {calculateYearsOfExperience(lawyerData?.careerStartDate)}
                  </span>
                </WithShimmer>
                <WithShimmer
                  loading={isLoading}
                  className="h-5 w-16 rounded-full"
                >
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                    {totalCasesHandled} cases
                  </span>
                </WithShimmer>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {isLoading
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <WithShimmer
                        key={i}
                        loading
                        className="h-5 w-20 rounded-full"
                      />
                    ))
                  : lawyerData?.lawyerPracticeAreas?.map((s) => (
                      <span
                        key={s.practiceAreaId}
                        className="rounded-full bg-gold/10 px-2 py-0.5 text-xs font-medium text-gold"
                      >
                        {s.practiceArea?.name}
                      </span>
                    ))}
              </div>
            </div>
          </div>
        </div>

        <LawyerCasesTable
          cases={cases}
          isFetching={isFetching}
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
    </AdminLayout>
  );
};

export default AdminLawyerDetail;
