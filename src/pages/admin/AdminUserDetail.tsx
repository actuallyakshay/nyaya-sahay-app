import { useParams, Link } from 'react-router-dom';
import { AdminLayout } from '@/layouts/AdminLayout';
import { mockAllUsers, mockCases, mockPayments } from '@/lib/mock-data';
import { StatusBadge } from '@/components/StatusBadge';
import { ChevronLeft, Mail, Phone, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminUserDetail = () => {
  const { id } = useParams();
  const user = mockAllUsers.find(u => u.id === id);

  if (!user) return (
    <AdminLayout>
      <div className="py-16 text-center">
        <p className="text-muted-foreground">User not found.</p>
        <Button variant="outline" className="mt-4" asChild><Link to="/admin/users"><ChevronLeft className="mr-1 h-4 w-4" />Back</Link></Button>
      </div>
    </AdminLayout>
  );

  const userCases = mockCases.filter(c => c.userId === id);
  const userPayments = mockPayments.filter(p => p.userId === id);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild><Link to="/admin/users"><ChevronLeft className="mr-1 h-4 w-4" />Back to Users</Link></Button>

        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-navy flex items-center justify-center text-lg font-bold text-primary-foreground">
              {user.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-bold">{user.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{user.email}</span>
                <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{user.phone}</span>
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />Joined {new Date(user.createdAt).toLocaleDateString('en-IN')}</span>
              </div>
            </div>
          </div>
          <div className="mt-3">
            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${user.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {user.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Cases */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Cases ({userCases.length})</h2>
          {userCases.length === 0 ? <p className="text-sm text-muted-foreground">No cases found.</p> : (
            <div className="space-y-2">
              {userCases.map(c => (
                <Link key={c.id} to={`/admin/cases/${c.id}`} className="block rounded-xl border bg-card p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-muted-foreground">{c.caseNumber}</span>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="mt-1 font-medium text-sm">{c.title}</p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Payments */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Payments ({userPayments.length})</h2>
          {userPayments.length === 0 ? <p className="text-sm text-muted-foreground">No payments found.</p> : (
            <div className="overflow-x-auto rounded-xl border bg-card">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Transaction</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Amount</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {userPayments.map(p => (
                    <tr key={p.id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-mono text-xs">{p.transactionId}</td>
                      <td className="px-4 py-3 font-medium">₹{p.amount.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${p.status === 'success' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>{p.status}</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(p.createdAt).toLocaleDateString('en-IN')}</td>
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
