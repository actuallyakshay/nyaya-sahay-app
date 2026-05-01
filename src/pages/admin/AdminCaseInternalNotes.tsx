import { AdminCaseInternalNotesContent } from '@/components/case-detail/AdminCaseInternalNotesContent';
import { GenericTooltip } from '@/components/GenericTooltip';
import { CaseDetailSkeleton } from '@/components/skeletons/CaseDetailSkeleton';
import { Button } from '@/components/ui/button';
import { path } from '@/constants';
import { useAdminCaseDetails } from '@/hooks/useAdminCaseDetails';
import { AdminLayout } from '@/layouts/AdminLayout';
import { ArrowLeft, MessageSquarePlus, StickyNote } from 'lucide-react';
import { Link, useParams, useSearchParams } from 'react-router-dom';

const AdminCaseInternalNotes = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { data: caseData, isLoading } = useAdminCaseDetails(id);

  const caseTitle =
    searchParams.get('title') || caseData?.title || 'Internal Notes';
  const shortCaseTitle =
    caseTitle.length > 25 ? `${caseTitle.slice(0, 25)}…` : caseTitle;

  const backLink = path.adminCase(id || '');

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <CaseDetailSkeleton isLawyer />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Minimal Header */}
        <div className="flex shrink-0 items-center gap-3 border-b border-border bg-card px-6 py-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground"
            asChild
          >
            <Link to={backLink} aria-label="Back to case">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <GenericTooltip
            content={`Internal Notes - ${caseTitle}`}
            side="bottom"
            className="min-w-0 flex-1"
          >
            <h1 className="text-lg font-semibold leading-none text-foreground truncate">
              Internal Notes - {shortCaseTitle}
            </h1>
          </GenericTooltip>
        </div>

        {/* Content */}
        <div className="flex min-h-0 flex-1 flex-col p-6">
          {/* Action Bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <StickyNote className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold">Internal Notes</h2>
            </div>
            <Button className="gap-2">
              <MessageSquarePlus className="h-4 w-4" />
              Add Note
            </Button>
          </div>

          {/* Notes Content */}
          <div className="flex-1 min-h-0">
            <div className="h-full rounded-lg border bg-card">
              <div className="h-full p-6">
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground mb-4">
                    Private notes visible only to lawyers and admins for case{' '}
                    <span className="font-mono text-foreground">
                      {caseData?.caseCode}
                    </span>
                  </p>
                </div>
                <AdminCaseInternalNotesContent caseStatus={caseData?.status} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCaseInternalNotes;
