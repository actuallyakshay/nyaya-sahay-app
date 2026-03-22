import { useParams, Link } from 'react-router-dom';
import { AdminLayout } from '@/layouts/AdminLayout';
import { mockLawyers, mockCases } from '@/lib/mock-data';
import { StatusBadge } from '@/components/StatusBadge';
import { LEGAL_CATEGORIES } from '@/types';
import { ChevronLeft, Mail, Phone, Calendar, Award, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminLawyerDetail = () => {
  const { id } = useParams();
  const lawyer = mockLawyers.find(l => l.id === id);

  if (!lawyer) return (
    <AdminLayout>
      <div className="py-16 text-center">
        <p className="text-muted-foreground">Lawyer not found.</p>
        <Button variant="outline" className="mt-4" asChild><Link to="/admin/lawyers"><ChevronLeft className="mr-1 h-4 w-4" />Back</Link></Button>
      </div>
    </AdminLayout>
  );

  const lawyerCases = mockCases.filter(c => c.lawyerId === id);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild><Link to="/admin/lawyers"><ChevronLeft className="mr-1 h-4 w-4" />Back to Lawyers</Link></Button>

        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-full bg-gold/20 flex items-center justify-center text-lg font-bold text-gold">
              {lawyer.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{lawyer.name}</h1>
                {lawyer.isVerified ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-500" />}
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{lawyer.email}</span>
                <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{lawyer.phone}</span>
                <span className="flex items-center gap-1"><Award className="h-3.5 w-3.5" />{lawyer.barCouncilId}</span>
              </div>
              <p className="mt-2 text-sm">{lawyer.bio}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-xs bg-muted rounded-full px-2 py-0.5">{lawyer.degree}</span>
                <span className="text-xs bg-muted rounded-full px-2 py-0.5">{lawyer.experience} years exp</span>
                <span className="text-xs bg-muted rounded-full px-2 py-0.5">{lawyer.rating}★ rating</span>
                <span className="text-xs bg-muted rounded-full px-2 py-0.5">{lawyer.casesHandled} cases</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {lawyer.specializations.map(s => (
                  <span key={s} className="rounded-full bg-gold/10 text-gold px-2 py-0.5 text-xs font-medium">{LEGAL_CATEGORIES[s]}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Assigned Cases ({lawyerCases.length})</h2>
          {lawyerCases.length === 0 ? <p className="text-sm text-muted-foreground">No cases assigned.</p> : (
            <div className="space-y-2">
              {lawyerCases.map(c => (
                <Link key={c.id} to={`/admin/cases/${c.id}`} className="block rounded-xl border bg-card p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-muted-foreground">{c.caseNumber}</span>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="mt-1 font-medium text-sm">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.userName}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminLawyerDetail;
