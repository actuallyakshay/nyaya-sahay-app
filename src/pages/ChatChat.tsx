import {
  markAdminCaseChatRead,
  markCaseChatRead,
  uploadAsset,
} from '@/api-client';
import { CaseChatThread } from '@/components/case-chat/CaseChatThread';
import { GenericTooltip } from '@/components/GenericTooltip';
import { Button } from '@/components/ui/button';
import { path } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { useCaseChatSocket } from '@/hooks/use-case-chat-socket';
import { useCaseMessages } from '@/hooks/use-case-messages';
import { useToast } from '@/hooks/use-toast';
import { AdminLayout } from '@/layouts/AdminLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { CASE_DOCUMENT_ACCEPT, getCookie } from '@/lib/helpers';
import { getApiErrorMessage } from '@/lib/utils';
import type { UserRole } from '@/types';
import { ArrowLeft, Loader2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';

export default function CaseChatPage() {
  const { id } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isAdmin = location.pathname.startsWith('/admin');
  const activeRole = getCookie('x-active-role');
  const viewerParticipant: UserRole = isAdmin
    ? 'admin'
    : activeRole === 'lawyer'
      ? 'lawyer'
      : 'user';
  const { toast } = useToast();
  const { user } = useAuth();

  const caseTitle =
    searchParams.get('title') ||
    (location.state as { title?: string } | null)?.title ||
    'Case Chat';
  const userName = user?.fullName?.trim() || 'Client';

  const [message, setMessage] = useState('');
  const [isUploadingChatFile, setIsUploadingChatFile] = useState(false);
  const chatFileInputRef = useRef<HTMLInputElement>(null);

  const messagesVariant = isAdmin ? 'admin' : 'user';
  const {
    messages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending: isMessagesPending,
  } = useCaseMessages(id, messagesVariant);

  const tailMessage = messages[messages.length - 1];
  const {
    status: chatStatus,
    send: sendChat,
    sendingText,
  } = useCaseChatSocket({
    caseId: id,
    variant: messagesVariant,
    enabled: Boolean(id),
    markRead: isAdmin ? markAdminCaseChatRead : markCaseChatRead,
    isMessagesPending,
    tailMessageId: tailMessage?.id,
    tailFromViewer: tailMessage?.senderRole === viewerParticipant,
  });

  const handleSend = () => {
    sendChat(message);
    setMessage('');
  };

  const handleChatAttachment = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !id) return;
    setIsUploadingChatFile(true);
    try {
      const { data } = await uploadAsset(file);
      const caption = message.trim();
      sendChat({
        assetUrl: data.assetUrl,
        assetName: data.assetName || file.name,
        ...(caption ? { text: caption } : {}),
      });
      if (caption) setMessage('');
    } catch (err) {
      toast({
        title: 'Upload failed',
        description: getApiErrorMessage(err),
        variant: 'destructive',
      });
    } finally {
      setIsUploadingChatFile(false);
    }
  };

  const Layout = isAdmin ? AdminLayout : DashboardLayout;

  if (!id) {
    return (
      <Layout>
        <div className="py-16 text-center text-muted-foreground">
          Invalid case.
        </div>
      </Layout>
    );
  }

  const backLink = isAdmin ? path.adminCase(id) : path.caseDetail(id);

  return (
    <Layout>
      <div
        className="flex min-h-0 flex-col"
        style={{ height: 'calc(100vh - 80px)' }}
      >
        <div className="mb-3 flex shrink-0 items-center gap-3 border-b pb-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link to={backLink} aria-label="Back to case">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>

          <div className="min-w-0">
            <p className="mt-0.5 text-xs text-muted-foreground">{userName}</p>
            <GenericTooltip
              content={caseTitle}
              side="bottom"
              className="min-w-0 flex-1"
            >
              <p className="truncate text-sm font-semibold text-foreground">
                {caseTitle}
              </p>
            </GenericTooltip>
          </div>
        </div>

        <CaseChatThread
          key={id}
          variant={messagesVariant}
          title="Case communication"
          messages={messages}
          viewerParticipant={viewerParticipant}
          draft={message}
          onDraftChange={setMessage}
          onSend={handleSend}
          composer={isAdmin ? 'input' : 'textarea'}
          status={chatStatus}
          sendingText={sendingText}
          hasOlderMessages={Boolean(hasNextPage)}
          isLoadingOlder={isFetchingNextPage}
          onLoadOlder={() => void fetchNextPage()}
          isLoadingMessages={isMessagesPending}
          showThreadHeader={false}
          messageLayout="conversation"
          rootClassName="flex min-h-0 flex-1 flex-col rounded-none border-0 bg-transparent shadow-none"
          panelStyle={{ flex: 1, minHeight: 0 }}
          beforeSendActions={
            <>
              <input
                ref={chatFileInputRef}
                type="file"
                accept={CASE_DOCUMENT_ACCEPT}
                className="hidden"
                onChange={handleChatAttachment}
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                disabled={isUploadingChatFile}
                title="Send file in chat (uploads first, then sends)"
                onClick={() => chatFileInputRef.current?.click()}
              >
                {isUploadingChatFile ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
              </Button>
            </>
          }
        />
      </div>
    </Layout>
  );
}
