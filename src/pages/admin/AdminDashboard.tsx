import { AdminLayout } from '@/layouts/AdminLayout';
import { adminStats, mockCases, mockLawyers, mockPayments } from '@/lib/mock-data';
import { StatusBadge } from '@/components/StatusBadge';
import { Link } from 'react-router-dom';
import { Users, UserCheck, Briefcase, IndianRupee, AlertTriangle, FileText } from 'lucide-react';

const AdminDashboard = () => (
  <AdminLayout>
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Admin Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Platform overview and management.</p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[
          { label: 'Users', value: adminStats.totalUsers.toLocaleString(), icon: Users, color: 'text-info' },
          { label: 'Lawyers', value: adminStats.totalLawyers, icon: UserCheck, color: 'text-gold' },
          { label: 'Active Cases', value: adminStats.activeCases, icon: Briefcase, color: 'text-foreground' },
          { label: 'Resolved', value: adminStats.resolvedCases.toLocaleString(), icon: FileText, color: 'text-success' },
          { label: 'Revenue (₹)', value: `₹${(adminStats.monthlyRevenue / 1000).toFixed(0)}k`, icon: IndianRupee, color: 'text-gold' },
          { label: 'Emergency', value: adminStats.emergencyRequests, icon: AlertTriangle, color: 'text-destructive' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </div>
            <p className="text-xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Recent cases */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Cases</h2>
          <Link to="/admin/cases" className="text-sm text-gold hover:underline">View all →</Link>
        </div>
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Case #</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">User</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Category</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Lawyer</th>
              </tr>
            </thead>
            <tbody>
              {mockCases.map((c) => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs">{c.caseNumber}</td>
                  <td className="px-4 py-3">{c.userName}</td>
                  <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{c.category}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3 hidden md:table-cell">{c.lawyerName || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent payments */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Payments</h2>
          <Link to="/admin/payments" className="text-sm text-gold hover:underline">View all →</Link>
        </div>
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Transaction</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">User</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Amount</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Method</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockPayments.map((p) => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs">{p.transactionId}</td>
                  <td className="px-4 py-3">{p.userName}</td>
                  <td className="px-4 py-3 font-medium">₹{p.amount.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground uppercase text-xs">{p.method.replace('_', ' ')}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${p.status === 'success' ? 'bg-green-50 text-green-700' : p.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
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

export default AdminDashboard;
