import { DashboardLayout } from '@/layouts/DashboardLayout';
import { mockCases, mockLawyers } from '@/lib/mock-data';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Briefcase, Clock, CheckCircle, AlertTriangle, Star } from 'lucide-react';
import { LEGAL_CATEGORIES } from '@/types';

const LawyerDashboard = () => {
  const { user } = useAuth();
  const lawyerData = mockLawyers[0];
  const assignedCases = mockCases.filter((c) => c.lawyerId === 'l1');
  const activeCases = assignedCases.filter((c) => !['resolved', 'closed'].includes(c.status));

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Welcome, {user?.name?.split(' ')[0]}</h1>
          <p className="mt-1 text-muted-foreground">Your case assignments and tasks at a glance.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Active Cases', value: activeCases.length, icon: Briefcase, color: 'text-info' },
            { label: 'Total Handled', value: lawyerData.casesHandled, icon: CheckCircle, color: 'text-success' },
            { label: 'Rating', value: `${lawyerData.rating}/5`, icon: Star, color: 'text-gold' },
            { label: 'Experience', value: `${lawyerData.experience} yrs`, icon: Clock, color: 'text-muted-foreground' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <p className="mt-2 text-2xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold">Assigned Cases</h2>
          <div className="space-y-3">
            {assignedCases.map((c) => (
              <Link key={c.id} to={`/lawyer/cases/${c.id}`} className="block rounded-xl border bg-card p-4 transition-shadow hover:shadow-md">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-muted-foreground">{c.caseNumber}</span>
                      <StatusBadge status={c.status} />
                      {c.priority === 'urgent' && <span className="flex items-center gap-1 text-xs text-destructive"><AlertTriangle className="h-3 w-3" />Urgent</span>}
                    </div>
                    <p className="mt-1 font-medium">{c.title}</p>
                    <p className="text-sm text-muted-foreground">{c.userName} • {LEGAL_CATEGORIES[c.category]}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{new Date(c.updatedAt).toLocaleDateString('en-IN')}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LawyerDashboard;
