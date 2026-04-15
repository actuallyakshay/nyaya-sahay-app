import { getAdminLawyerCases, getAdminLawyerDetails } from '@/api-client';
import { Button } from '@/components/ui/button';
import WithShimmer from '@/components/WithShimmer';
import { LawyerCasesTable } from '@/components/lawyers/lawyerCasesTable';
import { useDebounce } from '@/hooks/useDebounce';
import { path } from '@/constants';
import { AdminLayout } from '@/layouts/AdminLayout';
import { calculateYearsOfExperience } from '@/lib/helpers';
import { CasesResponse } from '@/types';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Award, FileText, Mail, Phone } from 'lucide-react';
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
    enabled: Boolean(id),
  });

  const {
    data: casesData,
    isFetching,
    isError,
  } = useQuery<CasesResponse>({
    queryKey: ['adminLawyerCases', id, page, debouncedSearch, statusFilter],
    queryFn: async () => {
      const params = buildLawyerCasesQueryParams(
        page,
        debouncedSearch,
        statusFilter
      );
      const response = await getAdminLawyerCases(id, params);
      return response.data;
    },
    enabled: Boolean(id),
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
  const totalCasesHandled = data?.totalCasesHandled ?? 0;
  const user = lawyerData?.user;
  const practiceAreas = lawyerData?.lawyerPracticeAreas ?? [];
  const experienceLabel = lawyerData?.careerStartDate
    ? calculateYearsOfExperience(lawyerData.careerStartDate)
    : null;

  return (
    <AdminLayout>
      <div className="space-y-6">
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
                  <span>{user?.fullName?.charAt(0)?.toUpperCase() ?? '?'}</span>
                )}
              </div>
            </WithShimmer>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <WithShimmer loading={isLoading} className="h-7 w-40">
                  <h1 className="text-xl font-bold">Adv. {user?.fullName}</h1>
                </WithShimmer>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                {isLoading ? (
                  <>
                    <WithShimmer loading className="h-4 w-36" />
                    <WithShimmer loading className="h-4 w-28" />
                    <WithShimmer loading className="h-4 w-32" />
                  </>
                ) : (
                  <>
                    {user?.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        {user.email}
                      </span>
                    )}
                    {user?.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        +91-{user.phone}
                      </span>
                    )}
                    {lawyerData?.barCouncilId && (
                      <span className="flex items-center gap-1">
                        <Award className="h-3.5 w-3.5 shrink-0" />
                        {lawyerData.barCouncilId}
                      </span>
                    )}
                  </>
                )}
              </div>
              {isLoading && <WithShimmer loading className="mt-2 h-4 w-full" />}
              {!isLoading && lawyerData?.bio?.trim() && (
                <p className="mt-2 text-sm text-foreground">{lawyerData.bio}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                {isLoading ? (
                  <>
                    <WithShimmer loading className="h-5 w-16 rounded-full" />
                    <WithShimmer loading className="h-5 w-20 rounded-full" />
                    <WithShimmer loading className="h-5 w-16 rounded-full" />
                  </>
                ) : (
                  <>
                    {lawyerData?.degree?.trim() && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                        {lawyerData.degree}
                      </span>
                    )}
                    {experienceLabel && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                        {experienceLabel}
                      </span>
                    )}
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                      {totalCasesHandled}{' '}
                      {totalCasesHandled === 1 ? 'case' : 'cases'}
                    </span>
                  </>
                )}
              </div>
              <div className="mt-2">
                {isLoading ? (
                  <div className="flex flex-wrap gap-1.5">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <WithShimmer
                        key={i}
                        loading
                        className="h-5 w-20 rounded-full"
                      />
                    ))}
                  </div>
                ) : practiceAreas.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {practiceAreas.map((s) => (
                      <span
                        key={s.practiceAreaId}
                        className="rounded-full bg-gold/10 px-2 py-0.5 text-xs font-medium text-gold"
                      >
                        {s.practiceArea?.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No practice areas on file.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {id ? (
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Professional documents</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Review and approve uploads on a full page when there are many
                  files.
                </p>
              </div>
              <Button asChild variant="secondary" className="shrink-0">
                <Link to={path.adminLawyerDocuments(id)}>
                  <FileText className="mr-2 h-4 w-4" />
                  Open documents
                </Link>
              </Button>
            </div>
          </div>
        ) : null}

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
