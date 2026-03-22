import { AdminLayout } from '@/layouts/AdminLayout';
import { adminStats } from '@/lib/mock-data';
import { BarChart3, TrendingUp, Users, Briefcase } from 'lucide-react';

const AdminReports = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>
          <p className="mt-1 text-muted-foreground">Platform performance overview.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total Users', value: adminStats.totalUsers.toLocaleString(), icon: Users, change: '+12%' },
            { label: 'Active Cases', value: adminStats.activeCases, icon: Briefcase, change: '+8%' },
            { label: 'Cases Resolved', value: adminStats.resolvedCases.toLocaleString(), icon: TrendingUp, change: '+23%' },
            { label: 'Monthly Revenue', value: `₹${(adminStats.monthlyRevenue / 1000).toFixed(0)}k`, icon: BarChart3, change: '+15%' },
          ].map(s => (
            <div key={s.label} className="rounded-xl border bg-card p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <s.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="mt-1 text-xs text-green-600">{s.change} vs last month</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border bg-card p-6">
          <h3 className="font-semibold mb-4">Subscription Distribution</h3>
          <div className="space-y-3">
            {[
              { label: 'Basic', count: adminStats.activePlans.basic, total: adminStats.totalUsers, color: 'bg-blue-500' },
              { label: 'Professional', count: adminStats.activePlans.professional, total: adminStats.totalUsers, color: 'bg-gold' },
              { label: 'Premium', count: adminStats.activePlans.premium, total: adminStats.totalUsers, color: 'bg-green-500' },
            ].map(plan => (
              <div key={plan.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{plan.label}</span>
                  <span className="text-muted-foreground">{plan.count}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full rounded-full ${plan.color}`} style={{ width: `${(plan.count / plan.total) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminReports;
