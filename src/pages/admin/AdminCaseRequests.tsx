import { AdminLayout } from '@/layouts/AdminLayout';
import { mockCases } from '@/lib/mock-data';
import { StatusBadge } from '@/components/StatusBadge';
import { LEGAL_CATEGORIES } from '@/types';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminCaseRequests = () => {
  const { toast } = useToast();
  const newCases = mockCases.filter(c => c.status === 'new');

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">New Case Requests</h1>
          <p className="mt-1 text-muted-foreground">Review and approve incoming case requests from users.</p>
        </div>

        {newCases.length === 0 ? (
          <div className="rounded-xl border bg-card p-12 text-center">
            <p className="text-muted-foreground">No new case requests at the moment.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {newCases.map(c => (
              <div key={c.id} className="rounded-xl border bg-card p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-mono text-xs text-muted-foreground">{c.caseNumber}</span>
                      <StatusBadge status={c.status} />
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        c.priority === 'urgent' ? 'bg-destructive/10 text-destructive' :
                        c.priority === 'high' ? 'bg-warning/10 text-warning' :
                        'bg-muted text-muted-foreground'
                      }`}>{c.priority}</span>
                    </div>
                    <h3 className="font-semibold">{c.title}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{c.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>By: <span className="font-medium text-foreground">{c.userName}</span></span>
                      <span>{LEGAL_CATEGORIES[c.category]}</span>
                      <span>{new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="outline" asChild>
                      <Link to={`/admin/cases/${c.id}`}><Eye className="mr-1.5 h-3.5 w-3.5" />View</Link>
                    </Button>
                    <Button size="sm" onClick={() => toast({ title: 'Case Accepted', description: `Case ${c.caseNumber} has been accepted and moved to Under Review.` })}>
                      <CheckCircle className="mr-1.5 h-3.5 w-3.5" />Accept
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => toast({ title: 'Case Rejected', description: `Case ${c.caseNumber} has been rejected.` })}>
                      <XCircle className="mr-1.5 h-3.5 w-3.5" />Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCaseRequests;
