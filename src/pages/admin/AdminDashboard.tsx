import { getAdminAnalytics } from '@/api-client';
import { path, ROUTES } from '@/constants';
import { StatusBadge } from '@/components/StatusBadge';
import WithShimmer from '@/components/WithShimmer';
import { CasesTableSkeleton } from '@/components/skeletons/CasesTableSkeleton';
import { AdminLayout } from '@/layouts/AdminLayout';
import { mockPayments } from '@/lib/mock-data';
import { useQuery } from '@tanstack/react-query';
import { Briefcase, FileText, UserCheck, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['adminAnalytics'],
    queryFn: async () => {
      const response = await getAdminAnalytics();
      return response.data;
    },
  });

  const totalUsers = analyticsData?.totalUsers || 0;
  const totalLawyers = analyticsData?.totalLawyers || 0;
  const activeCases = analyticsData?.activeCases || 0;
  const resolvedCases = analyticsData?.resolvedCases || 0;
  const newCases = analyticsData?.newCases || [];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Admin Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Platform overview and management.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            {
              label: 'Users',
              value: totalUsers,
              icon: Users,
              color: 'text-info',
            },
            {
              label: 'Lawyers',
              value: totalLawyers,
              icon: UserCheck,
              color: 'text-gold',
            },
            {
              label: 'Active Cases',
              value: activeCases,
              icon: Briefcase,
              color: 'text-foreground',
            },
            {
              label: 'Resolved',
              value: resolvedCases,
              icon: FileText,
              color: 'text-success',
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

        {/* Recent cases */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Cases</h2>
            <Link
              to={ROUTES.admin.cases}
              className="text-sm text-gold hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Case #
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    User
                  </th>
                  <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">
                    Case Title
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Case Status
                  </th>
                  <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                {newCases?.map((c) => (
                  <tr
                    key={c.caseCode}
                    className="border-b last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-4 py-3 font-mono text-xs">
                      <Link
                        to={path.adminCase(c.id)}
                        className="hover:text-gold hover:underline"
                      >
                        #{c.caseCode}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{c.user?.fullName || '-'}</td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                      {c.title}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                      {c.description?.slice(0, 50)}...
                    </td>
                  </tr>
                ))}
                {isLoading && <CasesTableSkeleton length={3} />}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent payments */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Payments</h2>
            <Link
              to={ROUTES.admin.payments}
              className="text-sm text-gold hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Transaction
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    User
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Amount
                  </th>
                  <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">
                    Method
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockPayments.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-4 py-3 font-mono text-xs">
                      {p.transactionId}
                    </td>
                    <td className="px-4 py-3">{p.userName}</td>
                    <td className="px-4 py-3 font-medium">
                      ₹{p.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="hidden px-4 py-3 text-xs uppercase text-muted-foreground sm:table-cell">
                      {p.method.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${p.status === 'success' ? 'bg-green-50 text-green-700' : p.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
