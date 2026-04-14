import { getCaseDetails } from '@/api-client';
import { CaseDescriptionModal } from '@/components/CaseDescriptionModal';
import { CaseMeetingUri } from '@/components/CaseMeetingUri';
import { DocumentsDrawer } from '@/components/DocumentsDrawer';
import { InternalNotesDrawer } from '@/components/InternalNotesDrawer';
import { CaseDetailSkeleton } from '@/components/skeletons/CaseDetailSkeleton';
import { StatusBadge } from '@/components/StatusBadge';
import { TimelineDrawer } from '@/components/TimelineDrawer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { SessionBookingModal } from '@/components/user/SessionBookingModal';
import { useCaseDocumentUpload } from '@/hooks/useCaseDocumentUpload';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { path } from '@/constants';
import {
  DESCRIPTION_PREVIEW_MAX_WORDS,
  splitWords,
  truncateToWords,
} from '@/lib/caseDescriptionPreview';
import { CASE_DOCUMENT_ACCEPT, getCookie } from '@/lib/helpers';
import { queryClient } from '@/lib/query-client';
import { QueryKey, useQuery } from '@tanstack/react-query';
import {
  Clock,
  FileText,
  MessageCircle,
  Scale,
  StickyNote,
  User,
  Video,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

const CaseDetail = () => {
  const { id } = useParams();
  const activeRole = getCookie('x-active-role');
  const isLawyer = activeRole === 'lawyer' ? true : false;
  const drawerFileInputRef = useRef<HTMLInputElement>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [notesDrawerOpen, setNotesDrawerOpen] = useState(false);
  const [docsDrawerOpen, setDocsDrawerOpen] = useState(false);
  const [timelineDrawerOpen, setTimelineDrawerOpen] = useState(false);
  const [descriptionModalOpen, setDescriptionModalOpen] = useState(false);
  const [queryKey, setQueryKey] = useState<QueryKey | null>(null);
  const { isUploadingDocument, uploadFromSource } = useCaseDocumentUpload(
    id,
    isLawyer ? 'lawyer' : 'user'
  );

  const { data: caseData, isLoading } = useQuery({
    queryKey: ['case-details', id],
    queryFn: async () => {
      const response = await getCaseDetails(id);
      return response.data;
    },
    refetchOnWindowFocus: false,
  });

  const rawDescription = caseData?.description?.trim() ?? '';
  const descriptionIsLong = useMemo(() => {
    if (!rawDescription) return false;
    return splitWords(rawDescription).length > DESCRIPTION_PREVIEW_MAX_WORDS;
  }, [rawDescription]);
  const descriptionPreviewText = useMemo(
    () =>
      rawDescription
        ? truncateToWords(rawDescription, DESCRIPTION_PREVIEW_MAX_WORDS)
        : '',
    [rawDescription]
  );

  const handleDrawerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    await uploadFromSource(file, 'Documents drawer');
    await queryClient.invalidateQueries({ queryKey });
  };

  const isLawyerAssigned = caseData?.assignedLawyerId;

  if (isLoading) {
    return (
      <DashboardLayout>
        <CaseDetailSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm text-muted-foreground">
              {caseData?.caseCode}
            </span>
            <StatusBadge status={caseData?.status} />
            {caseData?.isEmergency && (
              <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                Urgent
              </span>
            )}
          </div>
          <h1 className="mt-1 text-xl font-bold sm:text-2xl">
            {caseData?.title}
          </h1>
          {rawDescription ? (
            descriptionIsLong ? (
              <button
                type="button"
                className="group mt-0.5 w-full rounded-md text-left text-sm leading-relaxed text-muted-foreground transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                onClick={() => setDescriptionModalOpen(true)}
              >
                <span className="block whitespace-pre-wrap">
                  {descriptionPreviewText}
                </span>
                <span className="mt-3 block border-t border-border/60 pt-3 text-xs text-muted-foreground group-hover:text-foreground">
                  Show full description
                </span>
              </button>
            ) : (
              <p className="mt-0.5 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {rawDescription}
              </p>
            )
          ) : (
            <p className="mt-0.5 text-sm text-muted-foreground">—</p>
          )}
        </div>

        {/* Action bar */}
        <div className="flex flex-wrap items-center gap-2">
          {isLawyerAssigned && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/10 px-3 py-1 text-xs font-medium text-gold transition-colors hover:bg-gold/20">
              <Scale className="h-3 w-3" />
              Adv. {caseData?.assignedLawyer?.user?.fullName}
            </span>
          )}
          {isLawyer && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              <User className="h-3 w-3" />
              Client: {caseData?.user?.fullName}
            </span>
          )}
          <Badge variant="secondary" className="font-normal">
            {caseData?.practiceArea?.name}
          </Badge>
          <div className="flex-1" />

          <TooltipProvider delayDuration={300}>
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                    <Link to={id ? path.caseChat(id) : '#'}>
                      <MessageCircle className="h-4 w-4" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Case chat</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setDocsDrawerOpen(true)}
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Documents</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setTimelineDrawerOpen(true)}
                  >
                    <Clock className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Timeline</TooltipContent>
              </Tooltip>

              {isLawyer && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setNotesDrawerOpen(true)}
                    >
                      <StickyNote className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Internal Notes</TooltipContent>
                </Tooltip>
              )}

              {isLawyerAssigned && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setBookingOpen(true)}
                    >
                      <Video className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Book Session</TooltipContent>
                </Tooltip>
              )}
            </div>
          </TooltipProvider>
        </div>

        <CaseMeetingUri sessionRequest={caseData?.caseSessionRequest} />

        <input
          ref={drawerFileInputRef}
          type="file"
          accept={CASE_DOCUMENT_ACCEPT}
          className="hidden"
          onChange={handleDrawerUpload}
        />
      </div>

      <CaseDescriptionModal
        open={descriptionModalOpen}
        onOpenChange={setDescriptionModalOpen}
        caseTitle={caseData?.title ?? ''}
        description={rawDescription}
      />

      {/* Booking dialog */}
      <SessionBookingModal
        bookingOpen={bookingOpen}
        setBookingOpen={setBookingOpen}
        caseId={id}
        lawyerName={caseData?.assignedLawyer?.user?.fullName}
      />

      {/* Drawers */}
      <DocumentsDrawer
        open={docsDrawerOpen}
        caseClientName={caseData?.user?.fullName}
        caseLawyerName={caseData?.assignedLawyer?.user?.fullName}
        caseStatus={caseData?.status}
        onOpenChange={setDocsDrawerOpen}
        onUploadClick={(queryKey) => {
          if (isUploadingDocument) return;
          drawerFileInputRef.current?.click();
          setQueryKey(queryKey);
        }}
        loading={isUploadingDocument}
      />

      <TimelineDrawer
        open={timelineDrawerOpen}
        onOpenChange={setTimelineDrawerOpen}
        status={caseData?.status}
        updatedAt={caseData?.updatedAt}
      />

      {isLawyer && (
        <InternalNotesDrawer
          open={notesDrawerOpen}
          onOpenChange={setNotesDrawerOpen}
        />
      )}
    </DashboardLayout>
  );
};

export default CaseDetail;
