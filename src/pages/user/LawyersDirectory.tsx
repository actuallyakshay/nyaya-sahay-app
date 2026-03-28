import { getLawyersList } from '@/api-client';
import { PaginationControls } from '@/components/PaginationControls';
import WithShimmer from '@/components/WithShimmer';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import { Award, Briefcase, CheckCircle } from 'lucide-react';
import { useState } from 'react';

const LawyersDirectory = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [orderBy] = useState('createdAt');
  const [order] = useState('ASC');

  const calculateExperience = (careerStartDate) => {
    if (!careerStartDate) {
      return 'Experience not specified';
    }

    const startYear = new Date(careerStartDate).getFullYear();
    const currentYear = new Date().getFullYear();
    const experience = Math.max(0, currentYear - startYear);

    return `${experience} yrs exp`;
  };

  const {
    data: lawyersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['lawyersList', page, limit, orderBy, order],
    queryFn: async () => {
      const response = await getLawyersList({
        page,
        limit,
        orderBy,
        order,
      });
      return response.data;
    },
  });

  const lawyers = lawyersData?.data || [];
  const totalPages = Math.ceil((lawyersData?.pagination?.total || 0) / limit);

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Our Lawyers</h1>
          <p className="mt-1 text-muted-foreground">
            Browse verified lawyers available on the platform.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border bg-card p-5">
                <div className="flex items-start gap-3">
                  <WithShimmer loading className="h-12 w-12 shrink-0 rounded-full" />
                  <div className="min-w-0 flex-1 space-y-1">
                    <WithShimmer loading className="h-5 w-3/4" />
                    <WithShimmer loading className="h-4 w-1/2" />
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <WithShimmer loading className="h-5 w-16 rounded-full" />
                  <WithShimmer loading className="h-5 w-20 rounded-full" />
                </div>
                <div className="mt-3 flex items-center gap-4">
                  <WithShimmer loading className="h-4 w-20" />
                  <WithShimmer loading className="h-4 w-14" />
                </div>
                <div className="mt-2 space-y-1">
                  <WithShimmer loading className="h-3 w-full" />
                  <WithShimmer loading className="h-3 w-4/5" />
                </div>
              </div>
            ))
          ) : error ? (
            <div className="col-span-full rounded-xl border bg-card p-8 text-center">
              <p className="text-destructive">
                Failed to load lawyers. Please try again.
              </p>
            </div>
          ) : lawyers.length === 0 ? (
            <div className="col-span-full rounded-xl border bg-card p-8 text-center">
              <p className="text-muted-foreground">
                No lawyers are currently available.
              </p>
            </div>
          ) : (
            lawyers.map((l) => (
              <div key={l.id} className="rounded-xl border bg-card p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold/20 font-bold text-gold">
                    {l.user?.fullName?.charAt(0) || 'L'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-medium">
                        {l.user?.fullName || 'Unknown Lawyer'}
                      </p>
                      {l.barCouncilId && (
                        <CheckCircle className="h-3.5 w-3.5 shrink-0 text-green-600" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {l.degree || 'Degree not specified'}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {l.lawyerPracticeAreas?.length > 0 ? (
                    l.lawyerPracticeAreas.map((area) => (
                      <span
                        key={area.id}
                        className="rounded-full bg-gold/10 px-2 py-0.5 text-[11px] font-medium text-gold"
                      >
                        {area.practiceArea?.name}
                      </span>
                    ))
                  ) : (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      No specializations listed
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    {calculateExperience(l.careerStartDate)}
                  </span>
                  {l.gender && (
                    <span className="flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      {l.gender}
                    </span>
                  )}
                </div>
                {l.bio ? (
                  <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                    {l.bio}
                  </p>
                ) : (
                  <p className="mt-2 text-xs italic text-muted-foreground">
                    No bio available
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        {!isLoading && !error && (
          <PaginationControls
            page={page}
            totalPages={totalPages}
            total={lawyersData?.pagination?.total}
            pageSize={limit}
            onNext={handleNextPage}
            onPrev={handlePrevPage}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default LawyersDirectory;
