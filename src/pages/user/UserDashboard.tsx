import { getUserAnalytics } from '@/api-client';
import ProfileCompletionModal from '@/components/ProfileCompletionModal';
import { SkeletonCard } from '@/components/SkeletonCard';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import WithShimmer from '@/components/WithShimmer';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  Bell,
  Briefcase,
  CreditCard,
  FileText,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const UserDashboard = () => {
  const { user } = useAuth();

  const {
    data: analyticsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['userAnalytics'],
    queryFn: async () => {
      const response = await getUserAnalytics();
      return response.data;
    },
  });

  const activeCases = analyticsData?.activeCases || [];
  const totalCases = analyticsData?.totalCasesCount || 0;
  const activeCasesCount = analyticsData?.activeCasesCount || 0;
  const emergencyCases = analyticsData?.emergencyCasesCount || 0;

  return (
    <DashboardLayout>
      <ProfileCompletionModal open={user?.isProfileCompleted === false} />
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">
              Welcome, {user?.fullName?.split(' ')[0]}
            </h1>
            <p className="mt-1 text-muted-foreground">
              Here's an overview of your legal support account.
            </p>
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/app/new-case">
                <FileText className="mr-2 h-4 w-4" /> Raise New Query
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/app/cases">View All Cases</Link>
            </Button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: 'Total Cases',
              value: totalCases,
              icon: Briefcase,
              color: 'text-info',
            },
            {
              label: 'Active Cases',
              value: activeCasesCount,
              icon: FileText,
              color: 'text-success',
            },
            {
              label: 'Plan',
              value: analyticsData?.subscriptionPlan?.planName || 'Free',
              icon: CreditCard,
              color: 'text-gold',
            },
            {
              label: 'Emergency Cases',
              value: emergencyCases,
              icon: Bell,
              color: 'text-warning',
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border bg-card p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <WithShimmer loading={isLoading} className="h-4 w-20">
                  <span className="text-sm text-muted-foreground">
                    {s.label}
                  </span>
                </WithShimmer>
                <WithShimmer loading={isLoading} className="h-4 w-4">
                  <s.icon className={`h-4 w-4 ${s.color}`} />
                </WithShimmer>
              </div>
              <WithShimmer loading={isLoading} className="mt-2 h-8 w-16">
                <p className="mt-2 text-2xl font-bold">{s.value}</p>
              </WithShimmer>
            </div>
          ))}
        </div>

        {/* Active cases */}
        <div>
          <div className="flex items-center justify-between">
            <h2 className="mb-4 text-lg font-semibold">Active Cases</h2>
            <div className="mb-4 flex items-center justify-end">
              <Link
                to="/app/cases"
                className="text-sm text-gold hover:underline"
              >
                View all →
              </Link>
            </div>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : activeCases.length === 0 ? (
            <div className="rounded-xl border bg-card p-8 text-center">
              <p className="text-muted-foreground">
                No active cases. Raise a query to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeCases.map((c) => (
                <Link
                  key={c.id}
                  to={`/cases/${c.id}`}
                  className="block rounded-xl border bg-card p-4 transition-shadow hover:shadow-md"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">
                          {c.caseCode}
                        </span>
                        <StatusBadge status={c.status} />
                        {c.isEmergency && (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                            Emergency
                          </span>
                        )}
                      </div>
                      <p className="mt-1 truncate font-medium">{c.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {c.practiceArea?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Created: {new Date(c.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <ArrowRight className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;
