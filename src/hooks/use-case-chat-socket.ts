import type {
  CaseMessage,
  CaseMessagesPage,
  CaseChatConnectionStatus,
  UseCaseChatSocketOptions,
} from '@/types';
import {
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';
import {
  CHAT_ERROR,
  CHAT_JOIN,
  CHAT_MESSAGE,
  CHAT_SEND,
  createCaseChatSocket,
} from '@/lib/case-chat-socket';
import { invalidateCaseChatUnread } from '@/lib/case-chat-queries';
import { caseMessagesQueryKey } from './use-case-messages';

type PendingOutbound = { clientMessageId: string; label: string };

export type CaseChatSendPayload =
  | string
  | { text?: string; assetUrl?: string; assetName?: string };

export function useCaseChatSocket(options: UseCaseChatSocketOptions): {
  status: CaseChatConnectionStatus;
  send: (payload: CaseChatSendPayload) => void;
  /** Outbound preview: draft text or file name while the server acks. */
  sendingText: string | null;
} {
  const {
    caseId,
    variant,
    enabled,
    markRead,
    isMessagesPending,
    tailMessageId,
    tailFromViewer,
  } = options;
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const [status, setStatus] = useState<CaseChatConnectionStatus>('idle');
  const [sendingText, setSendingText] = useState<string | null>(null);
  const pendingRef = useRef<PendingOutbound | null>(null);

  const lastReadKeyRef = useRef<string | null>(null);

  useEffect(() => {
    lastReadKeyRef.current = null;
  }, [caseId, enabled]);

  useEffect(() => {
    if (!markRead || !caseId || !enabled) return;
    if (isMessagesPending || !tailMessageId) return;

    const key = `${caseId}:${tailMessageId}`;
    if (lastReadKeyRef.current === key) return;
    lastReadKeyRef.current = key;

    if (tailFromViewer) {
      invalidateCaseChatUnread(queryClient);
      return;
    }

    void markRead(caseId, { messageId: tailMessageId })
      .then(() => invalidateCaseChatUnread(queryClient))
      .catch(() => {
        lastReadKeyRef.current = null;
      });
  }, [
    caseId,
    enabled,
    isMessagesPending,
    markRead,
    queryClient,
    tailFromViewer,
    tailMessageId,
  ]);

  // Deps must not include `caseMessagesQueryKey(...)` — it allocates a new array each call and would reconnect forever.
  useEffect(() => {
    if (!enabled || !caseId) {
      setStatus('idle');
      return;
    }

    const socket = createCaseChatSocket();
    if (!socket) {
      setStatus('idle');
      return;
    }

    setStatus('connecting');
    socketRef.current = socket;

    const messagesQueryKey = caseMessagesQueryKey(caseId, variant);

    const onConnect = () => {
      setStatus('open');
      socket.emit(CHAT_JOIN, { caseId });
    };

    const onDisconnect = () => setStatus('idle');
    const onConnectError = () => setStatus('error');

    const clearPendingIfMatches = (msg: CaseMessage) => {
      const p = pendingRef.current;
      if (!p) return;
      const byClientId = msg.clientMessageId && msg.clientMessageId === p.clientMessageId;
      if (byClientId) {
        pendingRef.current = null;
        setSendingText(null);
      }
    };

    const onMessage = (msg: CaseMessage) => {
      clearPendingIfMatches(msg);
      queryClient.setQueryData(
        messagesQueryKey,
        (prev: InfiniteData<CaseMessagesPage> | undefined) => {
          if (!prev?.pages?.length) {
            queueMicrotask(() => {
              queryClient.invalidateQueries({ queryKey: messagesQueryKey });
            });
            return prev;
          }
          const { clientMessageId: _drop, ...rest } = msg;
          const pages = prev.pages.map((page, idx) => {
            if (idx !== 0) return page;
            if (page.messages.some((m) => m.id === rest.id)) return page;
            return { ...page, messages: [...page.messages, rest] };
          });
          return { ...prev, pages };
        }
      );
    };

    const onChatError = (err: { code?: string }) => {
      if (err?.code === 'SEND') {
        pendingRef.current = null;
        setSendingText(null);
      }
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on(CHAT_MESSAGE, onMessage);
    socket.on(CHAT_ERROR, onChatError);

    if (socket.connected) {
      onConnect();
    }

    return () => {
      pendingRef.current = null;
      setSendingText(null);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off(CHAT_MESSAGE, onMessage);
      socket.off(CHAT_ERROR, onChatError);
      socket.disconnect();
      socketRef.current = null;
      setStatus('idle');
    };
  }, [caseId, enabled, queryClient, variant]);

  const send = useCallback(
    (payload: CaseChatSendPayload) => {
      const socket = socketRef.current;
      if (!socket?.connected || !caseId) return;

      const text =
        typeof payload === 'string' ? payload.trim() : (payload.text ?? '').trim();
      const assetUrl =
        typeof payload === 'string' ? '' : (payload.assetUrl ?? '').trim();
      const assetName =
        typeof payload === 'string' ? '' : (payload.assetName ?? '').trim();
      if (!text && !assetUrl) return;

      const clientMessageId = crypto.randomUUID();
      const label = text || assetName || 'Attachment';
      pendingRef.current = { clientMessageId, label };
      setSendingText(label);
      socket.emit(CHAT_SEND, {
        caseId,
        ...(text ? { text } : {}),
        ...(assetUrl ? { assetUrl, ...(assetName ? { assetName } : {}) } : {}),
        clientMessageId,
      });
    },
    [caseId]
  );

  return { status, send, sendingText };
}
