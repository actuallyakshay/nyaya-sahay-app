import { FileViewer } from '@/components/FileViewer';
import { ChatSkeleton } from '@/components/skeletons/ChatSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getFileIcon } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import type {
  CaseChatConnectionStatus,
  CaseChatThreadProps,
  CaseMessage,
  UserRole,
} from '@/types';
import { Loader2, Scale, Send, Shield, User } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

function statusLabel(status: CaseChatConnectionStatus): string {
  switch (status) {
    case 'connecting':
      return 'Connecting…';
    case 'open':
      return 'Live';
    case 'error':
      return 'Connection issue';
    default:
      return '';
  }
}

function bubbleClasses(senderRole: UserRole): string {
  if (senderRole === 'user') return 'bg-muted';
  if (senderRole === 'admin') return 'bg-violet-950/90 text-primary-foreground';
  return 'bg-navy text-primary-foreground';
}

function roleLabel(role: UserRole) {
  if (role === 'lawyer') return 'Lawyer';
  if (role === 'admin') return 'Admin';
  return 'User';
}

/** Time only (no date), very compact. */
function formatMessageTimeOnly(ts: string) {
  return new Date(ts).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Short date + time (conversation layout). */
function formatMessageDigest(ts: string) {
  return new Date(ts).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Returns a date-only key like "2025-04-15" for grouping. */
function getDateKey(ts: string): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** WhatsApp-style date label: Today / Yesterday / "15 Apr 2025". */
function formatDateSeparator(ts: string): string {
  const d = new Date(ts);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = (today.getTime() - msgDay.getTime()) / 86400000;
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function DateSeparator({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center py-2">
      <span className="rounded-full bg-muted/80 px-3 py-1 text-[11px] font-medium text-muted-foreground shadow-sm">
        {label}
      </span>
    </div>
  );
}

/** Align own side by viewer role (same model as internal notes: user / lawyer / admin). */
function isOwnBubble(
  m: CaseMessage,
  viewerParticipant: UserRole | null | undefined,
  variant: CaseChatThreadProps['variant']
): boolean {
  if (viewerParticipant) return m.senderRole === viewerParticipant;
  if (variant === 'user') return m.senderRole === 'user';
  if (variant === 'admin') return m.senderRole === 'admin';
  return false;
}

function chatAttachmentLabel(m: CaseMessage) {
  return (m.assetName || '').trim() || 'Attachment';
}

function isChatInlineImage(m: CaseMessage) {
  if (!m.assetUrl) return false;
  if (m.messageType === 'image') return true;
  const hint = `${m.assetName ?? ''} ${m.assetUrl}`.toLowerCase();
  return /\.(png|jpe?g|gif|webp|bmp|svg)(\?|#|$)/i.test(hint);
}

function MessageAttachmentRow({
  m,
  onOpen,
}: {
  m: CaseMessage;
  onOpen: () => void;
}) {
  if (!m.assetUrl) return null;
  const label = chatAttachmentLabel(m);
  const icon = getFileIcon(m.assetName || m.assetUrl || 'file');
  if (isChatInlineImage(m)) {
    return (
      <button
        type="button"
        className="mt-1 block w-full overflow-hidden rounded-lg text-left ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={onOpen}
      >
        <img
          src={m.assetUrl}
          alt={label}
          className="max-h-44 w-full object-contain"
        />
      </button>
    );
  }
  return (
    <button
      type="button"
      className="mt-1 flex w-full min-w-0 items-center gap-2 rounded-md border border-border bg-muted/50 px-2 py-1.5 text-left text-xs transition-colors hover:bg-muted"
      onClick={onOpen}
    >
      <span className="flex min-w-0 shrink items-center gap-2">
        <span className="shrink-0">{icon}</span>
        <span className="min-w-0 truncate font-medium">{label}</span>
      </span>
    </button>
  );
}

export function CaseChatThread({
  variant,
  title,
  messages,
  viewerParticipant,
  draft,
  onDraftChange,
  onSend,
  composer,
  status,
  sendingText,
  hasOlderMessages,
  isLoadingOlder,
  onLoadOlder,
  isLoadingMessages,
  beforeSendActions,
  panelStyle,
  showThreadHeader = true,
  messageLayout = 'stack',
  rootClassName,
}: CaseChatThreadProps) {
  const compact = variant === 'admin';
  const conversation = messageLayout === 'conversation';
  const isSending = Boolean(sendingText?.trim());
  const canSend = status === 'open' && draft.trim().length > 0 && !isSending;
  const live = statusLabel(status);

  const [attachmentViewerOpen, setAttachmentViewerOpen] = useState(false);
  const [attachmentViewer, setAttachmentViewer] = useState<{
    name: string;
    url: string;
  } | null>(null);

  const openChatAttachment = (m: CaseMessage) => {
    if (!m.assetUrl) return;
    setAttachmentViewer({ name: chatAttachmentLabel(m), url: m.assetUrl });
    setAttachmentViewerOpen(true);
  };

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoGrow = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  const resetTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
  }, []);

  useEffect(() => {
    if (!draft) resetTextarea();
  }, [draft, resetTextarea]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const preLoadHeightRef = useRef<number | null>(null);
  const loadOlderLock = useRef(false);

  const newestMessageId = messages[messages.length - 1]?.id;

  useLayoutEffect(() => {
    if (isLoadingOlder) {
      preLoadHeightRef.current = scrollRef.current?.scrollHeight ?? null;
    } else if (preLoadHeightRef.current != null && scrollRef.current) {
      const el = scrollRef.current;
      const prev = preLoadHeightRef.current;
      preLoadHeightRef.current = null;
      el.scrollTop = el.scrollHeight - prev + el.scrollTop;
    }
  }, [isLoadingOlder, messages.length]);

  useEffect(() => {
    if (!isLoadingOlder) loadOlderLock.current = false;
  }, [isLoadingOlder]);

  /** Scroll to bottom on send, new tail message, or first load — not when prepending older pages (newest id unchanged). */
  useLayoutEffect(() => {
    if (isLoadingOlder || isLoadingMessages) return;
    const el = scrollRef.current;
    if (!el) return;
    if (!newestMessageId && !isSending) return;
    el.scrollTop = el.scrollHeight;
  }, [newestMessageId, isSending, isLoadingOlder, isLoadingMessages]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (
      !el ||
      !hasOlderMessages ||
      isLoadingOlder ||
      loadOlderLock.current ||
      !onLoadOlder
    ) {
      return;
    }
    if (el.scrollTop < 72) {
      loadOlderLock.current = true;
      onLoadOlder();
    }
  };

  const isFirstInGroup = (index: number): boolean => {
    if (index === 0) return true;
    return messages[index].senderRole !== messages[index - 1].senderRole;
  };

  const isNewDate = (index: number): boolean => {
    if (index === 0) return true;
    return (
      getDateKey(messages[index].timestamp) !==
      getDateKey(messages[index - 1].timestamp)
    );
  };

  const scrollAreaClass = conversation
    ? 'flex-1 min-h-0 overflow-y-auto px-1 py-2'
    : 'flex-1 overflow-y-auto p-4';

  return (
    <div
      className={cn(
        'flex min-h-0 flex-col rounded-xl border bg-card',
        rootClassName
      )}
      style={panelStyle}
    >
      {showThreadHeader ? (
        <div
          className={`flex shrink-0 items-center justify-between gap-2 overflow-hidden border-b ${compact ? 'bg-muted/20 px-4 py-2.5' : 'p-3'}`}
        >
          <h3
            className={
              compact
                ? 'text-xs font-semibold uppercase tracking-wider text-muted-foreground'
                : 'text-sm font-semibold'
            }
          >
            {title}
          </h3>
          <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
            {live ? (
              <span
                className={
                  status === 'open'
                    ? 'text-emerald-600'
                    : status === 'error'
                      ? 'text-destructive'
                      : ''
                }
              >
                {live}
              </span>
            ) : null}
            <span>
              {messages.length} loaded
              {hasOlderMessages ? (
                <span className="text-muted-foreground/80"> · more above</span>
              ) : null}
            </span>
          </div>
        </div>
      ) : null}

      <div ref={scrollRef} className={scrollAreaClass} onScroll={onScroll}>
        {hasOlderMessages && !isLoadingOlder && onLoadOlder ? (
          <div className="flex justify-center pb-2 pt-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => {
                loadOlderLock.current = true;
                onLoadOlder();
              }}
            >
              Load older messages
            </Button>
          </div>
        ) : null}
        {isLoadingOlder ? (
          <div className="flex justify-center py-2">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : null}
        {isLoadingMessages && messages.length === 0 && !isSending ? (
          <ChatSkeleton />
        ) : null}
        {!isLoadingMessages && messages.length === 0 && !isSending ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {compact
              ? 'No messages yet.'
              : 'No messages yet. Start the conversation.'}
          </p>
        ) : null}
        {(messages.length > 0 || isSending) && !isLoadingMessages ? (
          <>
            {messages.map((m, index) => {
              const role = m.senderRole ?? 'user';
              const own = isOwnBubble(m, viewerParticipant, variant);
              const darkBubble = role === 'admin' || role === 'lawyer';
              const firstInGroup = isFirstInGroup(index);

              if (conversation) {
                const showDate = isNewDate(index);
                const ownBubble =
                  variant === 'admin' && own
                    ? 'bg-violet-950/90 text-primary-foreground'
                    : own
                      ? 'bg-amber-50 text-amber-950 border border-amber-200/60'
                      : 'bg-muted';
                const avatarRing =
                  role === 'lawyer'
                    ? 'bg-gold/20 text-gold'
                    : role === 'admin'
                      ? 'bg-violet-950/40 text-violet-100'
                      : 'bg-muted text-muted-foreground';
                return (
                  <div key={m.id}>
                    {showDate ? (
                      <DateSeparator label={formatDateSeparator(m.timestamp)} />
                    ) : null}
                    <div
                      className={cn(
                        'flex gap-3',
                        own && 'flex-row-reverse',
                        firstInGroup && !showDate
                          ? 'mt-3'
                          : !firstInGroup
                            ? 'mt-0.5'
                            : 'mt-1',
                        !firstInGroup && (own ? 'pr-11' : 'pl-11')
                      )}
                    >
                      {role === 'lawyer' ? (
                        <Scale className="h-3.5 w-3.5" />
                      ) : role === 'admin' ? (
                        <Shield className="h-3.5 w-3.5" />
                      ) : (
                        <User className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <div
                      className={cn(
                        'max-w-[70%] rounded-2xl px-4 py-2.5 text-sm',
                        ownBubble
                      )}
                    >
                      <p
                        className={cn(
                          'mb-0.5 text-[11px] font-medium opacity-60',
                          own && 'text-primary-foreground/80'
                        )}
                      >
                        {roleLabel(role)}
                      </p>
                      {m.content?.trim() ? (
                        <p className="leading-relaxed">{m.content}</p>
                      ) : null}
                      <MessageAttachmentRow
                        m={m}
                        onOpen={() => openChatAttachment(m)}
                      />
                      <p
                        className={cn(
                          'max-w-[70%] rounded-2xl px-4 py-2.5 text-sm',
                          ownBubble
                        )}
                      >
                        {firstInGroup ? (
                          <p
                            className={cn(
                              'mb-0.5 text-[11px] font-medium opacity-60',
                              own &&
                                variant === 'admin' &&
                                'text-primary-foreground/80'
                            )}
                          >
                            {roleLabel(role)}
                          </p>
                        ) : null}
                        {m.content?.trim() ? (
                          <p className="leading-relaxed">{m.content}</p>
                        ) : null}
                        <MessageAttachmentRow
                          m={m}
                          onOpen={() => openChatAttachment(m)}
                        />
                        <p
                          className={cn(
                            'mt-1 text-right text-[10px] opacity-40',
                            own &&
                              variant === 'admin' &&
                              'text-primary-foreground/70'
                          )}
                        >
                          {formatMessageTimeOnly(m.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }

              const showDate = isNewDate(index);
              return (
                <div
                  key={m.id}
                  className={cn(
                    'flex flex-col gap-1',
                    own ? 'items-end' : 'items-start'
                  )}
                >
                  <div
                    className={cn(
                      'flex flex-col',
                      own ? 'items-end' : 'items-start',
                      firstInGroup && !showDate
                        ? 'mt-3'
                        : !firstInGroup
                          ? 'mt-0.5'
                          : 'mt-1'
                    )}
                  >
                    {m.content?.trim() ? (
                      <p
                        className={cn(
                          'leading-relaxed',
                          compact ? 'text-[13px]' : 'text-[15px]'
                        )}
                      >
                        {m.content}
                      </p>
                    ) : null}
                    <MessageAttachmentRow
                      m={m}
                      onOpen={() => openChatAttachment(m)}
                    />
                    <div
                      className={cn(
                        'border-current/10 mt-1.5 flex items-center justify-between gap-2 border-t pt-1 text-[9px] leading-none opacity-75',
                        darkBubble
                          ? 'text-primary-foreground/75'
                          : 'text-muted-foreground'
                      )}
                    >
                      {m.content?.trim() ? (
                        <p
                          className={cn(
                            'leading-relaxed',
                            compact ? 'text-[13px]' : 'text-[15px]'
                          )}
                        >
                          {m.content}
                        </p>
                      ) : null}
                      <MessageAttachmentRow
                        m={m}
                        onOpen={() => openChatAttachment(m)}
                      />
                      <div
                        className={cn(
                          'border-current/10 mt-1.5 flex items-center justify-between gap-2 border-t pt-1 text-[9px] leading-none opacity-75',
                          darkBubble
                            ? 'text-primary-foreground/75'
                            : 'text-muted-foreground'
                        )}
                      >
                        {firstInGroup ? (
                          <span className="flex min-w-0 items-center gap-1">
                            <Send
                              className="size-2.5 shrink-0 opacity-80"
                              strokeWidth={2.5}
                              aria-hidden
                            />
                            <span className="truncate font-medium uppercase tracking-wide">
                              {roleLabel(role)}
                            </span>
                          </span>
                        ) : (
                          <span />
                        )}
                        <time
                          className="shrink-0 tabular-nums"
                          dateTime={m.timestamp}
                        >
                          {formatMessageTimeOnly(m.timestamp)}
                        </time>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {isSending ? (
              conversation ? (
                <div className="flex flex-row-reverse gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <div className="max-w-[70%] rounded-2xl border border-dashed border-border/80 bg-muted/50 px-4 py-2.5 text-sm text-muted-foreground">
                    <p className="mb-0.5 text-[11px] font-medium opacity-60">
                      You
                    </p>
                    <p className="leading-relaxed">{sendingText}</p>
                    <p className="mt-1 text-[10px] opacity-40">Sending…</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-end gap-1">
                  <div
                    className={`max-w-[85%] rounded-xl border border-dashed border-border/80 bg-muted/50 text-muted-foreground ${compact ? 'rounded-lg px-3.5 py-2.5' : 'px-4 py-3'}`}
                  >
                    <p
                      className={cn(
                        'leading-relaxed',
                        compact ? 'text-[13px]' : 'text-[15px]'
                      )}
                    >
                      {sendingText}
                    </p>
                    <div className="mt-1.5 flex items-center justify-between gap-2 border-t border-border/40 pt-1 text-[9px] leading-none text-muted-foreground opacity-80">
                      <span className="flex min-w-0 items-center gap-1">
                        <Loader2 className="size-2.5 shrink-0 animate-spin" />
                        <Send
                          className="size-2.5 shrink-0 opacity-70"
                          strokeWidth={2.5}
                          aria-hidden
                        />
                        <span className="font-medium uppercase tracking-wide">
                          You
                        </span>
                      </span>
                      <span className="shrink-0 tabular-nums">…</span>
                    </div>
                  </div>
                </div>
              )
            ) : null}
          </>
        ) : null}
      </div>

      <div className="flex shrink-0 gap-2 border-t p-3">
        {composer === 'textarea' ? (
          <Textarea
            ref={textareaRef}
            placeholder="Type a message... "
            value={draft}
            onChange={(e) => {
              onDraftChange(e.target.value);
              autoGrow();
            }}
            className="min-h-[40px] flex-1 overflow-y-auto"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (canSend) {
                  onSend();
                  resetTextarea();
                }
              }
            }}
          />
        ) : (
          <Input
            placeholder="Type a message..."
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (canSend) onSend();
              }
            }}
          />
        )}
        {beforeSendActions}
        <Button
          type="button"
          size="icon"
          disabled={!canSend}
          onClick={() => {
            if (canSend) onSend();
          }}
        >
          {status === 'connecting' || isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>

      {attachmentViewer ? (
        <FileViewer
          open={attachmentViewerOpen}
          onOpenChange={(open) => {
            setAttachmentViewerOpen(open);
            if (!open) setAttachmentViewer(null);
          }}
          fileName={attachmentViewer.name}
          fileUrl={attachmentViewer.url}
        />
      ) : null}
    </div>
  );
}
