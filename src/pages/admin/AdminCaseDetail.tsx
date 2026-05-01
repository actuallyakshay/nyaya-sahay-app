import { AdminCaseLawyerAssign } from '@/components/admin/AdminCaseLawyerAssign';
import { AdminCaseInternalNotesContent } from '@/components/case-detail/AdminCaseInternalNotesContent';
import { CaseDocumentsContent } from '@/components/case-detail/CaseDocumentsContent';
import { CaseDescriptionModal } from '@/components/CaseDescriptionModal';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { path } from '@/constants';
import { useAdminCaseDetails } from '@/hooks/useAdminCaseDetails';
import { useAdminCaseMutations } from '@/hooks/useAdminCaseMutations';
import { useCaseDocumentUpload } from '@/hooks/useCaseDocumentUpload';
import { AdminLayout } from '@/layouts/AdminLayout';
import {
  DESCRIPTION_PREVIEW_MAX_WORDS,
  splitWords,
  truncateToWords,
} from '@/lib/caseDescriptionPreview';
import { CASE_DOCUMENT_ACCEPT } from '@/lib/helpers';
import { queryClient } from '@/lib/query-client';
import { QueryKey } from '@tanstack/react-query';
import {
  AlertTriangle,
  CalendarDays,
  Clock,
  ExternalLink,
  Gavel,
  Hash,
  Loader2,
  MessageCircle,
  RotateCcw,
  StickyNote,
  Tag,
  User,
  Video,
  XCircle,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

const priorityConfig = {
  urgent: {
    color: 'bg-destructive/10 text-destructive border-destructive/20',
    icon: AlertTriangle,
  },
  high: {
    color: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    icon: AlertTriangle,
  },
  normal: {
    color: 'bg-muted text-muted-foreground border-border',
    icon: null,
  },
  low: { color: 'bg-muted text-muted-foreground border-border', icon: null },
};

const AdminCaseDetail = () => {
  const { id } = useParams();
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [descriptionModalOpen, setDescriptionModalOpen] = useState(false);
  const [closeReason, setCloseReason] = useState('');
  const documentUploadInputRef = useRef<HTMLInputElement>(null);
  const { data: caseData, isLoading } = useAdminCaseDetails(id);
  const [queryKey, setQueryKey] = useState<QueryKey | null>(null);

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

  const { isUploadingDocument, uploadFromSource } = useCaseDocumentUpload(
    id,
    'admin'
  );

  const {
    updateCaseStatus,
    resetCase,
    isCaseActionPending,
    isUpdatingStatus,
    isResetting,
  } = useAdminCaseMutations(id, { caseLabel: caseData?.caseCode });

  const handleCloseCase = async () => {
    try {
      await updateCaseStatus('closed');
      setCloseDialogOpen(false);
      setCloseReason('');
    } catch {
      // Error toast from useAdminCaseMutations
    }
  };

  const handleResetCase = async () => {
    await resetCase();
  };

  const handleDocumentUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    await uploadFromSource(file, 'Case page');
    await queryClient.invalidateQueries({ queryKey });
  };

  const priorityKey = (caseData?.priority ??
    'normal') as keyof typeof priorityConfig;
  const pConfig = priorityConfig[priorityKey] ?? priorityConfig.normal;

  const lawyerProfileId =
    caseData?.assignedLawyerId ?? caseData?.assignedLawyer?.id;
  const lawyerDisplayName = caseData?.assignedLawyer?.user?.fullName;
  const userId = caseData?.user?.id;
  const timelineUpdatedAt = caseData?.updatedAt ?? caseData?.createdAt;

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
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <div className="shrink-0 space-y-4">
          {/* Header card */}
          <div className="overflow-hidden rounded-xl border bg-card">
            <div className="space-y-2 border-b bg-muted/30 px-5 py-3">
              <GenericTooltip
                content={caseData?.title}
                side="bottom"
                className="min-w-0"
              >
                <h1 className="truncate text-lg font-bold tracking-tight">
                  {caseData?.title}
                </h1>
              </GenericTooltip>
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={caseData?.status} />
                {caseData?.isEmergency && (
                  <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">
                    Urgent
                  </span>
                )}
                <Badge
                  variant="outline"
                  className={`gap-1 text-[11px] ${pConfig.color}`}
                >
                  {pConfig.icon && <pConfig.icon className="h-3 w-3" />}
                  {(caseData?.priority ?? 'normal').toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center gap-1.5">
                {caseData?.status !== 'closed' &&
                  caseData?.status !== 'resolved' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        disabled={isCaseActionPending}
                        onClick={() => void handleResetCase()}
                      >
                        {isResetting ? (
                          <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <RotateCcw className="mr-1 h-3.5 w-3.5" />
                        )}
                        Reset
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-8 text-xs"
                        disabled={isCaseActionPending}
                        onClick={() => setCloseDialogOpen(true)}
                      >
                        <XCircle className="mr-1 h-3.5 w-3.5" />
                        Close
                      </Button>
                    </>
                  )}
              </div>
            </div>

            <div className="space-y-4 px-5 py-4">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5 shrink-0" />
                  <span className="font-mono text-foreground">
                    {caseData?.caseCode}
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 shrink-0" />
                  <span className="text-foreground">
                    {caseData?.practiceArea?.name}
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                  Created{' '}
                  {new Date(caseData?.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  Updated{' '}
                  {new Date(timelineUpdatedAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 shrink-0" />
                  <span className="font-medium text-foreground">
                    {caseData?.user?.fullName ?? '—'}
                  </span>
                  {userId ? (
                    <Link
                      to={path.adminUser(userId)}
                      className="text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  ) : null}
                </span>
                {lawyerDisplayName ? (
                  <span className="flex items-center gap-1.5">
                    <Gavel className="h-3.5 w-3.5 shrink-0" />
                    <span className="font-medium text-foreground">
                      Adv. {lawyerDisplayName}
                    </span>
                    {lawyerProfileId ? (
                      <Link
                        to={path.adminLawyer(lawyerProfileId)}
                        className="text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    ) : null}
                  </span>
                ) : null}
              </div>
              <div className="rounded-lg border bg-muted/30 px-4 py-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Description
                </h3>
                {rawDescription ? (
                  descriptionIsLong ? (
                    <div className="mt-2 text-sm leading-relaxed text-foreground/90">
                      <span className="block whitespace-pre-wrap">
                        {descriptionPreviewText}
                      </span>
                      <button
                        type="button"
                        className="mt-3 block border-t border-border/60 pt-3 text-xs text-muted-foreground hover:text-gold"
                        onClick={() => setDescriptionModalOpen(true)}
                      >
                        Show full description
                      </button>
                    </div>
                  ) : (
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                      {rawDescription}
                    </p>
                  )
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">—</p>
                )}
              </div>
            </div>
            <div className="flex w-full flex-wrap items-center gap-3 px-4 py-3">
              <div className="w-full min-w-0 flex-1 basis-full sm:basis-0">
                <AdminCaseLawyerAssign
                  caseId={id}
                  caseStatus={caseData?.status}
                />
              </div>
              <TooltipProvider delayDuration={300}>
                <div className="ml-auto flex shrink-0 items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="default"
                        size="sm"
                        className="h-10 flex-none px-4 text-xs font-medium"
                        asChild
                      >
                        <Link
                          to={
                            id ? path.adminCaseChat(id, caseData?.title) : '#'
                          }
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span>Case Chat</span>
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>case chat</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Video className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Book Session</TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-4 lg:flex-row lg:items-stretch">
          <Card className="grid h-[420px] flex-1 grid-rows-[auto_minmax(0,1fr)] overflow-hidden border-border/70 bg-card/95 shadow-sm">
            <CardHeader className="shrink-0 border-b bg-muted/20 pb-3">
              <CardTitle className="text-lg">Documents</CardTitle>
              <CardDescription>
                All files attached to this case.
              </CardDescription>
            </CardHeader>
            <CardContent className="min-h-0 overflow-hidden px-6 pb-5 pt-4">
              <CaseDocumentsContent
                isAdmin
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

          <Card className="grid h-[420px] flex-1 grid-rows-[auto_minmax(0,1fr)] overflow-hidden border-border/70 bg-card/95 shadow-sm">
            <CardHeader className="shrink-0 border-b bg-muted/20 pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <StickyNote className="h-4 w-4 shrink-0" />
                Internal Notes
              </CardTitle>
              <CardDescription>
                Private notes visible only to lawyers and admins.
              </CardDescription>
            </CardHeader>
            <CardContent className="min-h-0 overflow-hidden px-6 pb-5 pt-4">
              <AdminCaseInternalNotesContent caseStatus={caseData?.status} />
            </CardContent>
          </Card>
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

      <Dialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close Case</DialogTitle>
            <DialogDescription>
              This will permanently close case {caseData?.caseCode}. Please
              provide a reason.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Textarea
              placeholder="Reason for closing..."
              value={closeReason}
              onChange={(e) => setCloseReason(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setCloseDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => void handleCloseCase()}
                disabled={!closeReason.trim() || isUpdatingStatus}
              >
                {isUpdatingStatus ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Close Case
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminCaseDetail;
