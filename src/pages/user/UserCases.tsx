import { DashboardLayout } from '@/layouts/DashboardLayout';
import { mockCases } from '@/lib/mock-data';
import { StatusBadge } from '@/components/StatusBadge';
import { Link } from 'react-router-dom';
import { LEGAL_CATEGORIES } from '@/types';

const UserCases = () => (
  <DashboardLayout>
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Cases</h1>
      <div className="space-y-3">
        {mockCases.map((c) => (
          <Link key={c.id} to={`/app/cases/${c.id}`} className="block rounded-xl border bg-card p-4 md:p-5 transition-shadow hover:shadow-md">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">{c.caseNumber}</span>
                  <StatusBadge status={c.status} />
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{LEGAL_CATEGORIES[c.category]}</span>
                </div>
                <p className="mt-1.5 font-medium">{c.title}</p>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{c.description}</p>
              </div>
              {c.lawyerName && (
                <div className="text-sm text-right shrink-0">
                  <p className="text-muted-foreground">Assigned</p>
                  <p className="font-medium">{c.lawyerName}</p>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  </DashboardLayout>
);

export default UserCases;
