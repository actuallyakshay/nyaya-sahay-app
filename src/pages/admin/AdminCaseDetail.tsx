import { AdminCaseLawyerAssign } from '@/components/admin/AdminCaseLawyerAssign';
import { AdminInternalNotesDrawer } from '@/components/admin/AdminInternalNotesDrawer';
import { DocumentsDrawer } from '@/components/DocumentsDrawer';
import { StatusBadge } from '@/components/StatusBadge';
import { TimelineDrawer } from '@/components/TimelineDrawer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
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
import { CASE_DOCUMENT_ACCEPT } from '@/lib/helpers';
import {
  AlertTriangle,
  CalendarDays,
  Clock,
  ExternalLink,
  FileText,
  Gavel,
  Hash,
  Loader2,
  RotateCcw,
  Scale,
  Send,
  StickyNote,
  Tag,
  Upload,
  User,
  Video,
  XCircle,
} from 'lucide-react';
import { useRef, useState } from 'react';
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
  const [message, setMessage] = useState('');
  const chatFileInputRef = useRef<HTMLInputElement>(null);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [closeReason, setCloseReason] = useState('');
  const [notesDrawerOpen, setNotesDrawerOpen] = useState(false);
  const [docsDrawerOpen, setDocsDrawerOpen] = useState(false);
  const [timelineDrawerOpen, setTimelineDrawerOpen] = useState(false);
  const drawerFileInputRef = useRef<HTMLInputElement>(null);
  const { data: caseData } = useAdminCaseDetails(id);

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

  const handleChatUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    await uploadFromSource(file, 'Chat');
  };

  const handleDrawerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    await uploadFromSource(file, 'Documents drawer');
  };

  const priorityKey = (caseData?.priority ??
    'normal') as keyof typeof priorityConfig;
  const pConfig = priorityConfig[priorityKey] ?? priorityConfig.normal;

  const lawyerProfileId =
    caseData?.assignedLawyerId ?? caseData?.assignedLawyer?.id;
  const lawyerDisplayName = caseData?.assignedLawyer?.user?.fullName;
  const userId = caseData?.user?.id;
  const messages = caseData?.messages ?? [];
  const timelineUpdatedAt = caseData?.updatedAt ?? caseData?.createdAt;

  return (
    <AdminLayout>
      <div className="space-y-4">
        {/* Header card */}
        <div className="overflow-hidden rounded-xl border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/30 px-5 py-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-lg font-bold tracking-tight">
                {caseData?.title}
              </h1>
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

          {/* Meta: one wrapped row; description full-width below (avoids stretched / misaligned columns) */}
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
              <p className="mt-2 text-sm leading-relaxed text-foreground/90">
                {caseData?.description?.trim() ? caseData?.description : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Lawyer assignment + Drawer triggers bar */}
        <div className="flex w-full flex-wrap items-center gap-3 rounded-xl border bg-card px-4 py-3">
          <div className="w-full min-w-0 flex-1 basis-full sm:basis-0">
            <AdminCaseLawyerAssign caseId={id} caseStatus={caseData?.status} />
          </div>
          <TooltipProvider delayDuration={300}>
            <div className="ml-auto flex shrink-0 items-center gap-1">
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

        {/* Full-width message box */}
        <div
          className="flex flex-col rounded-xl border bg-card"
          style={{ height: 'calc(100vh - 220px)', minHeight: '360px' }}
        >
          <div className="flex items-center justify-between border-b bg-muted/20 px-4 py-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Messages
            </h3>
            <span className="text-[11px] text-muted-foreground">
              {messages.length} messages
            </span>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No messages yet.
              </p>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-3 ${m.senderRole === 'user' ? '' : 'flex-row-reverse'}`}
                >
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${m.senderRole === 'lawyer' ? 'bg-gold/20 text-gold' : 'bg-muted text-muted-foreground'}`}
                  >
                    {m.senderRole === 'lawyer' ? (
                      <Scale className="h-3 w-3" />
                    ) : (
                      <User className="h-3 w-3" />
                    )}
                  </div>
                  <div
                    className={`max-w-[75%] rounded-lg px-3.5 py-2 text-sm ${m.senderRole === 'user' ? 'bg-muted' : 'bg-navy text-primary-foreground'}`}
                  >
                    <p className="mb-0.5 text-[11px] font-medium opacity-60">
                      {m.senderName}
                    </p>
                    <p className="text-[13px] leading-relaxed">{m.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="flex shrink-0 gap-2 border-t p-3">
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1"
            />
            <input
              ref={chatFileInputRef}
              type="file"
              accept={CASE_DOCUMENT_ACCEPT}
              className="hidden"
              onChange={handleChatUpload}
            />
            <input
              ref={drawerFileInputRef}
              type="file"
              accept={CASE_DOCUMENT_ACCEPT}
              className="hidden"
              onChange={handleDrawerUpload}
            />
            <Button
              size="icon"
              variant="ghost"
              disabled={isUploadingDocument}
              onClick={() => chatFileInputRef.current?.click()}
            >
              {isUploadingDocument ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
            </Button>
            <Button size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Dialogs & Drawers */}
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

      <AdminInternalNotesDrawer
        open={notesDrawerOpen}
        caseStatus={caseData?.status}
        onOpenChange={setNotesDrawerOpen}
      />
      <DocumentsDrawer
        isAdmin={true}
        caseStatus={caseData?.status}
        open={docsDrawerOpen}
        onOpenChange={setDocsDrawerOpen}
        caseClientName={caseData?.user?.fullName}
        caseLawyerName={caseData?.assignedLawyer?.user?.fullName}
        loading={isUploadingDocument}
        onUploadClick={() => {
          if (isUploadingDocument) return;
          drawerFileInputRef.current?.click();
        }}
      />
      <TimelineDrawer
        open={timelineDrawerOpen}
        onOpenChange={setTimelineDrawerOpen}
        status={caseData?.status}
        updatedAt={timelineUpdatedAt}
      />
    </AdminLayout>
  );
};

export default AdminCaseDetail;
