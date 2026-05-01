import { getCaseDetails } from '@/api-client';
import { CaseDocumentsContent } from '@/components/case-detail/CaseDocumentsContent';
import { CaseInternalNotesContent } from '@/components/case-detail/CaseInternalNotesContent';
import { CaseDescriptionModal } from '@/components/CaseDescriptionModal';
import { CaseMeetingUri } from '@/components/CaseMeetingUri';
import { GenericTooltip } from '@/components/GenericTooltip';
import { CaseDetailSkeleton } from '@/components/skeletons/CaseDetailSkeleton';
import { StatusBadge } from '@/components/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { SessionBookingModal } from '@/components/user/SessionBookingModal';
import { path } from '@/constants';
import { useCaseDocumentUpload } from '@/hooks/useCaseDocumentUpload';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import {
  DESCRIPTION_PREVIEW_MAX_WORDS,
  splitWords,
  truncateToWords,
} from '@/lib/caseDescriptionPreview';
import { CASE_DOCUMENT_ACCEPT, getCookie } from '@/lib/helpers';
import { queryClient } from '@/lib/query-client';
import { QueryKey, useQuery } from '@tanstack/react-query';
import { MessageCircle, Scale, StickyNote, User, Video } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

const CaseDetail = () => {
  const { id } = useParams();
  const activeRole = getCookie('x-active-role');
  const isLawyer = activeRole === 'lawyer' ? true : false;
  const documentUploadInputRef = useRef<HTMLInputElement>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
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

  const handleDocumentUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    await uploadFromSource(file, 'Case page');
    await queryClient.invalidateQueries({ queryKey });
  };

  const isLawyerAssigned = caseData?.assignedLawyerId;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
          <CaseDetailSkeleton isLawyer={isLawyer} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
        {/* Header */}
        <div className="shrink-0">
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
          <GenericTooltip content={caseData?.title}>
            <h1 className="mt-1 line-clamp-2 text-xl font-bold sm:text-2xl lg:line-clamp-1">
              {caseData?.title}
            </h1>
          </GenericTooltip>
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
        <div className="flex shrink-0 flex-wrap items-center gap-2">
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
                  <Button
                    variant="default"
                    size="sm"
                    className="h-8 gap-1.5 px-3"
                    asChild
                  >
                    <Link to={id ? path.caseChat(id, caseData?.title) : '#'}>
                      <MessageCircle className="h-4 w-4" />
                      <span>Case Chat</span>
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Case chat</TooltipContent>
              </Tooltip>

              {isLawyerAssigned && !caseData?.caseSessionRequest && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="default"
                      size="sm"
                      className="h-8 gap-1.5 px-3"
                      onClick={() => setBookingOpen(true)}
                    >
                      <Video className="h-4 w-4" />
                      <span>Book Session</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Book Session</TooltipContent>
                </Tooltip>
              )}
            </div>
          </TooltipProvider>
        </div>

        {caseData?.caseSessionRequest && (
          <div className="w-full min-w-0 shrink-0">
            <CaseMeetingUri
              sessionRequest={caseData?.caseSessionRequest}
              caseId={id}
              allowWithdrawSessionRequest={!isLawyer}
            />
          </div>
        )}

        {/* Documents + internal notes — flex-1 fills remaining viewport height */}
        <div
          className={
            isLawyer
              ? 'flex min-h-[420px] flex-1 flex-col gap-4 lg:flex-row lg:items-stretch'
              : 'flex min-h-[420px] flex-1 flex-col gap-4'
          }
        >
          <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <CardHeader className="shrink-0 pb-3">
              <CardTitle className="text-lg">Documents</CardTitle>
              <CardDescription>
                All files attached to this case.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden px-6 pb-6 pt-0">
              <CaseDocumentsContent
                caseClientName={caseData?.user?.fullName}
                caseLawyerName={caseData?.assignedLawyer?.user?.fullName}
                caseStatus={caseData?.status}
                loading={isUploadingDocument}
                onUploadClick={(qk) => {
                  if (isUploadingDocument) return;
                  documentUploadInputRef.current?.click();
                  setQueryKey(qk);
                }}
              />
            </CardContent>
          </Card>

          {isLawyer ? (
            <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <CardHeader className="shrink-0 pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <StickyNote className="h-4 w-4 shrink-0" />
                  Internal Notes
                </CardTitle>
                <CardDescription>
                  Private notes visible only to lawyers and admins.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden px-6 pb-6 pt-0">
                <CaseInternalNotesContent />
              </CardContent>
            </Card>
          ) : null}
        </div>

        <input
          ref={documentUploadInputRef}
          type="file"
          accept={CASE_DOCUMENT_ACCEPT}
          className="hidden"
          onChange={handleDocumentUpload}
        />
      </div>

      <CaseDescriptionModal
        open={descriptionModalOpen}
        onOpenChange={setDescriptionModalOpen}
        caseTitle={caseData?.title ?? ''}
        description={rawDescription}
      />

      <SessionBookingModal
        bookingOpen={bookingOpen}
        setBookingOpen={setBookingOpen}
        caseId={id}
        lawyerName={caseData?.assignedLawyer?.user?.fullName}
      />

      {/* <TimelineDrawer
        open={timelineDrawerOpen}
        onOpenChange={setTimelineDrawerOpen}
        status={caseData?.status}
        updatedAt={caseData?.updatedAt}
      /> */}
    </DashboardLayout>
  );
};

export default CaseDetail;
