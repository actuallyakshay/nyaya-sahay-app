import { DashboardLayout } from '@/layouts/DashboardLayout';
import { mockLawyers } from '@/lib/mock-data';
import { LEGAL_CATEGORIES } from '@/types';
import { CheckCircle, Star, Briefcase, Award } from 'lucide-react';
import { usePagination } from '@/hooks/usePagination';
import { PaginationControls } from '@/components/PaginationControls';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const LawyersDirectory = () => {
  const availableLawyers = mockLawyers.filter(l => l.isVerified && l.isAvailable);
  const { paginated, page, totalPages, next, prev } = usePagination(availableLawyers, 6);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Our Lawyers</h1>
          <p className="mt-1 text-muted-foreground">Browse verified lawyers available on the platform.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paginated.map(l => (
            <div key={l.id} className="rounded-xl border bg-card p-5">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold shrink-0">
                  {l.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-medium text-sm truncate">{l.name}</p>
                    <CheckCircle className="h-3.5 w-3.5 text-green-600 shrink-0" />
                  </div>
                  <p className="text-xs text-muted-foreground">{l.degree}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {l.specializations.map(s => (
                  <span key={s} className="rounded-full bg-gold/10 text-gold px-2 py-0.5 text-[11px] font-medium">{LEGAL_CATEGORIES[s]}</span>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Star className="h-3 w-3 text-gold" />{l.rating}/5</span>
                <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{l.casesHandled} cases</span>
                <span className="flex items-center gap-1"><Award className="h-3 w-3" />{l.experience} yrs</span>
              </div>
              {l.bio && <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{l.bio}</p>}
              <Button variant="outline" size="sm" className="mt-3 w-full" asChild>
                <Link to={`/app/lawyers/${l.id}`}>View Profile</Link>
              </Button>
            </div>
          ))}
        </div>

        {availableLawyers.length === 0 && (
          <div className="rounded-xl border bg-card p-8 text-center">
            <p className="text-muted-foreground">No lawyers are currently available.</p>
          </div>
        )}

        <PaginationControls page={page} totalPages={totalPages} onNext={next} onPrev={prev} />
      </div>
    </DashboardLayout>
  );
};

export default LawyersDirectory;
