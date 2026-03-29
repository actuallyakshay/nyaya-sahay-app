import { AdminLayout } from '@/layouts/AdminLayout';
import { mockLawyers } from '@/lib/mock-data';
import { LEGAL_CATEGORIES } from '@/types';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { usePagination } from '@/hooks/usePagination';
import { PaginationControls } from '@/components/PaginationControls';

const AdminLawyerVerifications = () => {
  const { toast } = useToast();
  const unverified = mockLawyers.filter(l => !l.isVerified);
  const { paginated, page, totalPages, next, prev } = usePagination(unverified, 10);

  const handleApprove = (name: string) => {
    toast({ title: 'Lawyer Verified', description: `${name} has been verified and can now accept cases.` });
  };

  const handleReject = (name: string) => {
    toast({ title: 'Verification Rejected', description: `${name}'s application has been rejected.` });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Lawyer Verifications</h1>
          <p className="mt-1 text-muted-foreground">Review and verify new lawyer registrations.</p>
        </div>

        {unverified.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-center">
            <CheckCircle className="mx-auto h-10 w-10 text-green-500 mb-3" />
            <p className="font-medium">All caught up!</p>
            <p className="text-sm text-muted-foreground mt-1">No pending lawyer verifications.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border bg-card">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Specialization</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Bar Council ID</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Experience</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Applied On</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(l => (
                    <tr key={l.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{l.name}</p>
                          <p className="text-xs text-muted-foreground">{l.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-xs text-muted-foreground">
                        {l.specializations.map(s => LEGAL_CATEGORIES[s]).join(', ')}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell font-mono text-xs text-muted-foreground">{l.barCouncilId}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{l.experience} yrs</td>
                      <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">
                        {new Date(l.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="h-8 text-xs text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleApprove(l.name)}>
                            <CheckCircle className="mr-1 h-3.5 w-3.5" />Approve
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 text-xs text-destructive border-destructive/20 hover:bg-destructive/5" onClick={() => handleReject(l.name)}>
                            <XCircle className="mr-1 h-3.5 w-3.5" />Reject
                          </Button>
                          <Link to={`/admin/lawyers/${l.id}`}>
                            <Button size="sm" variant="ghost" className="h-8 text-xs"><Eye className="h-3.5 w-3.5" /></Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <PaginationControls page={page} totalPages={totalPages} onNext={next} onPrev={prev} />
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminLawyerVerifications;
