import { getCaseDetails, uploadAsset, uploadCaseDocument } from '@/api-client';
import { CaseMeetingUri } from '@/components/CaseMeetingUri';
import { DocumentsDrawer } from '@/components/DocumentsDrawer';
import { InternalNotesDrawer } from '@/components/InternalNotesDrawer';
import { StatusBadge } from '@/components/StatusBadge';
import { TimelineDrawer } from '@/components/TimelineDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { SessionBookingModal } from '@/components/user/SessionBookingModal';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { getCookie } from '@/lib/helpers';
import { queryClient } from '@/lib/query-client';
import { getApiErrorMessage } from '@/lib/utils';
import { LEGAL_CATEGORIES } from '@/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Clock,
  FileText,
  Loader2,
  Scale,
  Send,
  StickyNote,
  Upload,
  User,
  Video,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const CaseDetail = () => {
  const { id } = useParams();
  const activeRole = getCookie('x-active-role');
  const isLawyer = activeRole === 'lawyer' ? true : false;
  const [message, setMessage] = useState('');
  const { toast } = useToast();
  const chatFileInputRef = useRef<HTMLInputElement>(null);
  const drawerFileInputRef = useRef<HTMLInputElement>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [notesDrawerOpen, setNotesDrawerOpen] = useState(false);
  const [docsDrawerOpen, setDocsDrawerOpen] = useState(false);
  const [timelineDrawerOpen, setTimelineDrawerOpen] = useState(false);
  const navigate = useNavigate();

  // const hasMeeting = caseData?.status === 'in_consultation';

  const { data: caseData, isFetching } = useQuery({
    queryKey: ['case-details', id],
    queryFn: async () => {
      const response = await getCaseDetails(id);
      return response.data;
    },
    refetchOnWindowFocus: false,
  });

  const { mutateAsync: uploadSingleDocument, isPending: isUploadingDocument } =
    useMutation({
      mutationFn: async (file: File) => {
        if (!id) {
          throw new Error('Case ID is missing.');
        }
        const { data } = await uploadAsset(file);
        await uploadCaseDocument(id, {
          assetUrl: data.assetUrl,
          assetType: data.assetType,
          assetName: data.assetName,
          author: isLawyer ? 'lawyer' : 'user',
        });
      },
    });

  const uploadFromSource = async (
    file: File,
    source: 'Chat' | 'Documents drawer'
  ) => {
    try {
      await uploadSingleDocument(file);
      await queryClient.invalidateQueries({ queryKey: ['case-documents'] });
      toast({
        title: 'Document uploaded',
        description: `${file.name} uploaded from ${source}.`,
      });
    } catch (err) {
      toast({
        title: 'Upload failed',
        description: getApiErrorMessage(err),
        variant: 'destructive',
      });
    }
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

  const isLawyerAssigned = caseData?.assignedLawyerId;

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
          <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
            {caseData?.description}
          </p>
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
          <span className="text-xs text-muted-foreground">
            {LEGAL_CATEGORIES[caseData?.practiceArea?.name]}
          </span>
          <div className="flex-1" />

          <TooltipProvider delayDuration={300}>
            <div className="flex items-center gap-1">
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

        {/* Chat — full width now */}
        <div
          className="flex flex-col rounded-xl border bg-card"
          style={{ height: '600px' }}
        >
          <div className="flex shrink-0 items-center justify-between border-b p-3">
            <h3 className="text-sm font-semibold">Case Communication</h3>
            <span className="text-xs text-muted-foreground">
              {caseData?.messages?.length} messages
            </span>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {caseData?.messages?.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No messages yet. Start the conversation.
              </p>
            ) : (
              caseData?.messages?.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-3 ${m.senderRole === 'user' ? '' : 'flex-row-reverse'}`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${m.senderRole === 'lawyer' ? 'bg-gold/20 text-gold' : 'bg-muted text-muted-foreground'}`}
                  >
                    {m.senderRole === 'lawyer' ? (
                      <Scale className="h-3.5 w-3.5" />
                    ) : (
                      <User className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <div
                    className={`max-w-[75%] rounded-xl px-4 py-2.5 text-sm ${m.senderRole === 'user' ? 'bg-muted' : 'bg-navy text-primary-foreground'}`}
                  >
                    <p className="mb-0.5 text-xs font-medium opacity-70">
                      {m.senderName}
                    </p>
                    <p>{m.content}</p>
                    <p className="mt-1 text-[10px] opacity-50">
                      {new Date(m.timestamp).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
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
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              className="hidden"
              onChange={handleChatUpload}
            />
            <input
              ref={drawerFileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
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
        onOpenChange={setDocsDrawerOpen}
        onUploadClick={() => {
          if (isUploadingDocument) return;
          drawerFileInputRef.current?.click();
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
